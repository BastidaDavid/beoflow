const express = require("express");
const createPosController = require("../controllers");

module.exports = function createPosRoutes(options) {
  const router = express.Router();
  const controller = createPosController(options);

  router.patch("/orders/:orderId/payment", controller.updatePaymentStatus);
  router.post("/orders/:orderId/close", controller.closeOrder);

  return router;
};
