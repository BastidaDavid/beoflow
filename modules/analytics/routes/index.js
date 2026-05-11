const express = require("express");
const createAnalyticsController = require("../controllers");

module.exports = function createAnalyticsRoutes(options) {
  const router = express.Router();
  const controller = createAnalyticsController(options);

  router.get("/orders/summary", controller.ordersSummary);

  return router;
};
