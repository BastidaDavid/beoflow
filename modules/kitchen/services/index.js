const kitchenModel = require("../models");
const restaurantService = require("../../restaurants/services");
const orderService = require("../../orders/services");
const { createHttpError, toPositiveInteger } = require("../../shared/http");

function normalizeBoolean(value, fallback = true) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() !== "false";
}

function normalizeStationPayload(payload = {}) {
  const restaurantId = payload.restaurant_id || payload.restaurantId;
  const stationName = String(payload.station_name || payload.stationName || "").trim();
  if (!restaurantId) {
    throw createHttpError(400, "restaurant_id is required.");
  }
  if (!stationName) {
    throw createHttpError(400, "station_name is required.");
  }

  return {
    restaurant_id: restaurantId,
    station_name: stationName,
    station_type: String(payload.station_type || payload.stationType || "general").trim().toLowerCase(),
    active_status: normalizeBoolean(payload.active_status ?? payload.activeStatus, true),
    display_order: toPositiveInteger(payload.display_order ?? payload.displayOrder, 0),
    metadata: payload.metadata || {}
  };
}

async function listStations(pool, clientId, filters = {}) {
  return kitchenModel.listStations(pool, clientId, {
    restaurantId: filters.restaurantId || filters.restaurant_id || null,
    activeOnly: String(filters.activeOnly || filters.active_only || "").toLowerCase() === "true"
  });
}

async function createStation(pool, clientId, payload) {
  const normalizedPayload = normalizeStationPayload(payload);
  await restaurantService.getRestaurant(pool, clientId, normalizedPayload.restaurant_id);
  return kitchenModel.createStation(pool, clientId, normalizedPayload);
}

async function updateStation(pool, clientId, stationId, payload) {
  const normalizedPayload = normalizeStationPayload(payload);
  await restaurantService.getRestaurant(pool, clientId, normalizedPayload.restaurant_id);
  const station = await kitchenModel.updateStation(pool, clientId, stationId, normalizedPayload);
  if (!station) {
    throw createHttpError(404, "Kitchen station not found.");
  }

  return station;
}

async function listKitchenOrders(pool, clientId, filters = {}) {
  return kitchenModel.listKitchenOrders(pool, clientId, {
    restaurantId: filters.restaurantId || filters.restaurant_id || null,
    stationId: filters.stationId || filters.station_id || null
  });
}

async function updateOrderStatus(pool, clientId, orderId, status, options = {}) {
  return orderService.updateOrderStatus(pool, clientId, orderId, status, {
    ...options,
    sourceChannel: options.sourceChannel || "KDS"
  });
}

async function updateItemStatus(pool, clientId, orderItemId, status) {
  return orderService.updateOrderItemStatus(pool, clientId, orderItemId, status);
}

module.exports = {
  createStation,
  listKitchenOrders,
  listStations,
  updateItemStatus,
  updateOrderStatus,
  updateStation
};
