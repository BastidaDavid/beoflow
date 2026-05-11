const tabletOrderingService = require("../services");
const { asyncHandler, requireClientId } = require("../../shared/http");

module.exports = function createTabletOrderingController({ pool, realtime }) {
  return {
    submitOrder: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const order = await tabletOrderingService.submitTabletOrder(pool, clientId, req.body);

      realtime.emit("orders:created", {
        clientId,
        restaurantId: order.restaurant_id,
        order
      });

      res.status(201).json({ ok: true, order });
    })
  };
};
