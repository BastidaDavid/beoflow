const express = require("express");
const createKitchenController = require("../controllers");

module.exports = function createKitchenRoutes(options) {
  const router = express.Router();
  const controller = createKitchenController(options);

  router.get("/stations", controller.listStations);
  router.post("/stations", controller.createStation);
  router.put("/stations/:stationId", controller.updateStation);
  router.get("/orders", controller.listOrders);
  router.patch("/orders/:orderId/status", controller.updateOrderStatus);
  router.patch("/items/:orderItemId/status", controller.updateItemStatus);

  return router;
};
