const restaurantModel = require("../models");
const { createHttpError } = require("../../shared/http");

function normalizeBoolean(value, fallback = true) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() !== "false";
}

function normalizeRestaurantPayload(payload = {}) {
  const restaurantName = String(payload.restaurant_name || payload.restaurantName || "").trim();
  if (!restaurantName) {
    throw createHttpError(400, "restaurant_name is required.");
  }

  return {
    restaurant_name: restaurantName,
    category: String(payload.category || "restaurant").trim().toLowerCase(),
    location: payload.location || "",
    active_status: normalizeBoolean(payload.active_status ?? payload.activeStatus, true),
    service_modes: Array.isArray(payload.service_modes || payload.serviceModes)
      ? payload.service_modes || payload.serviceModes
      : [],
    metadata: payload.metadata || {}
  };
}

async function listRestaurants(pool, clientId, filters = {}) {
  return restaurantModel.listRestaurants(pool, clientId, {
    activeOnly: String(filters.activeOnly || filters.active_only || "").toLowerCase() === "true"
  });
}

async function createRestaurant(pool, clientId, payload) {
  return restaurantModel.createRestaurant(pool, clientId, normalizeRestaurantPayload(payload));
}

async function getRestaurant(pool, clientId, restaurantId) {
  const restaurant = await restaurantModel.getRestaurant(pool, clientId, restaurantId);
  if (!restaurant) {
    throw createHttpError(404, "Restaurant not found.");
  }

  return restaurant;
}

async function updateRestaurant(pool, clientId, restaurantId, payload) {
  await getRestaurant(pool, clientId, restaurantId);
  const restaurant = await restaurantModel.updateRestaurant(pool, clientId, restaurantId, normalizeRestaurantPayload(payload));
  if (!restaurant) {
    throw createHttpError(404, "Restaurant not found.");
  }

  return restaurant;
}

module.exports = {
  createRestaurant,
  getRestaurant,
  listRestaurants,
  updateRestaurant
};
