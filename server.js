const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const OpenAI = require("openai");
const nodemailer = require("nodemailer");
const { Pool } = require("pg");
const crypto = require("crypto");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { promisify } = require("util");
const { execFile } = require("child_process");
const {
  initializeOrdersEngineSchema,
  registerOrdersEngineRoutes,
  registerOrdersEngineSockets
} = require("./modules/ordersEngine");

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH"]
  }
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/img", express.static(path.join(__dirname, "img")));
app.get("/style.css", (req, res) => res.sendFile(path.join(__dirname, "style.css")));
app.get("/script.js", (req, res) => res.sendFile(path.join(__dirname, "script.js")));

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
const AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 14;
const CLIENT_DATA_KEYS = new Set([
  "beoflow_events",
  "beoflow_event_menu_links",
  "beoflow_menus",
  "beoflow_recipes",
  "beoflow_sub_recipes",
  "beoflow_inventory",
  "beoflow_shift_readiness",
  "beoflow_shift_assignment_presets",
  "beoflow_reports_feedback",
  "beoflow_smart_setup",
  "beoflow_shift_handoff_assignments",
  "beoflow_restaurants",
  "beoflow_orders",
  "beoflow_kitchen_stations"
]);
const feedbackRecipients = (process.env.FEEDBACK_EMAIL_RECIPIENTS || "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);
const authSecret = process.env.BEOFLOW_SESSION_SECRET || process.env.SESSION_SECRET || "beoflow-local-session-secret";
const DEFAULT_CLIENTS = [
  {
    code: "Strat01",
    password: "Strat01",
    displayName: "Strat01"
  },
  {
    code: "Westgate",
    password: "Westgate",
    displayName: "Westgate Casino"
  }
];

if (authSecret === "beoflow-local-session-secret" && process.env.NODE_ENV === "production") {
  console.warn("BEOFLOW_SESSION_SECRET is missing. Set it in Render before giving client access.");
}

function normalizeClientConfig(clientConfig = {}) {
  return {
    code: String(clientConfig.code || clientConfig.clientCode || "").trim(),
    password: String(clientConfig.password || ""),
    displayName: String(clientConfig.displayName || clientConfig.name || clientConfig.code || "").trim()
  };
}

function mergeClientConfigs(clientConfigs) {
  const clientsByCode = new Map();

  clientConfigs
    .map(normalizeClientConfig)
    .filter((clientConfig) => clientConfig.code && clientConfig.password)
    .forEach((clientConfig) => {
      clientsByCode.set(clientConfig.code.toLowerCase(), clientConfig);
    });

  return [...clientsByCode.values()];
}

function getConfiguredClients() {
  let configuredClients = [];

  if (process.env.BEOFLOW_CLIENTS_JSON) {
    try {
      const clients = JSON.parse(process.env.BEOFLOW_CLIENTS_JSON);
      if (Array.isArray(clients) && clients.length) {
        configuredClients = clients;
      }
    } catch (error) {
      console.warn("BEOFLOW_CLIENTS_JSON is not valid JSON. Falling back to BEOFLOW_CLIENT_CODE/PASSWORD.");
    }
  }

  if (!configuredClients.length && process.env.BEOFLOW_CLIENT_CODE && process.env.BEOFLOW_CLIENT_PASSWORD) {
    configuredClients = [
      {
        code: process.env.BEOFLOW_CLIENT_CODE,
        password: process.env.BEOFLOW_CLIENT_PASSWORD,
        displayName: process.env.BEOFLOW_CLIENT_NAME || process.env.BEOFLOW_CLIENT_CODE
      }
    ];
  }

  return mergeClientConfigs([...DEFAULT_CLIENTS, ...configuredClients]);
}

function hashPassword(password = "") {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

function timingSafeEqualText(left = "", right = "") {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function base64UrlDecode(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function signToken(payload) {
  const header = base64UrlEncode({ alg: "HS256", typ: "JWT" });
  const body = base64UrlEncode(payload);
  const signature = crypto
    .createHmac("sha256", authSecret)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

function createClientToken(client) {
  const now = Math.floor(Date.now() / 1000);
  return signToken({
    clientId: client.id,
    clientCode: client.client_code,
    iat: now,
    exp: now + AUTH_TOKEN_TTL_SECONDS
  });
}

function verifyClientToken(token = "") {
  const parts = String(token).split(".");
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", authSecret)
    .update(`${header}.${body}`)
    .digest("base64url");

  if (!timingSafeEqualText(signature, expectedSignature)) return null;

  const payload = base64UrlDecode(body);
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function getBearerToken(req) {
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function serializeClient(client) {
  return {
    id: client.id,
    clientCode: client.client_code,
    displayName: client.display_name
  };
}

async function requireClient(req, res, next) {
  try {
    requireDatabase();

    const payload = verifyClientToken(getBearerToken(req));
    if (!payload) {
      return res.status(401).json({ error: "Session expired. Sign in again." });
    }

    const result = await pool.query(
      "SELECT id, client_code, display_name FROM clients WHERE id = $1 AND client_code = $2",
      [payload.clientId, payload.clientCode]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: "Client session is not valid." });
    }

    req.client = result.rows[0];
    next();
  } catch (error) {
    next(error);
  }
}

function requireFeedbackEmailConfig() {
  const requiredKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"];
  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  if (!feedbackRecipients.length) missingKeys.push("FEEDBACK_EMAIL_RECIPIENTS");
  if (!missingKeys.length) return;

  const error = new Error(`Feedback email is not configured. Missing: ${missingKeys.join(", ")}`);
  error.statusCode = 503;
  throw error;
}

function createFeedbackTransport() {
  requireFeedbackEmailConfig();

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

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
  const imageBuffer = decodeImageBase64(imageBase64);
  const detectedMimeType = detectImageMimeType(imageBuffer);
  const normalizedMimeType = (detectedMimeType || mimeType || "").toLowerCase();

  if (SUPPORTED_VISION_MIME_TYPES.has(normalizedMimeType)) {
    return {
      imageBase64: imageBuffer.toString("base64"),
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
    await fs.writeFile(sourcePath, imageBuffer);
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

function decodeImageBase64(imageBase64 = "") {
  const rawValue = String(imageBase64 || "").trim();
  const base64Value = rawValue.includes(",") ? rawValue.split(",").pop() : rawValue;

  if (!base64Value || !/^[A-Za-z0-9+/=\s]+$/.test(base64Value)) {
    const error = new Error("The uploaded schedule file is not valid image data.");
    error.statusCode = 400;
    throw error;
  }

  const buffer = Buffer.from(base64Value.replace(/\s/g, ""), "base64");
  if (buffer.length < 12) {
    const error = new Error("The uploaded schedule file is empty or too small to read.");
    error.statusCode = 400;
    throw error;
  }

  return buffer;
}

function detectImageMimeType(buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  const gifHeader = buffer.subarray(0, 6).toString("ascii");
  if (gifHeader === "GIF87a" || gifHeader === "GIF89a") {
    return "image/gif";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  const heicBrand = buffer.length >= 12 ? buffer.subarray(4, 12).toString("ascii") : "";
  if (heicBrand.startsWith("ftyp") && /(heic|heix|hevc|hevx|mif1|msf1)/.test(heicBrand)) {
    return "image/heic";
  }

  return null;
}

async function initDB() {
  if (!pool) {
    console.warn("DATABASE_URL missing. Starting server without database-backed events/inventory.");
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      client_code TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  let defaultClientId = null;
  for (const clientConfig of getConfiguredClients()) {
    const result = await pool.query(
      `INSERT INTO clients (client_code, display_name, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (client_code)
       DO UPDATE SET
         display_name = EXCLUDED.display_name,
         password_hash = EXCLUDED.password_hash,
         updated_at = NOW()
       RETURNING id`,
      [clientConfig.code, clientConfig.displayName || clientConfig.code, hashPassword(clientConfig.password)]
    );

    if (!defaultClientId) defaultClientId = result.rows[0].id;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS client_data (
      client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      data_key TEXT NOT NULL,
      data_value JSONB NOT NULL DEFAULT 'null'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (client_id, data_key)
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS client_data_client_updated_idx
    ON client_data (client_id, updated_at DESC);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
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
  await pool.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE;");
  await pool.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS menu_id TEXT;");
  if (defaultClientId) {
    await pool.query("UPDATE events SET client_id = $1 WHERE client_id IS NULL", [defaultClientId]);
  }
  await pool.query(`
    CREATE INDEX IF NOT EXISTS events_client_created_idx
    ON events (client_id, created_at DESC);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id SERIAL PRIMARY KEY,
      client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT,
      quantity NUMERIC,
      unit TEXT,
      total_cost NUMERIC,
      storage_area TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query("ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE;");
  if (defaultClientId) {
    await pool.query("UPDATE inventory_items SET client_id = $1 WHERE client_id IS NULL", [defaultClientId]);
  }
  await pool.query(`
    CREATE INDEX IF NOT EXISTS inventory_items_client_created_idx
    ON inventory_items (client_id, created_at DESC);
  `);

  await initializeOrdersEngineSchema(pool);

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
      "assignments": {
        "mon": { "station": "", "shiftStart": "", "shiftEnd": "", "off": true },
        "tue": { "station": "", "shiftStart": "", "shiftEnd": "", "off": true },
        "wed": { "station": "", "shiftStart": "", "shiftEnd": "", "off": true },
        "thu": { "station": "", "shiftStart": "", "shiftEnd": "", "off": true },
        "fri": { "station": "", "shiftStart": "", "shiftEnd": "", "off": true },
        "sat": { "station": "", "shiftStart": "", "shiftEnd": "", "off": true },
        "sun": { "station": "", "shiftStart": "", "shiftEnd": "", "off": true }
      },
      "sourceLabel": ""
    }
  ],
  "notes": []
}

Rules:
- Read every visible day column. Put each day in assignments using keys mon, tue, wed, thu, fri, sat, sun.
- Day cells that say off/Off or have no working shift must be returned with off true and empty shiftStart/shiftEnd.
- For working day cells, set off false and include shiftStart and shiftEnd.
- Keep top-level shiftStart and shiftEnd as the first clear working shift found for that employee, for backward compatibility.
- Many schedules use two visual lines per employee: the top line has start/end/hours, and the lower line has labels like LINE or PT'S. Treat those two lines as the same employee and keep both the time and the label.
- Return an employee when at least one working day has both shiftStart and shiftEnd visible. If a label is visible but the time is not visible, mark that day off true and add a note.
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
    if (error.statusCode && error.statusCode < 500) {
      console.warn("SHIFT SCHEDULE EXTRACTION WARNING:", error.message);
    } else {
      console.error("SHIFT SCHEDULE EXTRACTION ERROR:", error);
    }
    res.status(error.statusCode || 500).json({
      error: error.message || "Failed to extract shift schedule"
    });
  }
});

app.post("/api/report-feedback", async (req, res) => {
  try {
    const { title, module, priority, status, notes, createdAt } = req.body || {};
    const feedbackTitle = String(title || "").trim();

    if (!feedbackTitle) {
      return res.status(400).json({ error: "Feedback title is required." });
    }

    const transport = createFeedbackTransport();
    const createdDate = createdAt ? new Date(createdAt) : new Date();
    const text = [
      "New BEOFlow feedback/action item",
      "",
      `Area: ${module || "Other"}`,
      `Priority: ${priority || "Medium"}`,
      `Status: ${status || "Open"}`,
      "",
      `Feedback: ${feedbackTitle}`,
      notes ? `Notes: ${notes}` : "",
      "",
      `Created: ${createdDate.toLocaleString()}`
    ].filter(Boolean).join("\n");

    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: feedbackRecipients,
      subject: `BEOFlow feedback: ${feedbackTitle}`,
      text
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("REPORT FEEDBACK EMAIL ERROR:", error);
    res.status(error.statusCode || 500).json({
      error: error.message || "Failed to send feedback email"
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

function apiStatus() {
  return {
    ok: true,
    service: "BEOFlow API",
    openai: Boolean(client),
    database: Boolean(pool),
    endpoints: {
      health: "GET /health",
      shiftSchedule: "POST /api/extract-shift-schedule",
      eventExtraction: "POST /api/extract-event",
      feedback: "POST /api/report-feedback",
      restaurants: "GET/POST /api/restaurants",
      orders: "GET/POST /api/orders",
      kitchen: "GET /api/kitchen/orders",
      tabletOrdering: "POST /api/tablet-ordering/orders",
      pos: "PATCH /api/pos/orders/:orderId/payment",
      analytics: "GET /api/analytics/orders/summary",
      staff: "GET/POST /api/staff/roles",
      realtime: "Socket.io orders engine gateway"
    }
  };
}

app.get("/api/status", (req, res) => {
  res.json(apiStatus());
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/health", (req, res) => {
  res.json(apiStatus());
});

app.post("/api/auth/login", async (req, res) => {
  try {
    requireDatabase();

    const clientCode = String(req.body.clientCode || req.body.client_id || "").trim();
    const password = String(req.body.password || "");

    if (!clientCode || !password) {
      return res.status(400).json({ error: "Client and password are required." });
    }

    const result = await pool.query(
      "SELECT id, client_code, display_name, password_hash FROM clients WHERE LOWER(client_code) = LOWER($1) LIMIT 1",
      [clientCode]
    );

    if (!result.rows.length || !timingSafeEqualText(result.rows[0].password_hash, hashPassword(password))) {
      return res.status(401).json({ error: "Invalid client or password." });
    }

    const clientRecord = result.rows[0];
    res.json({
      ok: true,
      token: createClientToken(clientRecord),
      client: serializeClient(clientRecord)
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || "Login failed." });
  }
});

app.get("/api/auth/me", requireClient, (req, res) => {
  res.json({ ok: true, client: serializeClient(req.client) });
});

app.get("/api/client-data", requireClient, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT data_key, data_value FROM client_data WHERE client_id = $1 ORDER BY data_key",
      [req.client.id]
    );

    const data = result.rows.reduce((acc, row) => {
      acc[row.data_key] = row.data_value;
      return acc;
    }, {});

    res.json({ ok: true, client: serializeClient(req.client), data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load client data." });
  }
});

app.put("/api/client-data", requireClient, async (req, res) => {
  try {
    const data = req.body.data && typeof req.body.data === "object" ? req.body.data : {};
    const entries = Object.entries(data).filter(([key]) => CLIENT_DATA_KEYS.has(key));

    for (const [key, value] of entries) {
      await pool.query(
        `INSERT INTO client_data (client_id, data_key, data_value, updated_at)
         VALUES ($1, $2, $3::jsonb, NOW())
         ON CONFLICT (client_id, data_key)
         DO UPDATE SET data_value = EXCLUDED.data_value, updated_at = NOW()`,
        [req.client.id, key, JSON.stringify(value)]
      );
    }

    res.json({ ok: true, saved: entries.map(([key]) => key) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save client data." });
  }
});

app.put("/api/client-data/:key", requireClient, async (req, res) => {
  try {
    const { key } = req.params;
    if (!CLIENT_DATA_KEYS.has(key)) {
      return res.status(400).json({ error: "Unsupported client data key." });
    }

    await pool.query(
      `INSERT INTO client_data (client_id, data_key, data_value, updated_at)
       VALUES ($1, $2, $3::jsonb, NOW())
       ON CONFLICT (client_id, data_key)
       DO UPDATE SET data_value = EXCLUDED.data_value, updated_at = NOW()`,
      [req.client.id, key, JSON.stringify(req.body.value ?? null)]
    );

    res.json({ ok: true, key });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save client data." });
  }
});

app.get("/api/extract-shift-schedule", (req, res) => {
  res.status(405).json({
    ok: false,
    error: "Use POST /api/extract-shift-schedule with imageBase64 and mimeType."
  });
});

registerOrdersEngineRoutes({
  app,
  pool,
  requireClient,
  io
});

registerOrdersEngineSockets({
  io,
  pool,
  verifyClientToken
});

// Create Event
app.post("/events", requireClient, async (req, res) => {
  try {
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
      (client_id, event_name, client_name, event_date, start_time, end_time, guests, menu_id, venue, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        req.client.id,
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
app.get("/events", requireClient, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM events WHERE client_id = $1 ORDER BY created_at DESC",
      [req.client.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Update Event
app.put("/events/:id", requireClient, async (req, res) => {
  try {
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
      WHERE id = $10 AND client_id = $11
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
        id,
        req.client.id
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
app.delete("/events/:id", requireClient, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM events WHERE id = $1 AND client_id = $2", [id, req.client.id]);

    res.json({ ok: true, message: "Event deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// Create Inventory Item
app.post("/inventory", requireClient, async (req, res) => {
  try {
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
      (client_id, name, category, quantity, unit, total_cost, storage_area)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        req.client.id,
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
app.get("/inventory", requireClient, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM inventory_items WHERE client_id = $1 ORDER BY created_at DESC",
      [req.client.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// Update Inventory Item
app.put("/inventory/:id", requireClient, async (req, res) => {
  try {
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
      WHERE id = $7 AND client_id = $8
      RETURNING *`,
      [
        name,
        category || "other",
        quantity || 0,
        unit || "units",
        total_cost || 0,
        storage_area || "Refrigerated",
        id,
        req.client.id
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
app.delete("/inventory/:id", requireClient, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM inventory_items WHERE id = $1 AND client_id = $2", [id, req.client.id]);

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
    const port = process.env.PORT || 3001;
    httpServer.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  });
