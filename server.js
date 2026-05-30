const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const OpenAI = require("openai");
const sharp = require("sharp");
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
app.use("/apps", express.static(path.join(__dirname, "apps")));
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
const LINEOPS_AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;
const LINEOPS_PASSWORD_ITERATIONS = 120000;
const PUBLIC_SIGNUP_PASSWORD_MIN_LENGTH = 8;
const LINEOPS_BUSINESS_TYPES = new Set(["Restaurant", "Hospitality", "Casino", "Retail", "Warehouse", "Other"]);
const LINEOPS_TEAM_SIZES = new Set(["1-10", "11-50", "51-200", "201+"]);
const LINEOPS_DEPARTMENTS = new Set(["Operations", "Front of House", "Guest Services", "Fulfillment", "Facilities", "Safety"]);
const LINEOPS_GOALS = new Set([
  "Coordinate teams",
  "Improve visibility",
  "Reduce delays",
  "Standardize workflows",
  "Manage incidents",
  "Track performance"
]);
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
const bastidaSystemsEmail = String(process.env.BASTIDA_SYSTEMS_EMAIL || "bastidasystems@gmail.com").trim().toLowerCase();
const westgateAccountEmail = String(process.env.WESTGATE_ACCOUNT_EMAIL || "westgate@bastidasystems.io").trim().toLowerCase();
const bastidaSyncSecret = String(process.env.BASTIDA_SYNC_SECRET || "").trim();
const filtraCoreApiBaseURL = String(process.env.FILTRACORE_API_BASE_URL || "").trim().replace(/\/+$/, "");
const supabaseURL = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const supabaseServiceRoleKey = String(
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  ""
).trim();
const supabaseAnonKey = String(
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ""
).trim();
const allowLocalAuthFallback = String(process.env.BEOFLOW_ALLOW_LOCAL_AUTH_FALLBACK || "").trim().toLowerCase() === "true";
const resetConfiguredClientPasswords = String(process.env.BEOFLOW_RESET_CLIENT_PASSWORDS || "").trim().toLowerCase() === "true";
const DISABLED_CLIENT_CODES = new Set([
  "strat01",
  "strat01@bastidasystems.io",
  "ptslineops",
  "ptskitchen@lineops.io",
  "demo@bastidasystems.io",
  "demo@lineops.io",
  "demo@filtracore.io"
]);
const UNIFIED_ACCOUNT_ALIASES = new Map([
  ["bastida01", bastidaSystemsEmail],
  ["westgate", westgateAccountEmail],
  ["west@gmail.com", westgateAccountEmail]
]);
const DEFAULT_CLIENTS = [
  {
    code: bastidaSystemsEmail,
    password: process.env.BASTIDA_SYSTEMS_PASSWORD || "Bastida01",
    displayName: "Bastida Systems"
  },
  {
    code: westgateAccountEmail,
    password: process.env.WESTGATE_ACCOUNT_PASSWORD || "Westgate",
    displayName: "Westgate Casino"
  }
];

const LEGACY_CLIENT_RENAMES = [
  {
    fromCode: "Bastida01",
    toCode: bastidaSystemsEmail,
    defaultPassword: "Bastida01",
    displayName: "Bastida Systems"
  },
  {
    fromCode: "Westgate",
    toCode: westgateAccountEmail,
    defaultPassword: "Westgate",
    displayName: "Westgate Casino"
  }
];

if (authSecret === "beoflow-local-session-secret" && process.env.NODE_ENV === "production") {
  console.warn("BEOFLOW_SESSION_SECRET is missing. Set it in Render before giving client access.");
}

function normalizeClientConfig(clientConfig = {}) {
  const rawCode = String(clientConfig.code || clientConfig.clientCode || "").trim();
  const legacyRename = LEGACY_CLIENT_RENAMES.find(
    (rename) => rename.fromCode.toLowerCase() === rawCode.toLowerCase()
  );
  const rawPassword = String(clientConfig.password || "");
  const rawDisplayName = String(clientConfig.displayName || clientConfig.name || rawCode || "").trim();

  const normalizedConfig = {
    code: legacyRename?.toCode || rawCode,
    password: legacyRename && rawPassword.toLowerCase() === legacyRename.fromCode.toLowerCase()
      ? legacyRename.defaultPassword
      : rawPassword,
    displayName: legacyRename && (!rawDisplayName || rawDisplayName.toLowerCase() === legacyRename.fromCode.toLowerCase())
      ? legacyRename.displayName
      : rawDisplayName,
    modules: Array.isArray(clientConfig.modules)
      ? clientConfig.modules.map((moduleKey) => String(moduleKey).trim()).filter(Boolean)
      : null,
    defaultModule: clientConfig.defaultModule ? String(clientConfig.defaultModule).trim() : "",
    brandTitle: clientConfig.brandTitle ? String(clientConfig.brandTitle).trim() : "",
    brandSubtitle: clientConfig.brandSubtitle ? String(clientConfig.brandSubtitle).trim() : "",
    lockedModulesVisible: Boolean(clientConfig.lockedModulesVisible)
  };

  return normalizedConfig;
}

function mergeClientConfigs(clientConfigs) {
  const clientsByCode = new Map();

  clientConfigs
    .map(normalizeClientConfig)
    .filter((clientConfig) => clientConfig.code && clientConfig.password)
    .forEach((clientConfig) => {
      clientsByCode.set(clientConfig.code.toLowerCase(), clientConfig);
    });

  return [...clientsByCode.values()].filter((clientConfig) => !isDisabledClientCode(clientConfig.code));
}

function isBastidaClientCode(value = "") {
  const normalized = resolveUnifiedAccountIdentifier(value);
  return normalized === bastidaSystemsEmail;
}

function isDisabledClientCode(value = "") {
  return DISABLED_CLIENT_CODES.has(normalizeEmail(value));
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

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function resolveUnifiedAccountIdentifier(value = "") {
  const normalized = normalizeEmail(value);
  return UNIFIED_ACCOUNT_ALIASES.get(normalized) || normalized;
}

function unifiedAccountCandidates(value = "") {
  const normalized = normalizeEmail(value);
  return [...new Set([resolveUnifiedAccountIdentifier(normalized), normalized].filter(Boolean))];
}

function isValidLoginIdentifier(value = "") {
  const normalized = normalizeEmail(value);
  return isValidEmail(normalized) || /^[a-z0-9][a-z0-9._-]{2,63}$/.test(normalized);
}

function normalizeLineOpsBusinessType(value = "") {
  const match = [...LINEOPS_BUSINESS_TYPES].find(
    (businessType) => businessType.toLowerCase() === String(value || "").trim().toLowerCase()
  );
  return match || "Other";
}

function normalizeLineOpsOnboarding(value = {}) {
  const onboarding = value && typeof value === "object" ? value : {};
  const teamSize = LINEOPS_TEAM_SIZES.has(onboarding.teamSize) ? onboarding.teamSize : null;
  const department = LINEOPS_DEPARTMENTS.has(onboarding.department) ? onboarding.department : null;
  const goals = Array.isArray(onboarding.goals)
    ? onboarding.goals.filter((goal) => LINEOPS_GOALS.has(goal))
    : [];

  return {
    teamSize,
    department,
    goals,
    isComplete: Boolean(onboarding.isComplete)
  };
}

function hashLineOpsPassword(password = "") {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(String(password), salt, LINEOPS_PASSWORD_ITERATIONS, 32, "sha256")
    .toString("hex");

  return `pbkdf2$${LINEOPS_PASSWORD_ITERATIONS}$${salt}$${hash}`;
}

function verifyLineOpsPassword(password = "", storedHash = "") {
  const parts = String(storedHash).split("$");
  if (parts.length === 4 && parts[0] === "pbkdf2") {
    const iterations = Number(parts[1]);
    const salt = parts[2];
    const expectedHash = parts[3];
    const actualHash = crypto
      .pbkdf2Sync(String(password), salt, iterations, 32, "sha256")
      .toString("hex");
    return timingSafeEqualText(actualHash, expectedHash);
  }

  return timingSafeEqualText(hashPassword(password), storedHash);
}

function timingSafeEqualText(left = "", right = "") {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

async function migrateLegacyClients() {
  for (const rename of LEGACY_CLIENT_RENAMES) {
    const legacyResult = await pool.query(
      "SELECT id FROM clients WHERE LOWER(client_code) = LOWER($1) LIMIT 1",
      [rename.fromCode]
    );
    if (!legacyResult.rows.length) continue;

    const targetResult = await pool.query(
      "SELECT id FROM clients WHERE LOWER(client_code) = LOWER($1) LIMIT 1",
      [rename.toCode]
    );
    const legacyId = legacyResult.rows[0].id;

    if (!targetResult.rows.length) {
      await pool.query(
        `UPDATE clients
         SET client_code = $1,
             display_name = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [rename.toCode, rename.displayName, legacyId]
      );
      continue;
    }

    const targetId = targetResult.rows[0].id;
    await pool.query(
      `INSERT INTO client_data (client_id, data_key, context_id, data_value, updated_at)
       SELECT $1, data_key, context_id, data_value, updated_at
       FROM client_data
       WHERE client_id = $2
       ON CONFLICT (client_id, data_key, context_id) DO NOTHING`,
      [targetId, legacyId]
    );
    await pool.query("DELETE FROM clients WHERE id = $1", [legacyId]);
  }
}

async function deleteDisabledAccounts() {
  const disabledCodes = [...DISABLED_CLIENT_CODES];
  if (!disabledCodes.length) return;

  await pool.query(
    "DELETE FROM clients WHERE LOWER(client_code) = ANY($1::text[])",
    [disabledCodes]
  );
  await pool.query(
    "DELETE FROM lineops_users WHERE LOWER(email) = ANY($1::text[])",
    [disabledCodes]
  );
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

function createLineOpsUserToken(user) {
  const now = Math.floor(Date.now() / 1000);
  return signToken({
    type: "lineops",
    lineOpsUserId: user.id,
    email: user.email,
    iat: now,
    exp: now + LINEOPS_AUTH_TOKEN_TTL_SECONDS
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

function verifyLineOpsUserToken(token = "") {
  const payload = verifyClientToken(token);
  if (!payload || payload.type !== "lineops" || !payload.lineOpsUserId) return null;
  return payload;
}

function getBearerToken(req) {
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function serializeClient(client) {
  const clientAccess = getConfiguredClients().find(
    (clientConfig) => clientConfig.code.toLowerCase() === String(client.client_code || "").toLowerCase()
  ) || {};
  const clientCode = String(client.client_code || "");
  const normalizedClientCode = resolveUnifiedAccountIdentifier(clientCode);
  const isWestgateAccount = normalizedClientCode === westgateAccountEmail;
  const isBastidaAccount = normalizedClientCode === bastidaSystemsEmail;
  const isConfiguredSpecialAccount = Boolean(clientAccess.code);
  const requiresRestaurantSelection = !isBastidaAccount && !isWestgateAccount && !isConfiguredSpecialAccount;

  return {
    id: client.id,
    businessId: client.business_id,
    clientCode: client.client_code,
    displayName: client.display_name,
    accountType: isBastidaAccount
      ? "bastida"
      : isWestgateAccount
        ? "westgate"
        : requiresRestaurantSelection
          ? "client"
          : "special",
    requiresRestaurantSelection,
    modules: Array.isArray(clientAccess.modules) ? clientAccess.modules : undefined,
    defaultModule: clientAccess.defaultModule || undefined,
    brandTitle: clientAccess.brandTitle || undefined,
    brandSubtitle: clientAccess.brandSubtitle || undefined,
    lockedModulesVisible: clientAccess.lockedModulesVisible || undefined
  };
}

function readJsonObject(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === "object" && !Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function serializeLineOpsUser(user) {
  return {
    id: user.id,
    businessName: user.business_name,
    fullName: user.full_name,
    email: user.email,
    businessType: normalizeLineOpsBusinessType(user.business_type),
    createdAt: user.created_at instanceof Date ? user.created_at.toISOString() : user.created_at
  };
}

function createLineOpsWorkspace(user, onboardingProfile = {}, existingWorkspace = {}) {
  const account = serializeLineOpsUser(user);
  const onboarding = normalizeLineOpsOnboarding(onboardingProfile);
  const department = onboarding.department || "Operations";
  const teamSize = onboarding.teamSize || "11-50";
  const goals = onboarding.goals.length
    ? onboarding.goals
    : ["Coordinate teams", "Improve visibility", "Standardize workflows"];
  const createdAt = existingWorkspace.createdAt || new Date().toISOString();
  const workspaceId = existingWorkspace.id || crypto.randomUUID();

  return {
    id: workspaceId,
    accountID: account.id,
    businessName: account.businessName,
    businessType: account.businessType,
    onboarding: {
      teamSize: onboarding.teamSize,
      department: onboarding.department,
      goals: onboarding.goals,
      isComplete: onboarding.isComplete
    },
    metrics: [
      {
        id: crypto.randomUUID(),
        title: "Active operations",
        value: "12",
        trend: "+3 since open",
        symbolName: "waveform.path.ecg",
        tone: "mint"
      },
      {
        id: crypto.randomUUID(),
        title: "Tasks coordinated",
        value: "38",
        trend: "91% on time",
        symbolName: "checklist.checked",
        tone: "cyan"
      },
      {
        id: crypto.randomUUID(),
        title: "Workflow health",
        value: "96%",
        trend: "4 blockers cleared",
        symbolName: "chart.line.uptrend.xyaxis",
        tone: "blue"
      },
      {
        id: crypto.randomUUID(),
        title: "Team coverage",
        value: teamSize,
        trend: `Ready for ${account.businessType.toLowerCase()}`,
        symbolName: "person.3.sequence",
        tone: "amber"
      }
    ],
    operations: [
      {
        id: crypto.randomUUID(),
        title: `${department} readiness board`,
        owner: "Maya Chen",
        location: `${account.businessType} operations`,
        status: "Active",
        progress: 0.82,
        nextCheck: "Next check in 18 min",
        tone: "mint"
      },
      {
        id: crypto.randomUUID(),
        title: "Priority handoff queue",
        owner: "Jordan Lee",
        location: "Cross-team coordination",
        status: "Watching",
        progress: 0.64,
        nextCheck: "Review at 2:30 PM",
        tone: "cyan"
      },
      {
        id: crypto.randomUUID(),
        title: "Exception response lane",
        owner: "Sam Rivera",
        location: "Manager escalation",
        status: "Blocked",
        progress: 0.36,
        nextCheck: "Waiting on supplier update",
        tone: "rose"
      }
    ],
    tasks: [
      {
        id: crypto.randomUUID(),
        title: "Confirm staffing coverage for peak window",
        owner: account.fullName,
        dueText: "10:30 AM",
        priority: "High",
        status: "In Progress",
        department
      },
      {
        id: crypto.randomUUID(),
        title: "Approve inventory variance note",
        owner: "Maya Chen",
        dueText: "11:00 AM",
        priority: "Medium",
        status: "Review",
        department: "Controls"
      },
      {
        id: crypto.randomUUID(),
        title: "Publish shift handoff summary",
        owner: "Jordan Lee",
        dueText: "12:15 PM",
        priority: "High",
        status: "Queued",
        department
      },
      {
        id: crypto.randomUUID(),
        title: "Audit safety checklist completion",
        owner: "Sam Rivera",
        dueText: "Today",
        priority: "Medium",
        status: "In Progress",
        department: "Safety"
      },
      {
        id: crypto.randomUUID(),
        title: "Send daily operations recap",
        owner: "LineOps Automations",
        dueText: "4:45 PM",
        priority: "Low",
        status: "Queued",
        department: "Leadership"
      }
    ],
    workflows: [
      {
        id: crypto.randomUUID(),
        title: "Daily readiness",
        stage: "In Progress",
        owner: department,
        updatedText: "Updated 4 min ago",
        progress: 0.72,
        tone: "mint"
      },
      {
        id: crypto.randomUUID(),
        title: "Incident follow-up",
        stage: "Assigned",
        owner: "Safety",
        updatedText: "Assigned to Sam",
        progress: 0.28,
        tone: "amber"
      },
      {
        id: crypto.randomUUID(),
        title: "Inventory variance",
        stage: "Review",
        owner: "Controls",
        updatedText: "Needs approval",
        progress: 0.88,
        tone: "blue"
      },
      {
        id: crypto.randomUUID(),
        title: "End-of-day closeout",
        stage: "Intake",
        owner: "Operations",
        updatedText: "Starts at 3:30 PM",
        progress: 0.12,
        tone: "violet"
      }
    ],
    notifications: [
      {
        id: crypto.randomUUID(),
        title: "Sample workspace created",
        message: `${account.businessName} is ready with demo tasks, workflows, and notifications.`,
        timeText: "Now",
        tone: "mint"
      },
      {
        id: crypto.randomUUID(),
        title: "Workflow moved to review",
        message: "Inventory variance is waiting for manager approval.",
        timeText: "8 min ago",
        tone: "blue"
      },
      {
        id: crypto.randomUUID(),
        title: "Coverage risk detected",
        message: "Peak window coverage is below the preferred threshold.",
        timeText: "15 min ago",
        tone: "amber"
      },
      {
        id: crypto.randomUUID(),
        title: goals[0],
        message: "LineOps generated a coordination plan for today's active work.",
        timeText: "28 min ago",
        tone: "cyan"
      }
    ],
    insights: [
      {
        id: crypto.randomUUID(),
        title: "Coordination score",
        detail: "Tasks, handoffs, and workflow updates are moving on schedule.",
        value: "92",
        tone: "mint"
      },
      {
        id: crypto.randomUUID(),
        title: "Potential delay",
        detail: "One exception lane needs action before the afternoon peak.",
        value: "1",
        tone: "amber"
      },
      {
        id: crypto.randomUUID(),
        title: "Automation coverage",
        detail: "Recurring workflows are ready for this business template.",
        value: "7",
        tone: "cyan"
      }
    ],
    createdAt
  };
}

async function ensureLineOpsWorkspace(user) {
  const existingWorkspace = readJsonObject(user.workspace, {});
  if (existingWorkspace.id && existingWorkspace.accountID) return existingWorkspace;

  const onboarding = normalizeLineOpsOnboarding(readJsonObject(user.onboarding_profile, {}));
  const workspace = createLineOpsWorkspace(user, onboarding, existingWorkspace);
  await pool.query(
    `UPDATE lineops_users
     SET workspace = $1::jsonb,
         onboarding_profile = $2::jsonb,
         updated_at = NOW()
     WHERE id = $3`,
    [JSON.stringify(workspace), JSON.stringify(workspace.onboarding), user.id]
  );
  return workspace;
}

function serializeLineOpsAdminUser(user) {
  const onboarding = normalizeLineOpsOnboarding(readJsonObject(user.onboarding_profile, {}));
  const workspace = readJsonObject(user.workspace, {});

  return {
    id: user.id,
    businessName: user.business_name,
    fullName: user.full_name,
    email: user.email,
    businessType: normalizeLineOpsBusinessType(user.business_type),
    teamSize: onboarding.teamSize,
    department: onboarding.department,
    goals: onboarding.goals,
    onboardingComplete: onboarding.isComplete,
    activeOperations: Array.isArray(workspace.operations) ? workspace.operations.length : 0,
    openTasks: Array.isArray(workspace.tasks)
      ? workspace.tasks.filter((task) => task.status !== "Done").length
      : 0,
    deletedAt: user.deleted_at instanceof Date ? user.deleted_at.toISOString() : user.deleted_at,
    createdAt: user.created_at instanceof Date ? user.created_at.toISOString() : user.created_at,
    updatedAt: user.updated_at instanceof Date ? user.updated_at.toISOString() : user.updated_at
  };
}

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isSupabaseAuthConfigured() {
  return Boolean(supabaseURL && supabaseServiceRoleKey);
}

function supabaseAuthURL(pathname = "") {
  return `${supabaseURL}/auth/v1${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function supabaseAdminHeaders() {
  return {
    apikey: supabaseServiceRoleKey,
    Authorization: `Bearer ${supabaseServiceRoleKey}`,
    "Content-Type": "application/json"
  };
}

async function readSupabaseBody(response) {
  const rawBody = await response.text();
  if (!rawBody) return {};

  try {
    return JSON.parse(rawBody);
  } catch {
    return { message: rawBody };
  }
}

function getSupabaseErrorMessage(body = {}, fallback = "Supabase Auth request failed.") {
  return String(
    body.msg ||
    body.message ||
    body.error_description ||
    body.error ||
    fallback
  ).trim();
}

function normalizeSupabaseUser(body = {}) {
  return body.user && typeof body.user === "object" ? body.user : body;
}

function requireSupabaseSignupConfig() {
  if (isSupabaseAuthConfigured() || allowLocalAuthFallback) return;
  throw httpError(
    503,
    "Supabase Auth is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before creating client accounts."
  );
}

async function createSupabaseAuthUser(account) {
  requireSupabaseSignupConfig();

  if (!isSupabaseAuthConfigured()) {
    return {
      id: crypto.randomUUID(),
      email: account.email,
      localFallback: true
    };
  }

  const response = await fetch(supabaseAuthURL("/admin/users"), {
    method: "POST",
    headers: supabaseAdminHeaders(),
    body: JSON.stringify({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        business_name: account.businessName,
        full_name: account.fullName,
        business_type: account.businessType,
        beoflow_account_type: "client"
      }
    })
  });

  const body = await readSupabaseBody(response);
  if (!response.ok) {
    const message = getSupabaseErrorMessage(body, "Supabase Auth user could not be created.");
    if (response.status === 400 || response.status === 409 || response.status === 422) {
      const normalizedMessage = message.toLowerCase();
      if (normalizedMessage.includes("already") || normalizedMessage.includes("registered")) {
        throw httpError(409, "An account already exists for this email. Sign in instead.");
      }
    }
    if (response.status === 401 || response.status === 403) {
      throw httpError(503, "Supabase Auth service-role credentials are invalid.");
    }
    throw httpError(502, message || "Supabase Auth user could not be created.");
  }

  const user = normalizeSupabaseUser(body);
  if (!user.id) {
    throw httpError(502, "Supabase Auth did not return a user id.");
  }

  return user;
}

async function deleteSupabaseAuthUser(authUserId) {
  if (!isSupabaseAuthConfigured() || !authUserId) return;

  for (const pathname of [`/admin/users/${encodeURIComponent(authUserId)}`, `/admin/user/${encodeURIComponent(authUserId)}`]) {
    try {
      const response = await fetch(supabaseAuthURL(pathname), {
        method: "DELETE",
        headers: supabaseAdminHeaders()
      });
      if (response.ok || response.status === 404) return;
    } catch (error) {
      console.warn("Supabase Auth cleanup failed:", error.message);
      return;
    }
  }
}

async function signInSupabaseAuthUser(email, password) {
  const signInKey = supabaseAnonKey || supabaseServiceRoleKey;
  if (!supabaseURL || !signInKey) {
    if (allowLocalAuthFallback) return null;
    throw httpError(503, "Supabase Auth is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.");
  }

  const response = await fetch(supabaseAuthURL("/token?grant_type=password"), {
    method: "POST",
    headers: {
      apikey: signInKey,
      Authorization: `Bearer ${signInKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const body = await readSupabaseBody(response);
  if (!response.ok) {
    const message = getSupabaseErrorMessage(body, "Invalid client or password.");
    if (response.status === 400 || response.status === 401 || response.status === 422) {
      throw httpError(401, "Invalid client or password.");
    }
    throw httpError(502, message || "Supabase Auth sign in failed.");
  }

  const user = normalizeSupabaseUser(body);
  if (!user.id) {
    throw httpError(502, "Supabase Auth did not return a signed-in user.");
  }

  return {
    session: body,
    user
  };
}

async function findClientByLoginIdentifier(rawIdentifier = "") {
  const clientCode = resolveUnifiedAccountIdentifier(rawIdentifier);
  const result = await pool.query(
    `SELECT id, business_id, auth_user_id, client_code, display_name, password_hash
     FROM clients
     WHERE LOWER(client_code) = ANY($1::text[])
     ORDER BY CASE WHEN LOWER(client_code) = LOWER($2) THEN 0 ELSE 1 END
     LIMIT 1`,
    [unifiedAccountCandidates(rawIdentifier), clientCode]
  );
  return result.rows[0] || null;
}

function isLegacyClientLoginAllowed(clientRecord = {}) {
  if (!clientRecord.id) return false;
  return !serializeClient(clientRecord).requiresRestaurantSelection;
}

async function findClientBySupabaseUser(authUserId, email = "") {
  const normalizedEmail = normalizeEmail(email);
  const result = await pool.query(
    `SELECT c.id, c.business_id, c.auth_user_id, c.client_code, c.display_name
     FROM clients c
     LEFT JOIN user_profiles p ON p.client_id = c.id
     WHERE c.auth_user_id = $1
        OR p.auth_user_id = $1
        OR ($2 <> '' AND LOWER(c.client_code) = LOWER($2))
        OR ($2 <> '' AND LOWER(p.email) = LOWER($2))
     ORDER BY
       CASE
         WHEN c.auth_user_id = $1 THEN 0
         WHEN p.auth_user_id = $1 THEN 1
         ELSE 2
       END
     LIMIT 1`,
    [authUserId, normalizedEmail]
  );

  return result.rows[0] || null;
}

async function ensureSupabaseProfileLink(clientRecord, authUser = {}) {
  if (!clientRecord?.id || !authUser.id) {
    throw httpError(403, "BEOFlow profile is missing for this Supabase account.");
  }

  if (clientRecord.auth_user_id && String(clientRecord.auth_user_id) !== String(authUser.id)) {
    throw httpError(403, "This Supabase account is linked to a different BEOFlow profile.");
  }

  const updateResult = await pool.query(
    `UPDATE clients
     SET auth_user_id = $1,
         updated_at = NOW()
     WHERE id = $2
       AND (auth_user_id IS NULL OR auth_user_id = $1)
     RETURNING id, business_id, auth_user_id, client_code, display_name`,
    [authUser.id, clientRecord.id]
  );

  if (!updateResult.rows.length) {
    throw httpError(403, "This Supabase account is linked to a different BEOFlow profile.");
  }

  const linkedClient = updateResult.rows[0];
  const metadata = authUser.user_metadata && typeof authUser.user_metadata === "object"
    ? authUser.user_metadata
    : {};
  const profileEmail = normalizeEmail(authUser.email || clientRecord.client_code);
  const fullName = String(metadata.full_name || metadata.name || linkedClient.display_name || profileEmail).trim();

  await pool.query(
    `INSERT INTO user_profiles (auth_user_id, client_id, business_id, email, full_name, account_type)
     VALUES ($1, $2, $3, $4, $5, 'client')
     ON CONFLICT (auth_user_id)
     DO UPDATE SET
       client_id = EXCLUDED.client_id,
       business_id = EXCLUDED.business_id,
       email = EXCLUDED.email,
       full_name = EXCLUDED.full_name,
       updated_at = NOW()`,
    [
      authUser.id,
      linkedClient.id,
      linkedClient.business_id,
      profileEmail,
      fullName || linkedClient.display_name || profileEmail
    ]
  );

  return linkedClient;
}

function normalizeUnifiedAccountPayload(account = {}) {
  const email = resolveUnifiedAccountIdentifier(account.email || account.login || account.clientCode);
  return {
    email,
    password: account.password ? String(account.password) : "",
    businessName: String(account.businessName || account.business_name || account.displayName || "").trim(),
    fullName: String(account.fullName || account.full_name || account.name || "").trim(),
    businessType: normalizeLineOpsBusinessType(account.businessType || account.business_type),
    onboarding: normalizeLineOpsOnboarding(account.onboarding || account.onboardingProfile || {})
  };
}

function unifiedLineOpsSeedAccounts() {
  return [
    {
      email: bastidaSystemsEmail,
      password: process.env.BASTIDA_SYSTEMS_PASSWORD || "",
      businessName: "Bastida Systems",
      fullName: "Bastida Systems Admin",
      businessType: "Other",
      onboarding: {
        teamSize: "1-10",
        department: "Operations",
        goals: ["Coordinate teams", "Improve visibility", "Track performance"],
        isComplete: true
      }
    },
    {
      email: westgateAccountEmail,
      password: process.env.WESTGATE_ACCOUNT_PASSWORD || "Westgate",
      businessName: "Westgate",
      fullName: "Westgate Admin",
      businessType: "Casino",
      onboarding: {
        teamSize: "51-200",
        department: "Operations",
        goals: ["Coordinate teams", "Standardize workflows", "Track performance"],
        isComplete: true
      },
      candidates: ["westgate", "west@gmail.com"]
    }
  ];
}

async function upsertBeoflowClientAccount(account, { resetPassword = false, skipIfMissingPassword = false } = {}) {
  if (!account.email || !isValidEmail(account.email)) {
    throw httpError(400, "A valid unified account email is required.");
  }

  if (!account.password) {
    const existing = await pool.query(
      "SELECT id FROM clients WHERE LOWER(client_code) = LOWER($1) LIMIT 1",
      [account.email]
    );
    if (!existing.rows.length) {
      if (skipIfMissingPassword) return null;
      throw httpError(400, "Password is required for a new web system account.");
    }
  }

  const displayName = account.businessName || account.fullName || account.email;
  const passwordHash = account.password ? hashPassword(account.password) : "";
  const result = await pool.query(
    `INSERT INTO clients (client_code, display_name, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (client_code)
     DO UPDATE SET
       display_name = EXCLUDED.display_name,
       password_hash = CASE
         WHEN $4::boolean THEN EXCLUDED.password_hash
         ELSE clients.password_hash
       END,
       updated_at = NOW()
     RETURNING id, business_id, client_code, display_name`,
    [account.email, displayName, passwordHash || hashPassword(crypto.randomUUID()), Boolean(account.password && resetPassword)]
  );

  return result.rows[0];
}

async function upsertLineOpsAccount(account, { resetPassword = false, candidates = [] } = {}) {
  if (!account.email || !isValidEmail(account.email)) {
    throw httpError(400, "A valid LineOps account email is required.");
  }

  const candidateEmails = [
    account.email,
    ...unifiedAccountCandidates(account.email),
    ...candidates.flatMap((candidate) => unifiedAccountCandidates(candidate))
  ].map(normalizeEmail);
  const uniqueCandidates = [...new Set(candidateEmails.filter(Boolean))];

  const existingResult = await pool.query(
    `SELECT id, business_name, full_name, email, business_type, password_hash, onboarding_profile, workspace, created_at, updated_at, deleted_at
     FROM lineops_users
     WHERE LOWER(email) = ANY($1::text[])
     ORDER BY
       CASE WHEN LOWER(email) = LOWER($2) THEN 0 ELSE 1 END,
       CASE WHEN deleted_at IS NULL THEN 0 ELSE 1 END,
       created_at ASC
     LIMIT 1`,
    [uniqueCandidates, account.email]
  );

  const onboarding = normalizeLineOpsOnboarding({
    ...readJsonObject(existingResult.rows[0]?.onboarding_profile, {}),
    ...account.onboarding
  });
  const businessName = account.businessName || existingResult.rows[0]?.business_name || "Business Workspace";
  const fullName = account.fullName || existingResult.rows[0]?.full_name || "Workspace Admin";
  const businessType = normalizeLineOpsBusinessType(account.businessType || existingResult.rows[0]?.business_type);
  const shouldUpdatePassword = Boolean(account.password && (resetPassword || !existingResult.rows.length));

  if (!existingResult.rows.length) {
    if (!account.password) {
      throw httpError(400, "Password is required for a new LineOps account.");
    }

    const insertResult = await pool.query(
      `INSERT INTO lineops_users (id, business_name, full_name, email, password_hash, business_type, onboarding_profile, workspace)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, '{}'::jsonb)
       RETURNING id, business_name, full_name, email, business_type, onboarding_profile, workspace, created_at, updated_at, deleted_at`,
      [
        crypto.randomUUID(),
        businessName,
        fullName,
        account.email,
        hashLineOpsPassword(account.password),
        businessType,
        JSON.stringify(onboarding)
      ]
    );
    const user = insertResult.rows[0];
    const workspace = createLineOpsWorkspace(user, onboarding);
    const updateResult = await pool.query(
      `UPDATE lineops_users
       SET workspace = $1::jsonb,
           onboarding_profile = $2::jsonb,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, business_name, full_name, email, business_type, onboarding_profile, workspace, created_at, updated_at, deleted_at`,
      [JSON.stringify(workspace), JSON.stringify(workspace.onboarding), user.id]
    );
    return updateResult.rows[0];
  }

  const existingUser = existingResult.rows[0];
  const draft = {
    ...existingUser,
    business_name: businessName,
    full_name: fullName,
    email: account.email,
    business_type: businessType
  };
  const workspace = createLineOpsWorkspace(draft, onboarding, readJsonObject(existingUser.workspace, {}));
  const updateResult = await pool.query(
    `UPDATE lineops_users
     SET business_name = $1,
         full_name = $2,
         email = $3,
         password_hash = CASE WHEN $4::boolean THEN $5 ELSE password_hash END,
         business_type = $6,
         onboarding_profile = $7::jsonb,
         workspace = $8::jsonb,
         deleted_at = NULL,
         updated_at = NOW()
     WHERE id = $9
     RETURNING id, business_name, full_name, email, business_type, onboarding_profile, workspace, created_at, updated_at, deleted_at`,
    [
      businessName,
      fullName,
      account.email,
      shouldUpdatePassword,
      shouldUpdatePassword ? hashLineOpsPassword(account.password) : existingUser.password_hash,
      businessType,
      JSON.stringify(onboarding),
      JSON.stringify(workspace),
      existingUser.id
    ]
  );
  return updateResult.rows[0];
}

async function ensureUnifiedBeoflowAccount(accountInput, options = {}) {
  const account = normalizeUnifiedAccountPayload(accountInput);
  const resetPassword = Boolean(options.resetPassword || accountInput.resetPassword);
  const candidates = options.candidates || [];

  await upsertBeoflowClientAccount(account, { resetPassword });
  return upsertLineOpsAccount(account, { resetPassword, candidates });
}

function normalizePublicSignupPayload(body = {}) {
  return {
    email: normalizeEmail(body.email || body.clientCode || body.login),
    password: String(body.password || ""),
    businessName: String(body.businessName || body.business_name || body.displayName || "").trim(),
    fullName: String(body.fullName || body.full_name || body.name || "").trim(),
    businessType: normalizeLineOpsBusinessType(body.businessType || body.business_type || "Other"),
    onboarding: normalizeLineOpsOnboarding({
      teamSize: body.teamSize,
      department: body.department || "Operations",
      goals: Array.isArray(body.goals) ? body.goals : ["Coordinate teams", "Improve visibility"],
      isComplete: false
    })
  };
}

async function createPublicSignupAccount(account) {
  const existingResult = await pool.query(
    `SELECT source
     FROM (
       SELECT 'client' AS source
       FROM clients
       WHERE LOWER(client_code) = LOWER($1)
       UNION ALL
       SELECT 'profile' AS source
       FROM user_profiles
       WHERE LOWER(email) = LOWER($1)
       UNION ALL
       SELECT 'lineops' AS source
       FROM lineops_users
       WHERE LOWER(email) = LOWER($1)
         AND deleted_at IS NULL
     ) existing_accounts
     LIMIT 1`,
    [account.email]
  );

  if (existingResult.rows.length) {
    throw httpError(409, "An account already exists for this email. Sign in instead.");
  }

  const supabaseUser = await createSupabaseAuthUser(account);
  const authUserId = supabaseUser.id;
  const db = await pool.connect();
  try {
    await db.query("BEGIN");

    const raceCheckResult = await db.query(
      `SELECT source
       FROM (
         SELECT 'client' AS source
         FROM clients
         WHERE LOWER(client_code) = LOWER($1)
            OR auth_user_id = $2
         UNION ALL
         SELECT 'profile' AS source
         FROM user_profiles
         WHERE LOWER(email) = LOWER($1)
            OR auth_user_id = $2
         UNION ALL
         SELECT 'lineops' AS source
         FROM lineops_users
         WHERE LOWER(email) = LOWER($1)
           AND deleted_at IS NULL
       ) existing_accounts
       LIMIT 1`,
      [account.email, authUserId]
    );

    if (raceCheckResult.rows.length) {
      throw httpError(409, "An account already exists for this email. Sign in instead.");
    }

    const clientResult = await db.query(
      `INSERT INTO clients (auth_user_id, client_code, display_name, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, business_id, auth_user_id, client_code, display_name`,
      [
        authUserId,
        account.email,
        account.businessName,
        supabaseUser.localFallback ? hashPassword(account.password) : hashPassword(crypto.randomUUID())
      ]
    );

    const clientRecord = clientResult.rows[0];
    const profileResult = await db.query(
      `INSERT INTO user_profiles (auth_user_id, client_id, business_id, email, full_name, account_type)
       VALUES ($1, $2, $3, $4, $5, 'client')
       RETURNING auth_user_id, client_id, business_id, email, full_name, account_type, created_at, updated_at`,
      [
        authUserId,
        clientRecord.id,
        clientRecord.business_id,
        account.email,
        account.fullName
      ]
    );

    await db.query("COMMIT");
    return {
      client: clientRecord,
      profile: profileResult.rows[0],
      supabaseUser
    };
  } catch (error) {
    await db.query("ROLLBACK").catch(() => {});
    await deleteSupabaseAuthUser(authUserId);
    if (error.statusCode) throw error;
    if (error.code === "23505") {
      throw httpError(409, "An account already exists for this email. Sign in instead.");
    }
    throw error;
  } finally {
    db.release();
  }
}

async function seedUnifiedLineOpsAccounts() {
  for (const account of unifiedLineOpsSeedAccounts()) {
    if (!account.password && account.email === bastidaSystemsEmail) continue;
    await ensureUnifiedBeoflowAccount(account, {
      resetPassword: account.resetPassword || resetConfiguredClientPasswords,
      candidates: account.candidates || []
    });
  }
}

async function syncAccountToFiltraCore(accountInput) {
  if (!bastidaSyncSecret || !filtraCoreApiBaseURL) return;

  const account = normalizeUnifiedAccountPayload(accountInput);
  if (!account.email || !isValidEmail(account.email)) return;

  try {
    const response = await fetch(`${filtraCoreApiBaseURL}/api/sync/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Bastida-Sync-Secret": bastidaSyncSecret
      },
      body: JSON.stringify({
        source: "beoflow",
        account
      })
    });

    if (!response.ok) {
      const body = await response.text();
      console.warn(`FiltraCore account sync failed with ${response.status}: ${body.slice(0, 160)}`);
    }
  } catch (error) {
    console.warn("FiltraCore account sync failed", error.message);
  }
}

async function requireClient(req, res, next) {
  try {
    requireDatabase();

    const payload = verifyClientToken(getBearerToken(req));
    if (!payload) {
      return res.status(401).json({ error: "Session expired. Sign in again." });
    }

    const result = await pool.query(
      "SELECT id, business_id, client_code, display_name FROM clients WHERE id = $1 AND client_code = $2",
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

async function requireLineOpsUser(req, res, next) {
  try {
    requireDatabase();

    const payload = verifyLineOpsUserToken(getBearerToken(req));
    if (!payload) {
      return res.status(401).json({ error: "Session expired. Sign in again." });
    }

    const result = await pool.query(
      `SELECT id, business_name, full_name, email, business_type, onboarding_profile, workspace, created_at, updated_at
       FROM lineops_users
       WHERE id = $1 AND LOWER(email) = ANY($2::text[]) AND deleted_at IS NULL
       LIMIT 1`,
      [payload.lineOpsUserId, unifiedAccountCandidates(payload.email)]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: "LineOps session is not valid." });
    }

    req.lineOpsUser = result.rows[0];
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

function parseModelJsonObject(outputText = "") {
  const cleaned = String(outputText || "")
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw error;
    }

    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

function requireDatabase() {
  if (pool) return;

  const error = new Error("DATABASE_URL is missing. This API route is unavailable, but localStorage fallback can still be used.");
  error.statusCode = 503;
  throw error;
}

function normalizeClientDataContextId(value = "") {
  const contextId = String(value || "").trim();
  if (!contextId) return "global";
  if (contextId.length > 128 || !/^[a-zA-Z0-9:._-]+$/.test(contextId)) {
    throw httpError(400, "Client data context is invalid.");
  }
  return contextId;
}

function getClientDataContextId(req) {
  return normalizeClientDataContextId(
    req.body?.contextId ||
    req.body?.context_id ||
    req.query?.contextId ||
    req.query?.context_id ||
    req.get("x-beoflow-context-id")
  );
}

function normalizeRestaurantId(value = "") {
  const restaurantId = String(value || "").trim();
  return /^\d+$/.test(restaurantId) ? restaurantId : "";
}

function getRequestedRestaurantId(req) {
  return normalizeRestaurantId(
    req.body?.restaurant_id ||
    req.body?.restaurantId ||
    req.query?.restaurantId ||
    req.query?.restaurant_id ||
    req.get("x-beoflow-restaurant-id")
  );
}

async function assertClientRestaurantAccess(clientId, restaurantId) {
  const normalizedRestaurantId = normalizeRestaurantId(restaurantId);
  if (!normalizedRestaurantId) return "";

  const result = await pool.query(
    `SELECT r.restaurant_id
     FROM restaurants r
     JOIN clients c ON c.id = $1
     WHERE r.client_id = c.id
       AND r.business_id = c.business_id
       AND r.restaurant_id = $2
       AND r.active_status = TRUE
     LIMIT 1`,
    [clientId, normalizedRestaurantId]
  );

  if (!result.rows.length) {
    throw httpError(404, "Restaurant not found for this client.");
  }

  return normalizedRestaurantId;
}

async function assertClientDataContextAccess(clientId, contextId) {
  if (!String(contextId).startsWith("restaurant:")) return contextId;
  const restaurantId = String(contextId).slice("restaurant:".length);
  if (!normalizeRestaurantId(restaurantId)) {
    throw httpError(400, "Restaurant client data context is invalid.");
  }
  await assertClientRestaurantAccess(clientId, restaurantId);
  return contextId;
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

async function prepareScheduleVisionImages(imageBase64, mimeType = "") {
  const originalImage = await prepareVisionImage(imageBase64, mimeType);

  try {
    const imageBuffer = Buffer.from(originalImage.imageBase64, "base64");
    const enhancedImage = await sharp(imageBuffer)
      .rotate()
      .jpeg({ quality: 95 })
      .toBuffer();

    return [{
      imageBase64: enhancedImage.toString("base64"),
      mimeType: "image/jpeg",
      label: "Auto-oriented full schedule photo. Use this image to read names and day cells."
    }];
  } catch (error) {
    console.warn("SCHEDULE IMAGE ENHANCEMENT WARNING:", error.message);
  }

  return [{ ...originalImage, label: "Original uploaded schedule photo." }];
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

  await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      business_id UUID NOT NULL DEFAULT gen_random_uuid(),
      client_code TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query("ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_id UUID;");
  await pool.query("ALTER TABLE clients ADD COLUMN IF NOT EXISTS auth_user_id UUID;");
  await pool.query("UPDATE clients SET business_id = gen_random_uuid() WHERE business_id IS NULL;");
  await pool.query("ALTER TABLE clients ALTER COLUMN business_id SET DEFAULT gen_random_uuid();");
  await pool.query("ALTER TABLE clients ALTER COLUMN business_id SET NOT NULL;");
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS clients_business_id_unique_idx
    ON clients (business_id);
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS clients_auth_user_id_unique_idx
    ON clients (auth_user_id)
    WHERE auth_user_id IS NOT NULL;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      auth_user_id UUID PRIMARY KEY,
      client_id BIGINT NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
      business_id UUID NOT NULL,
      email TEXT NOT NULL,
      full_name TEXT NOT NULL,
      account_type TEXT NOT NULL DEFAULT 'client',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_email_unique_idx
    ON user_profiles (LOWER(email));
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS user_profiles_business_id_idx
    ON user_profiles (business_id);
  `);
  if (isSupabaseAuthConfigured() && !allowLocalAuthFallback) {
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'auth'
            AND table_name = 'users'
        )
        AND NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'user_profiles_auth_user_id_fkey'
        ) THEN
          ALTER TABLE user_profiles
          ADD CONSTRAINT user_profiles_auth_user_id_fkey
          FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `);
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS client_data (
      client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      data_key TEXT NOT NULL,
      context_id TEXT NOT NULL DEFAULT 'global',
      data_value JSONB NOT NULL DEFAULT 'null'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (client_id, data_key, context_id)
    );
  `);
  await pool.query("ALTER TABLE client_data ADD COLUMN IF NOT EXISTS context_id TEXT NOT NULL DEFAULT 'global';");
  await pool.query("ALTER TABLE client_data DROP CONSTRAINT IF EXISTS client_data_pkey;");
  await pool.query("ALTER TABLE client_data ADD PRIMARY KEY (client_id, data_key, context_id);");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lineops_users (
      id UUID PRIMARY KEY,
      business_name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      business_type TEXT NOT NULL DEFAULT 'Other',
      onboarding_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
      workspace JSONB NOT NULL DEFAULT '{}'::jsonb,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS lineops_users_active_email_unique_idx
    ON lineops_users (LOWER(email))
    WHERE deleted_at IS NULL;
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS lineops_users_created_idx
    ON lineops_users (created_at DESC);
  `);

  await migrateLegacyClients();
  await deleteDisabledAccounts();

  let defaultClientId = null;
  for (const clientConfig of getConfiguredClients()) {
    const result = await pool.query(
      `INSERT INTO clients (client_code, display_name, password_hash)
       VALUES ($1, $2, $3)
      ON CONFLICT (client_code)
      DO UPDATE SET
         display_name = EXCLUDED.display_name,
         password_hash = CASE
           WHEN $4::boolean THEN EXCLUDED.password_hash
           ELSE clients.password_hash
         END,
         updated_at = NOW()
       RETURNING id`,
      [
        clientConfig.code,
        clientConfig.displayName || clientConfig.code,
        hashPassword(clientConfig.password),
        resetConfiguredClientPasswords
      ]
    );

    if (!defaultClientId) defaultClientId = result.rows[0].id;
  }

  await seedUnifiedLineOpsAccounts();

  await pool.query(`
    CREATE INDEX IF NOT EXISTS client_data_client_updated_idx
    ON client_data (client_id, updated_at DESC);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS client_data_client_context_updated_idx
    ON client_data (client_id, context_id, updated_at DESC);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
      business_id UUID,
      restaurant_id BIGINT,
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
  await pool.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS business_id UUID;");
  await pool.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS restaurant_id BIGINT;");
  await pool.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS menu_id TEXT;");
  if (defaultClientId) {
    await pool.query("UPDATE events SET client_id = $1 WHERE client_id IS NULL", [defaultClientId]);
  }
  await pool.query(`
    UPDATE events e
    SET business_id = c.business_id
    FROM clients c
    WHERE e.client_id = c.id
      AND e.business_id IS NULL;
  `);
  await pool.query("ALTER TABLE events ALTER COLUMN business_id SET NOT NULL;");
  await pool.query(`
    CREATE INDEX IF NOT EXISTS events_client_created_idx
    ON events (client_id, created_at DESC);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS events_client_restaurant_created_idx
    ON events (client_id, restaurant_id, created_at DESC);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS events_business_restaurant_created_idx
    ON events (business_id, restaurant_id, created_at DESC);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id SERIAL PRIMARY KEY,
      client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
      business_id UUID,
      restaurant_id BIGINT,
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
  await pool.query("ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS business_id UUID;");
  await pool.query("ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS restaurant_id BIGINT;");
  if (defaultClientId) {
    await pool.query("UPDATE inventory_items SET client_id = $1 WHERE client_id IS NULL", [defaultClientId]);
  }
  await pool.query(`
    UPDATE inventory_items i
    SET business_id = c.business_id
    FROM clients c
    WHERE i.client_id = c.id
      AND i.business_id IS NULL;
  `);
  await pool.query("ALTER TABLE inventory_items ALTER COLUMN business_id SET NOT NULL;");
  await pool.query(`
    CREATE INDEX IF NOT EXISTS inventory_items_client_created_idx
    ON inventory_items (client_id, created_at DESC);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS inventory_items_client_restaurant_created_idx
    ON inventory_items (client_id, restaurant_id, created_at DESC);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS inventory_items_business_restaurant_created_idx
    ON inventory_items (business_id, restaurant_id, created_at DESC);
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

    const preparedImages = await prepareScheduleVisionImages(imageBase64, mimeType);
    const imageContent = preparedImages.flatMap((preparedImage, index) => [
      {
        type: "input_text",
        text: `Image ${index + 1}: ${preparedImage.label}`
      },
      {
        type: "input_image",
        image_url: `data:${preparedImage.mimeType};base64,${preparedImage.imageBase64}`,
        detail: "high"
      }
    ]);

    const response = await client.responses.create({
      model: process.env.OPENAI_SCHEDULE_MODEL || "gpt-5.5",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Extract the exact weekly employee schedule from the provided PTS Staples grid photo. The image may be sideways or angled; rotate it mentally before reading.

Return ONLY valid JSON in this exact shape, with no explanation before or after it:

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
- The left blue column contains the employee names. Preserve visible names exactly and read only names printed in that column.
- Keep similar names separate when they are printed separately, such as JUAN and JUAN H.
- Map the visible Monday through Sunday day columns to mon, tue, wed, thu, fri, sat, sun.
- Each day block has three subcolumns: in, out, total. Read only the in and out cells from the same horizontal band as that employee name.
- Ignore the Hours of operations row. Values like 2PM to 2AM or 11AM to 4AM are not employee shifts.
- LINE, PT'S, MCALLS, MGALS, Off, off, in, out, total, day names, and dates are not employee names.
- Do not copy or extrapolate shifts. Read each employee/day cell independently.
- If the in/out cells for an employee/day are blank, say off, or are not clearly readable, return off true with empty times for that day.
- Return every visible named employee row, even if every day is off.
- Keep role, station, and each assignment station as empty strings for this import. The app will assign stations later.
- Put visible labels such as LINE, PT'S, or MCALLS in sourceLabel only if useful; never use them as names.
- Normalize readable times to 24-hour HH:MM. Examples: 6.00 A -> 06:00, 2.00 P -> 14:00, 4.30 P -> 16:30, 12.30 A -> 00:30, 7.00 P -> 19:00, 3.00 A -> 03:00.
- Use the total cell only to resolve 12 o'clock ambiguity. A visible 12.00 to 8.00 P with total 8 is 12:00 to 20:00.
- Keep top-level shiftStart and shiftEnd as the first readable working shift for that employee, otherwise empty.
- Add notes only for genuinely unreadable rows/cells.
              `,
            },
            ...imageContent,
          ],
        },
      ],
    });

    const parsed = parseModelJsonObject(response.output_text);
    const blockedScheduleNames = new Set([
      "hours of operations",
      "hour of operations",
      "operations",
      "employee",
      "employees",
      "off",
      "in",
      "out",
      "total",
      "line",
      "pts",
      "pt's",
      "mcalls",
      "m calls",
      "mcall",
      "mcall's",
      "mgals",
      "flat top",
      "broiler",
      "broiler/grill",
      "grill",
      "fry",
      "pantry",
      "prep",
      "expo",
      "extra board",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
      "mon",
      "tue",
      "wed",
      "thu",
      "fri",
      "sat",
      "sun"
    ]);
    const isEmployeeScheduleName = (value = "") => {
      const normalized = String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

      if (!normalized || blockedScheduleNames.has(normalized)) return false;
      if (/^\d/.test(normalized)) return false;
      if (/\b(?:am|pm|a|p)\b/.test(normalized) && /\d/.test(normalized)) return false;
      if (normalized.includes("to") && /\d/.test(normalized)) return false;
      return true;
    };
    const ptsScheduleRoster = [
      "EDUARDO",
      "RUSTY",
      "ROBERT",
      "BRYAN",
      "LILA",
      "RANDY",
      "JERONIMO",
      "JUAN",
      "JUAN H",
      "CARLOS",
      "AARON",
      "DAVID",
      "ADRIANA",
      "MANUEL",
      "Ivan"
    ];
    const getScheduleNameKey = (value = "") =>
      String(value)
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "");
    const ptsScheduleRosterMap = new Map(
      ptsScheduleRoster.map((name) => [getScheduleNameKey(name), name])
    );
    const ptsScheduleAliasMap = new Map([
      ["brian", "BRYAN"],
      ["lili", "LILA"],
      ["lilia", "LILA"],
      ["juanm", "JUAN H"]
    ]);
    const normalizeScheduleEmployee = (employee = {}) => {
      if (!isEmployeeScheduleName(employee?.name)) return null;

      const rawName = String(employee.name || "").trim();
      const nameKey = getScheduleNameKey(rawName);
      const canonicalName = ptsScheduleRosterMap.get(nameKey) || ptsScheduleAliasMap.get(nameKey) || rawName;
      return {
        ...employee,
        name: canonicalName
      };
    };

    res.json({
      employees: Array.isArray(parsed.employees)
        ? parsed.employees.map(normalizeScheduleEmployee).filter(Boolean)
        : [],
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
    supabaseAuth: isSupabaseAuthConfigured(),
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
      lineOpsAuth: "POST /api/lineops/auth/login",
      signup: "POST /api/auth/signup",
      lineOpsAdminUsers: "GET /api/lineops/admin/users",
      realtime: "Socket.io orders engine gateway",
      adminApp: "GET /admin",
      orderApp: "GET /order",
      kdsApp: "GET /kds",
      posApp: "GET /pos"
    }
  };
}

app.get("/api/status", (req, res) => {
  res.json(apiStatus());
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/admin/", (req, res) => {
  res.redirect(301, "/admin");
});

app.get(["/order", "/order/"], (req, res) => {
  res.sendFile(path.join(__dirname, "apps", "order", "index.html"));
});

app.get(["/kds", "/kds/"], (req, res) => {
  res.sendFile(path.join(__dirname, "apps", "kds", "index.html"));
});

app.get(["/pos", "/pos/"], (req, res) => {
  res.sendFile(path.join(__dirname, "apps", "pos", "index.html"));
});

app.get("/health", (req, res) => {
  res.json(apiStatus());
});

app.post("/api/sync/accounts", async (req, res) => {
  try {
    requireDatabase();

    if (!bastidaSyncSecret || req.get("x-bastida-sync-secret") !== bastidaSyncSecret) {
      return res.status(404).json({ error: "Not found." });
    }

    const account = normalizeUnifiedAccountPayload(req.body.account || req.body);
    if (!account.email || !isValidEmail(account.email)) {
      return res.status(400).json({ error: "A valid account email is required." });
    }

    const user = await ensureUnifiedBeoflowAccount(account, {
      resetPassword: Boolean(account.password),
      candidates: [
        req.body.account?.email,
        req.body.account?.login,
        req.body.account?.clientCode,
        req.body.email,
        req.body.login,
        req.body.clientCode
      ].filter(Boolean)
    });

    res.json({
      ok: true,
      user: serializeLineOpsAdminUser(user)
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || "Account sync failed." });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    requireDatabase();

    const account = normalizePublicSignupPayload(req.body || {});

    if (!isValidEmail(account.email)) {
      return res.status(400).json({ error: "Enter a valid email." });
    }

    if (isDisabledClientCode(account.email)) {
      return res.status(400).json({ error: "This email cannot be used to create an account." });
    }

    if (!account.businessName || !account.fullName) {
      return res.status(400).json({ error: "Business name and full name are required." });
    }

    if (account.password.length < PUBLIC_SIGNUP_PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    if (account.password.length > 128) {
      return res.status(400).json({ error: "Password is too long." });
    }

    const createdAccount = await createPublicSignupAccount(account);
    await syncAccountToFiltraCore(account);

    res.status(201).json({
      ok: true,
      token: createClientToken(createdAccount.client),
      client: serializeClient(createdAccount.client)
    });
  } catch (error) {
    if (!error.statusCode || error.statusCode >= 500) console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || "Account signup failed." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    requireDatabase();

    const rawClientCode = String(req.body.clientCode || req.body.client_id || "").trim();
    const password = String(req.body.password || "");

    if (!rawClientCode || !password) {
      return res.status(400).json({ error: "Client and password are required." });
    }

    const legacyClient = await findClientByLoginIdentifier(rawClientCode);
    const legacyPasswordMatches = Boolean(
      legacyClient && timingSafeEqualText(legacyClient.password_hash, hashPassword(password))
    );

    if (legacyPasswordMatches && isLegacyClientLoginAllowed(legacyClient)) {
      return res.json({
        ok: true,
        token: createClientToken(legacyClient),
        client: serializeClient(legacyClient)
      });
    }

    if (legacyPasswordMatches && allowLocalAuthFallback) {
      return res.json({
        ok: true,
        token: createClientToken(legacyClient),
        client: serializeClient(legacyClient)
      });
    }

    const email = normalizeEmail(rawClientCode);
    if (!isValidEmail(email)) {
      return res.status(401).json({ error: "Invalid client or password." });
    }

    const supabaseAuth = await signInSupabaseAuthUser(email, password);
    if (!supabaseAuth) {
      return res.status(401).json({ error: "Invalid client or password." });
    }

    const foundClient = await findClientBySupabaseUser(supabaseAuth.user.id, supabaseAuth.user.email || email);
    if (!foundClient) {
      return res.status(403).json({
        error: "BEOFlow profile is missing for this Supabase account. Contact Bastida Systems support."
      });
    }

    const clientRecord = await ensureSupabaseProfileLink(foundClient, supabaseAuth.user);
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

app.post("/api/lineops/auth/login", async (req, res) => {
  try {
    requireDatabase();

    const rawEmail = normalizeEmail(req.body.email || req.body.username);
    const email = resolveUnifiedAccountIdentifier(rawEmail);
    const password = String(req.body.password || "");

    if (!isValidLoginIdentifier(rawEmail) || !password) {
      return res.status(400).json({ error: "Email or login and password are required." });
    }

    const result = await pool.query(
      `SELECT id, business_name, full_name, email, business_type, password_hash, onboarding_profile, workspace, created_at, updated_at
       FROM lineops_users
       WHERE LOWER(email) = ANY($1::text[]) AND deleted_at IS NULL
       ORDER BY CASE WHEN LOWER(email) = LOWER($2) THEN 0 ELSE 1 END
       LIMIT 1`,
      [unifiedAccountCandidates(rawEmail), email]
    );

    if (!result.rows.length || !verifyLineOpsPassword(password, result.rows[0].password_hash)) {
      return res.status(401).json({ error: "Email or password is incorrect." });
    }

    const user = result.rows[0];
    const workspace = await ensureLineOpsWorkspace(user);

    res.json({
      ok: true,
      token: createLineOpsUserToken(user),
      user: serializeLineOpsUser(user),
      workspace
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || "LineOps login failed." });
  }
});

app.post("/api/lineops/auth/password-reset", async (req, res) => {
  const email = resolveUnifiedAccountIdentifier(req.body.email);
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Enter a valid business email." });
  }

  res.json({
    ok: true,
    message: "If a LineOps account exists for this email, a reset link will be sent."
  });
});

app.get("/api/lineops/auth/me", requireLineOpsUser, async (req, res) => {
  try {
    const workspace = await ensureLineOpsWorkspace(req.lineOpsUser);
    res.json({
      ok: true,
      user: serializeLineOpsUser(req.lineOpsUser),
      workspace
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load LineOps account." });
  }
});

app.post("/api/lineops/onboarding", requireLineOpsUser, async (req, res) => {
  try {
    const onboarding = normalizeLineOpsOnboarding(req.body.profile || req.body.onboarding || req.body);
    onboarding.isComplete = true;

    const existingWorkspace = readJsonObject(req.lineOpsUser.workspace, {});
    const workspace = createLineOpsWorkspace(req.lineOpsUser, onboarding, existingWorkspace);
    const result = await pool.query(
      `UPDATE lineops_users
       SET onboarding_profile = $1::jsonb,
           workspace = $2::jsonb,
           updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING id, business_name, full_name, email, business_type, onboarding_profile, workspace, created_at, updated_at`,
      [JSON.stringify(onboarding), JSON.stringify(workspace), req.lineOpsUser.id]
    );

    res.json({
      ok: true,
      user: serializeLineOpsUser(result.rows[0]),
      workspace
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save LineOps onboarding." });
  }
});

app.delete("/api/lineops/account", requireLineOpsUser, async (req, res) => {
  try {
    await pool.query(
      `UPDATE lineops_users
       SET deleted_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [req.lineOpsUser.id]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete LineOps account." });
  }
});

app.get("/api/lineops/admin/users", requireClient, async (req, res) => {
  try {
    if (!isBastidaClientCode(req.client.client_code)) {
      return res.status(403).json({ error: "Only Bastida Systems can view LineOps users." });
    }

    const result = await pool.query(
      `SELECT id, business_name, full_name, email, business_type, onboarding_profile, workspace, created_at, updated_at, deleted_at
       FROM lineops_users
       ORDER BY created_at DESC
       LIMIT 500`
    );

    const users = result.rows.map(serializeLineOpsAdminUser);

    res.json({
      ok: true,
      totals: {
        users: users.length,
        activeUsers: users.filter((user) => !user.deletedAt).length,
        onboardedUsers: users.filter((user) => user.onboardingComplete && !user.deletedAt).length,
        deletedUsers: users.filter((user) => user.deletedAt).length
      },
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load LineOps users." });
  }
});

app.patch("/api/lineops/admin/users/:id", requireClient, async (req, res) => {
  try {
    if (!isBastidaClientCode(req.client.client_code)) {
      return res.status(403).json({ error: "Only Bastida Systems can edit LineOps users." });
    }

    const result = await pool.query(
      `SELECT id, business_name, full_name, email, business_type, onboarding_profile, workspace, created_at, updated_at, deleted_at
       FROM lineops_users
       WHERE id = $1
       LIMIT 1`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "LineOps user not found." });
    }

    const existingUser = result.rows[0];
    if (existingUser.deleted_at) {
      return res.status(400).json({ error: "Deleted LineOps users cannot be edited." });
    }

    const businessName = req.body.businessName === undefined
      ? existingUser.business_name
      : String(req.body.businessName || "").trim();
    const fullName = req.body.fullName === undefined
      ? existingUser.full_name
      : String(req.body.fullName || "").trim();
    const email = req.body.email === undefined
      ? existingUser.email
      : normalizeEmail(req.body.email);
    const businessType = req.body.businessType === undefined
      ? normalizeLineOpsBusinessType(existingUser.business_type)
      : normalizeLineOpsBusinessType(req.body.businessType);

    if (!businessName || !fullName || !isValidEmail(email)) {
      return res.status(400).json({ error: "Customer name, full name, and a valid email are required." });
    }

    const duplicateResult = await pool.query(
      `SELECT id
       FROM lineops_users
       WHERE LOWER(email) = LOWER($1)
         AND id <> $2
         AND deleted_at IS NULL
       LIMIT 1`,
      [email, existingUser.id]
    );
    if (duplicateResult.rows.length) {
      return res.status(409).json({ error: "Another LineOps user already uses this email." });
    }

    const existingOnboarding = normalizeLineOpsOnboarding(readJsonObject(existingUser.onboarding_profile, {}));
    const onboarding = normalizeLineOpsOnboarding({
      teamSize: req.body.teamSize === undefined ? existingOnboarding.teamSize : req.body.teamSize,
      department: req.body.department === undefined ? existingOnboarding.department : req.body.department,
      goals: Array.isArray(req.body.goals) ? req.body.goals : existingOnboarding.goals,
      isComplete: req.body.onboardingComplete === undefined
        ? existingOnboarding.isComplete
        : Boolean(req.body.onboardingComplete)
    });
    const updatedUserDraft = {
      ...existingUser,
      business_name: businessName,
      full_name: fullName,
      email,
      business_type: businessType
    };
    const workspace = createLineOpsWorkspace(
      updatedUserDraft,
      onboarding,
      readJsonObject(existingUser.workspace, {})
    );

    const updateResult = await pool.query(
      `UPDATE lineops_users
       SET business_name = $1,
           full_name = $2,
           email = $3,
           business_type = $4,
           onboarding_profile = $5::jsonb,
           workspace = $6::jsonb,
           updated_at = NOW()
       WHERE id = $7 AND deleted_at IS NULL
       RETURNING id, business_name, full_name, email, business_type, onboarding_profile, workspace, created_at, updated_at, deleted_at`,
      [
        businessName,
        fullName,
        email,
        businessType,
        JSON.stringify(onboarding),
        JSON.stringify(workspace),
        existingUser.id
      ]
    );
    const updatedUser = updateResult.rows[0];
    await upsertBeoflowClientAccount({
      email: updatedUser.email,
      businessName: updatedUser.business_name,
      fullName: updatedUser.full_name,
      businessType: updatedUser.business_type
    }, { skipIfMissingPassword: true });
    await syncAccountToFiltraCore({
      email: updatedUser.email,
      businessName: updatedUser.business_name,
      fullName: updatedUser.full_name,
      businessType: updatedUser.business_type,
      onboarding
    });

    res.json({
      ok: true,
      user: serializeLineOpsAdminUser(updatedUser),
      workspace
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update LineOps user." });
  }
});

app.get("/api/client-data", requireClient, async (req, res) => {
  try {
    const contextId = await assertClientDataContextAccess(req.client.id, getClientDataContextId(req));
    const result = await pool.query(
      "SELECT data_key, data_value FROM client_data WHERE client_id = $1 AND context_id = $2 ORDER BY data_key",
      [req.client.id, contextId]
    );

    const data = result.rows.reduce((acc, row) => {
      acc[row.data_key] = row.data_value;
      return acc;
    }, {});

    res.json({ ok: true, client: serializeClient(req.client), contextId, data });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || "Failed to load client data." });
  }
});

app.put("/api/client-data", requireClient, async (req, res) => {
  try {
    const contextId = await assertClientDataContextAccess(req.client.id, getClientDataContextId(req));
    const data = req.body.data && typeof req.body.data === "object" ? req.body.data : {};
    const entries = Object.entries(data).filter(([key]) => CLIENT_DATA_KEYS.has(key));

    for (const [key, value] of entries) {
      await pool.query(
        `INSERT INTO client_data (client_id, data_key, context_id, data_value, updated_at)
         VALUES ($1, $2, $3, $4::jsonb, NOW())
         ON CONFLICT (client_id, data_key, context_id)
         DO UPDATE SET data_value = EXCLUDED.data_value, updated_at = NOW()`,
        [req.client.id, key, contextId, JSON.stringify(value)]
      );
    }

    res.json({ ok: true, contextId, saved: entries.map(([key]) => key) });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || "Failed to save client data." });
  }
});

app.put("/api/client-data/:key", requireClient, async (req, res) => {
  try {
    const { key } = req.params;
    if (!CLIENT_DATA_KEYS.has(key)) {
      return res.status(400).json({ error: "Unsupported client data key." });
    }
    const contextId = await assertClientDataContextAccess(req.client.id, getClientDataContextId(req));

    await pool.query(
      `INSERT INTO client_data (client_id, data_key, context_id, data_value, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, NOW())
       ON CONFLICT (client_id, data_key, context_id)
       DO UPDATE SET data_value = EXCLUDED.data_value, updated_at = NOW()`,
      [req.client.id, key, contextId, JSON.stringify(req.body.value ?? null)]
    );

    res.json({ ok: true, key, contextId });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || "Failed to save client data." });
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
    const restaurantId = await assertClientRestaurantAccess(req.client.id, getRequestedRestaurantId(req));
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
      (client_id, business_id, restaurant_id, event_name, client_name, event_date, start_time, end_time, guests, menu_id, venue, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        req.client.id,
        req.client.business_id,
        restaurantId || null,
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
    res.status(err.statusCode || 500).json({ error: err.message || "Failed to save event" });
  }
});

// Get Events
app.get("/events", requireClient, async (req, res) => {
  try {
    const restaurantId = await assertClientRestaurantAccess(req.client.id, getRequestedRestaurantId(req));
    const params = [req.client.id, req.client.business_id];
    const clauses = ["client_id = $1", "business_id = $2"];
    if (restaurantId) {
      params.push(restaurantId);
      clauses.push(`restaurant_id = $${params.length}`);
    }

    const result = await pool.query(
      `SELECT * FROM events WHERE ${clauses.join(" AND ")} ORDER BY created_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || "Failed to fetch events" });
  }
});

// Update Event
app.put("/events/:id", requireClient, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = await assertClientRestaurantAccess(req.client.id, getRequestedRestaurantId(req));
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
        status = $9,
        restaurant_id = COALESCE($10, restaurant_id)
      WHERE id = $11 AND client_id = $12 AND business_id = $13
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
        restaurantId || null,
        id,
        req.client.id,
        req.client.business_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ ok: true, event: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || "Failed to update event" });
  }
});

// Delete Event
app.delete("/events/:id", requireClient, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = await assertClientRestaurantAccess(req.client.id, getRequestedRestaurantId(req));
    const params = [id, req.client.id, req.client.business_id];
    const clauses = ["id = $1", "client_id = $2", "business_id = $3"];
    if (restaurantId) {
      params.push(restaurantId);
      clauses.push(`restaurant_id = $${params.length}`);
    }

    await pool.query(`DELETE FROM events WHERE ${clauses.join(" AND ")}`, params);

    res.json({ ok: true, message: "Event deleted" });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || "Failed to delete event" });
  }
});

// Create Inventory Item
app.post("/inventory", requireClient, async (req, res) => {
  try {
    const restaurantId = await assertClientRestaurantAccess(req.client.id, getRequestedRestaurantId(req));
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
      (client_id, business_id, restaurant_id, name, category, quantity, unit, total_cost, storage_area)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        req.client.id,
        req.client.business_id,
        restaurantId || null,
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
    res.status(err.statusCode || 500).json({ error: err.message || "Failed to save inventory item" });
  }
});

// Get Inventory
app.get("/inventory", requireClient, async (req, res) => {
  try {
    const restaurantId = await assertClientRestaurantAccess(req.client.id, getRequestedRestaurantId(req));
    const params = [req.client.id, req.client.business_id];
    const clauses = ["client_id = $1", "business_id = $2"];
    if (restaurantId) {
      params.push(restaurantId);
      clauses.push(`restaurant_id = $${params.length}`);
    }

    const result = await pool.query(
      `SELECT * FROM inventory_items WHERE ${clauses.join(" AND ")} ORDER BY created_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || "Failed to fetch inventory" });
  }
});

// Update Inventory Item
app.put("/inventory/:id", requireClient, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = await assertClientRestaurantAccess(req.client.id, getRequestedRestaurantId(req));
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
        storage_area = $6,
        restaurant_id = COALESCE($7, restaurant_id)
      WHERE id = $8 AND client_id = $9 AND business_id = $10
      RETURNING *`,
      [
        name,
        category || "other",
        quantity || 0,
        unit || "units",
        total_cost || 0,
        storage_area || "Refrigerated",
        restaurantId || null,
        id,
        req.client.id,
        req.client.business_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.json({ ok: true, item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || "Failed to update inventory item" });
  }
});

// Delete Inventory Item
app.delete("/inventory/:id", requireClient, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = await assertClientRestaurantAccess(req.client.id, getRequestedRestaurantId(req));
    const params = [id, req.client.id, req.client.business_id];
    const clauses = ["id = $1", "client_id = $2", "business_id = $3"];
    if (restaurantId) {
      params.push(restaurantId);
      clauses.push(`restaurant_id = $${params.length}`);
    }

    await pool.query(`DELETE FROM inventory_items WHERE ${clauses.join(" AND ")}`, params);

    res.json({ ok: true, message: "Inventory item deleted" });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || "Failed to delete inventory item" });
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
