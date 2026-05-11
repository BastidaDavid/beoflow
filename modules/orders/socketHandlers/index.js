const orderService = require("../services");

function acknowledge(ack, payload) {
  if (typeof ack === "function") ack(payload);
}

module.exports = function registerOrderSocketHandlers(socket, context) {
  socket.on("orders:join", async ({ restaurantId } = {}, ack) => {
    try {
      await context.assertRestaurantAccess(socket.data.client.id, restaurantId);
      socket.join(`restaurant:${socket.data.client.id}:${restaurantId}`);
      acknowledge(ack, { ok: true, room: `restaurant:${restaurantId}` });
    } catch (error) {
      acknowledge(ack, { ok: false, error: error.message });
    }
  });

  socket.on("orders:status:update", async ({ orderId, status, note } = {}, ack) => {
    try {
      const clientId = socket.data.client.id;
      const order = await orderService.updateOrderStatus(context.pool, clientId, orderId, status, {
        changedBy: socket.data.client.client_code,
        sourceChannel: "SOCKET",
        note
      });

      context.realtime.emit("orders:status_changed", {
        clientId,
        restaurantId: order.restaurant_id,
        order
      });

      acknowledge(ack, { ok: true, order });
    } catch (error) {
      acknowledge(ack, { ok: false, error: error.message });
    }
  });
};
