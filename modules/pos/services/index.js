const orderService = require("../../orders/services");

async function updatePaymentStatus(pool, clientId, orderId, paymentStatus) {
  return orderService.updatePaymentStatus(pool, clientId, orderId, paymentStatus);
}

async function closeOrder(pool, clientId, orderId, options = {}) {
  return orderService.closeOrder(pool, clientId, orderId, {
    ...options,
    sourceChannel: options.sourceChannel || "POS"
  });
}

module.exports = {
  closeOrder,
  updatePaymentStatus
};
