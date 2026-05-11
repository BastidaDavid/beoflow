const orderService = require("../services");
const { asyncHandler, requireClientId } = require("../../shared/http");

module.exports = function createOrdersController({ pool, realtime }) {
  return {
    list: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const orders = await orderService.listOrders(pool, clientId, req.query);
      res.json({ ok: true, orders });
    }),

    create: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const order = await orderService.createOrder(pool, clientId, req.body);

      realtime.emit("orders:created", {
        clientId,
        restaurantId: order.restaurant_id,
        order
      });

      res.status(201).json({ ok: true, order });
    }),

    get: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const order = await orderService.getOrder(pool, clientId, req.params.orderId);
      res.json({ ok: true, order });
    }),

    updateStatus: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const order = await orderService.updateOrderStatus(pool, clientId, req.params.orderId, req.body.order_status || req.body.status, {
        changedBy: req.body.changed_by || req.body.changedBy || req.client.client_code,
        sourceChannel: req.body.source_channel || req.body.sourceChannel || "API",
        note: req.body.note || null
      });

      realtime.emit("orders:status_changed", {
        clientId,
        restaurantId: order.restaurant_id,
        order
      });

      res.json({ ok: true, order });
    }),

    updateItemStatus: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const item = await orderService.updateOrderItemStatus(pool, clientId, req.params.orderItemId, req.body.item_status || req.body.status);

      realtime.emit("kitchen:item_status_changed", {
        clientId,
        stationId: item.assigned_station_id,
        orderId: item.order_id,
        item
      });

      res.json({ ok: true, item });
    })
  };
};
