const orderService = require("../../orders/services");

async function submitTabletOrder(pool, clientId, payload) {
  return orderService.createOrder(pool, clientId, payload, {
    sourceChannel: "TABLET"
  });
}

module.exports = {
  submitTabletOrder
};
