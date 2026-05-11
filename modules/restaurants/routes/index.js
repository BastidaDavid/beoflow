const express = require("express");
const createRestaurantsController = require("../controllers");

module.exports = function createRestaurantsRoutes(options) {
  const router = express.Router();
  const controller = createRestaurantsController(options);

  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:restaurantId", controller.get);
  router.put("/:restaurantId", controller.update);

  return router;
};
