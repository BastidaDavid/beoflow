function acknowledge(ack, payload) {
  if (typeof ack === "function") ack(payload);
}

module.exports = function registerPosSocketHandlers(socket, context) {
  socket.on("pos:join", async ({ restaurantId } = {}, ack) => {
    try {
      await context.assertRestaurantAccess(socket.data.client.id, restaurantId);
      socket.join(`pos:${socket.data.client.id}:${restaurantId}`);
      acknowledge(ack, { ok: true, restaurantId });
    } catch (error) {
      acknowledge(ack, { ok: false, error: error.message });
    }
  });
};
