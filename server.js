const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const { Pool } = require("pg");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      event_name TEXT,
      client_name TEXT,
      event_date DATE,
      start_time TEXT,
      end_time TEXT,
      guests INTEGER,
      venue TEXT,
      status TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("✅ Database ready");
}

app.post("/api/extract-event", async (req, res) => {
  try {
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

// Create Event
app.post("/events", async (req, res) => {
  try {
    const {
      event_name,
      client_name,
      event_date,
      start_time,
      end_time,
      guests,
      venue,
      status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO events 
      (event_name, client_name, event_date, start_time, end_time, guests, venue, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        event_name,
        client_name,
        event_date,
        start_time,
        end_time,
        guests,
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
    const result = await pool.query(
      "SELECT * FROM events ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Delete Event
app.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM events WHERE id = $1", [id]);

    res.json({ ok: true, message: "Event deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

initDB().then(() => {
  app.listen(3001, () => {
    console.log("🚀 Server running on http://localhost:3001");
  });
});