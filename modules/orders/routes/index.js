const express = require("express");
const createOrdersController = require("../controllers");

module.exports = function createOrdersRoutes(options) {
  const router = express.Router();
  const controller = createOrdersController(options);

  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:orderId", controller.get);
  router.patch("/:orderId/status", controller.updateStatus);
  router.patch("/:orderId/items/:orderItemId/status", controller.updateItemStatus);

  return router;
};
