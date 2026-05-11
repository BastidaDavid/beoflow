const express = require("express");
const createTabletOrderingController = require("../controllers");

module.exports = function createTabletOrderingRoutes(options) {
  const router = express.Router();
  const controller = createTabletOrderingController(options);

  router.post("/orders", controller.submitOrder);

  return router;
};
