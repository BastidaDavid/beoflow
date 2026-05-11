const kitchenService = require("../services");
const { asyncHandler, requireClientId } = require("../../shared/http");

module.exports = function createKitchenController({ pool, realtime }) {
  return {
    listStations: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const stations = await kitchenService.listStations(pool, clientId, req.query);
      res.json({ ok: true, stations });
    }),

    createStation: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const station = await kitchenService.createStation(pool, clientId, req.body);

      realtime.emit("kitchen:station_created", {
        clientId,
        restaurantId: station.restaurant_id,
        stationId: station.station_id,
        station
      });

      res.status(201).json({ ok: true, station });
    }),

    updateStation: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const station = await kitchenService.updateStation(pool, clientId, req.params.stationId, req.body);

      realtime.emit("kitchen:station_updated", {
        clientId,
        restaurantId: station.restaurant_id,
        stationId: station.station_id,
        station
      });

      res.json({ ok: true, station });
    }),

    listOrders: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const orders = await kitchenService.listKitchenOrders(pool, clientId, req.query);
      res.json({ ok: true, orders });
    }),

    updateOrderStatus: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const order = await kitchenService.updateOrderStatus(pool, clientId, req.params.orderId, req.body.order_status || req.body.status, {
        changedBy: req.body.changed_by || req.body.changedBy || req.client.client_code,
        note: req.body.note || null
      });

      realtime.emit("kitchen:order_status_changed", {
        clientId,
        restaurantId: order.restaurant_id,
        order
      });

      res.json({ ok: true, order });
    }),

    updateItemStatus: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const item = await kitchenService.updateItemStatus(pool, clientId, req.params.orderItemId, req.body.item_status || req.body.status);

      realtime.emit("kitchen:item_status_changed", {
        clientId,
        orderId: item.order_id,
        stationId: item.assigned_station_id,
        item
      });

      res.json({ ok: true, item });
    })
  };
};
