function acknowledge(ack, payload) {
  if (typeof ack === "function") ack(payload);
}

module.exports = function registerRestaurantSocketHandlers(socket, context) {
  socket.on("restaurants:join", async ({ restaurantId } = {}, ack) => {
    try {
      await context.assertRestaurantAccess(socket.data.client.id, restaurantId);
      socket.join(`restaurant:${socket.data.client.id}:${restaurantId}`);
      acknowledge(ack, { ok: true, room: `restaurant:${restaurantId}` });
    } catch (error) {
      acknowledge(ack, { ok: false, error: error.message });
    }
  });
};
