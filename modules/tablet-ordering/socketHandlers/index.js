function acknowledge(ack, payload) {
  if (typeof ack === "function") ack(payload);
}

module.exports = function registerTabletOrderingSocketHandlers(socket, context) {
  socket.on("tablet:join", async ({ restaurantId } = {}, ack) => {
    try {
      await context.assertRestaurantAccess(socket.data.client.id, restaurantId);
      socket.join(`restaurant:${socket.data.client.id}:${restaurantId}`);
      acknowledge(ack, { ok: true, restaurantId });
    } catch (error) {
      acknowledge(ack, { ok: false, error: error.message });
    }
  });
};
