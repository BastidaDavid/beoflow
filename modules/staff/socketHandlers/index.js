function acknowledge(ack, payload) {
  if (typeof ack === "function") ack(payload);
}

module.exports = function registerStaffSocketHandlers(socket) {
  socket.on("staff:join", (_payload = {}, ack) => {
    socket.join(`staff:${socket.data.client.id}`);
    acknowledge(ack, { ok: true });
  });
};
