const express = require("express");
const createStaffController = require("../controllers");

module.exports = function createStaffRoutes(options) {
  const router = express.Router();
  const controller = createStaffController(options);

  router.get("/roles", controller.listRoles);
  router.post("/roles", controller.createRole);

  return router;
};
