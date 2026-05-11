const tabletOrderingService = require("../services");
const { asyncHandler, requireClientId } = require("../../shared/http");

module.exports = function createTabletOrderingController({ pool, realtime }) {
  return {
    submitOrder: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const order = await tabletOrderingService.submitTabletOrder(pool, clientId, req.body);

      console.info("[orders-engine] tablet order created", {
        clientId,
        restaurantId: order.restaurant_id,
        orderId: order.order_id,
        orderStatus: order.order_status,
        itemCount: Array.isArray(order.items) ? order.items.length : 0,
        stationIds: Array.isArray(order.items)
          ? [...new Set(order.items.map((item) => item.assigned_station_id).filter(Boolean))]
          : []
      });

      realtime.emit("orders:created", {
        clientId,
        restaurantId: order.restaurant_id,
        order
      });

      res.status(201).json({ ok: true, order });
    })
  };
};
