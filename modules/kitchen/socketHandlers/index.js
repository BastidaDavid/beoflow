const kitchenService = require("../services");

function acknowledge(ack, payload) {
  if (typeof ack === "function") ack(payload);
}

module.exports = function registerKitchenSocketHandlers(socket, context) {
  socket.on("kds:join", async ({ restaurantId, stationId } = {}, ack) => {
    try {
      await context.assertRestaurantAccess(socket.data.client.id, restaurantId);
      socket.join(`kitchen:${socket.data.client.id}:${restaurantId}`);
      if (stationId) {
        socket.join(`station:${socket.data.client.id}:${stationId}`);
      }
      acknowledge(ack, { ok: true, restaurantId, stationId: stationId || null });
    } catch (error) {
      acknowledge(ack, { ok: false, error: error.message });
    }
  });

  socket.on("kds:item_status:update", async ({ orderItemId, status } = {}, ack) => {
    try {
      const clientId = socket.data.client.id;
      const item = await kitchenService.updateItemStatus(context.pool, clientId, orderItemId, status);

      context.realtime.emit("kitchen:item_status_changed", {
        clientId,
        orderId: item.order_id,
        stationId: item.assigned_station_id,
        item
      });

      acknowledge(ack, { ok: true, item });
    } catch (error) {
      acknowledge(ack, { ok: false, error: error.message });
    }
  });
};
