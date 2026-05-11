const posService = require("../services");
const { asyncHandler, requireClientId } = require("../../shared/http");

module.exports = function createPosController({ pool, realtime }) {
  return {
    updatePaymentStatus: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const order = await posService.updatePaymentStatus(pool, clientId, req.params.orderId, req.body.payment_status || req.body.status);

      realtime.emit("pos:payment_status_changed", {
        clientId,
        restaurantId: order.restaurant_id,
        order
      });

      res.json({ ok: true, order });
    }),

    closeOrder: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const order = await posService.closeOrder(pool, clientId, req.params.orderId, {
        changedBy: req.body.changed_by || req.body.changedBy || req.client.client_code,
        note: req.body.note || "Closed by POS"
      });

      realtime.emit("orders:closed", {
        clientId,
        restaurantId: order.restaurant_id,
        order
      });

      res.json({ ok: true, order });
    })
  };
};
