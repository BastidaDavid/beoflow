const staffModel = require("../models");
const { createHttpError } = require("../../shared/http");

function normalizeBoolean(value, fallback = true) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() !== "false";
}

function normalizeRolePayload(payload = {}) {
  const roleName = String(payload.role_name || payload.roleName || "").trim();
  if (!roleName) {
    throw createHttpError(400, "role_name is required.");
  }

  return {
    role_name: roleName,
    permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
    active_status: normalizeBoolean(payload.active_status ?? payload.activeStatus, true)
  };
}

async function listRoles(pool, clientId) {
  return staffModel.listRoles(pool, clientId);
}

async function createRole(pool, clientId, payload) {
  return staffModel.createRole(pool, clientId, normalizeRolePayload(payload));
}

module.exports = {
  createRole,
  listRoles
};
