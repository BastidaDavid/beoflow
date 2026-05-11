const analyticsModel = require("../models");

async function getOrdersSummary(pool, clientId, filters = {}) {
  return analyticsModel.getOrdersSummary(pool, clientId, {
    restaurantId: filters.restaurantId || filters.restaurant_id || null
  });
}

module.exports = {
  getOrdersSummary
};
