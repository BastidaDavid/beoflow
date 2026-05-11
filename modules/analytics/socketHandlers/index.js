function acknowledge(ack, payload) {
  if (typeof ack === "function") ack(payload);
}

module.exports = function registerAnalyticsSocketHandlers(socket) {
  socket.on("analytics:join", (_payload = {}, ack) => {
    socket.join(`manager:${socket.data.client.id}`);
    acknowledge(ack, { ok: true });
  });
};
