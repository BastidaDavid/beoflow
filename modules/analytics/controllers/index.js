const analyticsService = require("../services");
const { asyncHandler, requireClientId } = require("../../shared/http");

module.exports = function createAnalyticsController({ pool }) {
  return {
    ordersSummary: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const summary = await analyticsService.getOrdersSummary(pool, clientId, req.query);
      res.json({ ok: true, summary });
    })
  };
};
