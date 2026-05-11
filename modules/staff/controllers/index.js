const staffService = require("../services");
const { asyncHandler, requireClientId } = require("../../shared/http");

module.exports = function createStaffController({ pool, realtime }) {
  return {
    listRoles: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const roles = await staffService.listRoles(pool, clientId);
      res.json({ ok: true, roles });
    }),

    createRole: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const role = await staffService.createRole(pool, clientId, req.body);

      realtime.emit("staff:role_saved", {
        clientId,
        role
      });

      res.status(201).json({ ok: true, role });
    })
  };
};
