const restaurantService = require("../services");
const { asyncHandler, requireClientId } = require("../../shared/http");

module.exports = function createRestaurantsController({ pool, realtime }) {
  return {
    list: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const restaurants = await restaurantService.listRestaurants(pool, clientId, req.query);
      res.json({ ok: true, restaurants });
    }),

    create: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const restaurant = await restaurantService.createRestaurant(pool, clientId, req.body);

      realtime.emit("restaurants:created", {
        clientId,
        restaurantId: restaurant.restaurant_id,
        restaurant
      });

      res.status(201).json({ ok: true, restaurant });
    }),

    get: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const restaurant = await restaurantService.getRestaurant(pool, clientId, req.params.restaurantId);
      res.json({ ok: true, restaurant });
    }),

    update: asyncHandler(async (req, res) => {
      const clientId = requireClientId(req);
      const restaurant = await restaurantService.updateRestaurant(pool, clientId, req.params.restaurantId, req.body);

      realtime.emit("restaurants:updated", {
        clientId,
        restaurantId: restaurant.restaurant_id,
        restaurant
      });

      res.json({ ok: true, restaurant });
    })
  };
};
