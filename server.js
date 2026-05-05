const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const { Pool } = require("pg");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { promisify } = require("util");
const { execFile } = require("child_process");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const hasDatabase = Boolean(process.env.DATABASE_URL);
const pool = hasDatabase
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    })
  : null;

const execFileAsync = promisify(execFile);
const SUPPORTED_VISION_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]);

function requireOpenAI() {
  if (client) return;

  const error = new Error("OPENAI_API_KEY is missing. Add it to .env and restart the server.");
  error.statusCode = 503;
  throw error;
}

function requireDatabase() {
  if (pool) return;

  const error = new Error("DATABASE_URL is missing. This API route is unavailable, but localStorage fallback can still be used.");
  error.statusCode = 503;
  throw error;
}

async function prepareVisionImage(imageBase64, mimeType = "") {
  const normalizedMimeType = mimeType.toLowerCase();

  if (SUPPORTED_VISION_MIME_TYPES.has(normalizedMimeType)) {
    return {
      imageBase64,
      mimeType: normalizedMimeType === "image/jpg" ? "image/jpeg" : normalizedMimeType
    };
  }

  if (!["image/heic", "image/heif"].includes(normalizedMimeType)) {
    const error = new Error("Unsupported image type. Use JPG, PNG, WEBP, GIF, HEIC, or HEIF.");
    error.statusCode = 400;
    throw error;
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "beoflow-schedule-"));
  const sourcePath = path.join(tempDir, normalizedMimeType === "image/heif" ? "schedule.heif" : "schedule.heic");
  const outputPath = path.join(tempDir, "schedule.jpg");

  try {
    await fs.writeFile(sourcePath, Buffer.from(imageBase64, "base64"));
    await execFileAsync("sips", ["-s", "format", "jpeg", sourcePath, "--out", outputPath]);
    const convertedImage = await fs.readFile(outputPath, "base64");
    return {
      imageBase64: convertedImage,
      mimeType: "image/jpeg"
    };
  } catch (error) {
    const conversionError = new Error("HEIC conversion failed. Export the photo as JPG or PNG and try again.");
    conversionError.statusCode = 400;
    throw conversionError;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function initDB() {
  if (!pool) {
    console.warn("DATABASE_URL missing. Starting server without database-backed events/inventory.");
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      event_name TEXT,
      client_name TEXT,
      event_date DATE,
      start_time TEXT,
      end_time TEXT,
      guests INTEGER,
      menu_id TEXT,
      venue TEXT,
      status TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS menu_id TEXT;");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      quantity NUMERIC,
      unit TEXT,
      total_cost NUMERIC,
      storage_area TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("✅ Database ready");
}

app.post("/api/extract-shift-schedule", async (req, res) => {
  try {
    requireOpenAI();

    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: "Missing schedule image data." });
    }

    const preparedImage = await prepareVisionImage(imageBase64, mimeType);

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
You extract kitchen employee schedules from photos of printed grid schedules.

The image may contain employee names on the left and repeated day blocks across the row. Each working shift usually has start time, end time, and hours. Cells may also include labels like LINE, PT'S, Off, or off.

Return ONLY valid JSON in this exact shape:

{
  "employees": [
    {
      "name": "",
      "role": "",
      "station": "",
      "shiftStart": "",
      "shiftEnd": "",
      "sourceLabel": ""
    }
  ],
  "notes": []
}

Rules:
- Ignore rows or day cells that only say off/Off or have no working shift.
- Return one best visible working shift per employee. If the row has multiple shifts, choose the first clear working shift in the row.
- Many schedules use two visual lines per employee: the top line has start/end/hours, and the lower line has labels like LINE or PT'S. Treat those two lines as the same employee and keep both the time and the label.
- Return an employee only when both shiftStart and shiftEnd are visible. If a label is visible but the time is not visible, do not include that employee; add a note instead.
- Normalize times to 24-hour HH:MM.
- Interpret A/a as AM and P/p as PM. If end time is earlier than start time, keep the normalized overnight end time.
- Do not include hours as a separate field.
- If a label says LINE, set role to "Line Cook" and station to "Line Support".
- If a label says PT'S, set role to "Prep Cook" and station to "Prep".
- If a label or note says broiler, grill, parrilla, carbon, charcoal, or charbroiler, set station to "Broiler/Grill".
- If the station is unclear, leave station empty.
- Use kitchen roles only. Do not invent dishwasher, steward, server, or external staff roles.
- Add a short note only for rows that are unreadable or uncertain.
              `,
            },
            {
              type: "input_image",
              image_url: `data:${preparedImage.mimeType};base64,${preparedImage.imageBase64}`,
              detail: "high"
            },
          ],
        },
      ],
    });

    const cleaned = response.output_text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    res.json({
      employees: Array.isArray(parsed.employees) ? parsed.employees : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : []
    });
  } catch (error) {
    console.error("SHIFT SCHEDULE EXTRACTION ERROR:", error);
    res.status(error.statusCode || 500).json({
      error: error.message || "Failed to extract shift schedule"
    });
  }
});

app.post("/api/extract-event", async (req, res) => {
  try {
    requireOpenAI();

    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: "Missing image data." });
    }

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
You are an AI that extracts structured event data from banquet event orders (BEO).

Return ONLY valid JSON with this exact structure:

{
  "name": "",
  "client": "",
  "date": "",
  "startTime": "",
  "endTime": "",
  "guests": "",
  "venue": "",
  "status": ""
}

Rules:
- date must be YYYY-MM-DD when possible
- time must be HH:MM (24h) when possible
- guests must be a number as a string
- status should be one of: Draft, Confirmed, In Preparation, Ready
- if missing, leave empty string
- no explanations, only JSON
              `,
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${imageBase64}`,
            },
          ],
        },
      ],
    });

    const text = response.output_text;
    console.log("RAW AI OUTPUT:", text);

    let parsed;
    try {
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("JSON PARSE ERROR:", parseError);
      return res.status(500).json({
        error: "Invalid AI response",
        raw: text
      });
    }

    res.json(parsed);
  } catch (error) {
    console.error("OPENAI ERROR:", error);
    res.status(500).json({
      error: "Extraction failed",
      details: error.message
    });
  }
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    openai: Boolean(client),
    database: Boolean(pool)
  });
});

// Create Event
app.post("/events", async (req, res) => {
  try {
    requireDatabase();

    const {
      event_name,
      client_name,
      event_date,
      start_time,
      end_time,
      guests,
      menu_id,
      venue,
      status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO events 
      (event_name, client_name, event_date, start_time, end_time, guests, menu_id, venue, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        event_name,
        client_name,
        event_date,
        start_time,
        end_time,
        guests,
        menu_id || null,
        venue,
        status || "Draft"
      ]
    );

    res.json({ ok: true, event: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save event" });
  }
});

// Get Events
app.get("/events", async (req, res) => {
  try {
    requireDatabase();

    const result = await pool.query(
      "SELECT * FROM events ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Update Event
app.put("/events/:id", async (req, res) => {
  try {
    requireDatabase();

    const { id } = req.params;
    const {
      event_name,
      client_name,
      event_date,
      start_time,
      end_time,
      guests,
      menu_id,
      venue,
      status
    } = req.body;

    const result = await pool.query(
      `UPDATE events SET
        event_name = $1,
        client_name = $2,
        event_date = $3,
        start_time = $4,
        end_time = $5,
        guests = $6,
        menu_id = $7,
        venue = $8,
        status = $9
      WHERE id = $10
      RETURNING *`,
      [
        event_name,
        client_name,
        event_date,
        start_time,
        end_time,
        guests,
        menu_id || null,
        venue,
        status || "Draft",
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ ok: true, event: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// Delete Event
app.delete("/events/:id", async (req, res) => {
  try {
    requireDatabase();

    const { id } = req.params;

    await pool.query("DELETE FROM events WHERE id = $1", [id]);

    res.json({ ok: true, message: "Event deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// Create Inventory Item
app.post("/inventory", async (req, res) => {
  try {
    requireDatabase();

    const {
      name,
      category,
      quantity,
      unit,
      total_cost,
      storage_area
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Inventory item name is required" });
    }

    const result = await pool.query(
      `INSERT INTO inventory_items
      (name, category, quantity, unit, total_cost, storage_area)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [
        name,
        category || "other",
        quantity || 0,
        unit || "units",
        total_cost || 0,
        storage_area || "Refrigerated"
      ]
    );

    res.json({ ok: true, item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save inventory item" });
  }
});

// Get Inventory
app.get("/inventory", async (req, res) => {
  try {
    requireDatabase();

    const result = await pool.query(
      "SELECT * FROM inventory_items ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// Update Inventory Item
app.put("/inventory/:id", async (req, res) => {
  try {
    requireDatabase();

    const { id } = req.params;
    const {
      name,
      category,
      quantity,
      unit,
      total_cost,
      storage_area
    } = req.body;

    const result = await pool.query(
      `UPDATE inventory_items SET
        name = $1,
        category = $2,
        quantity = $3,
        unit = $4,
        total_cost = $5,
        storage_area = $6
      WHERE id = $7
      RETURNING *`,
      [
        name,
        category || "other",
        quantity || 0,
        unit || "units",
        total_cost || 0,
        storage_area || "Refrigerated",
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.json({ ok: true, item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update inventory item" });
  }
});

// Delete Inventory Item
app.delete("/inventory/:id", async (req, res) => {
  try {
    requireDatabase();

    const { id } = req.params;

    await pool.query("DELETE FROM inventory_items WHERE id = $1", [id]);

    res.json({ ok: true, message: "Inventory item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete inventory item" });
  }
});

initDB()
  .catch((error) => {
    console.warn("Database initialization failed. Starting server with localStorage fallbacks:", error.message);
  })
  .finally(() => {
    app.listen(3001, () => {
      console.log("🚀 Server running on http://localhost:3001");
    });
  });
