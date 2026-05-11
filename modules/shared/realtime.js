function createRealtimeEmitter(io) {
  const emit = (eventName, payload = {}) => {
    if (!io) return;

    const envelope = {
      ...payload,
      emittedAt: new Date().toISOString()
    };

    if (payload.clientId) {
      io.to(`client:${payload.clientId}`).emit(eventName, envelope);
    }

    if (payload.clientId && payload.restaurantId) {
      io.to(`restaurant:${payload.clientId}:${payload.restaurantId}`).emit(eventName, envelope);
      io.to(`kitchen:${payload.clientId}:${payload.restaurantId}`).emit(eventName, envelope);
      io.to(`pos:${payload.clientId}:${payload.restaurantId}`).emit(eventName, envelope);
      io.to(`manager:${payload.clientId}`).emit(eventName, envelope);
    }

    if (payload.clientId && payload.stationId) {
      io.to(`station:${payload.clientId}:${payload.stationId}`).emit(eventName, envelope);
    }
  };

  return { emit };
}

module.exports = {
  createRealtimeEmitter
};
