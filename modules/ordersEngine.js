const restaurantsModel = require("./restaurants/models");
const restaurantsRoutes = require("./restaurants/routes");
const registerRestaurantSocketHandlers = require("./restaurants/socketHandlers");

const kitchenModel = require("./kitchen/models");
const kitchenRoutes = require("./kitchen/routes");
const registerKitchenSocketHandlers = require("./kitchen/socketHandlers");

const ordersModel = require("./orders/models");
const ordersRoutes = require("./orders/routes");
const registerOrderSocketHandlers = require("./orders/socketHandlers");

const tabletOrderingModel = require("./tablet-ordering/models");
const tabletOrderingRoutes = require("./tablet-ordering/routes");
const registerTabletOrderingSocketHandlers = require("./tablet-ordering/socketHandlers");

const posModel = require("./pos/models");
const posRoutes = require("./pos/routes");
const registerPosSocketHandlers = require("./pos/socketHandlers");

const analyticsModel = require("./analytics/models");
const analyticsRoutes = require("./analytics/routes");
const registerAnalyticsSocketHandlers = require("./analytics/socketHandlers");

const staffModel = require("./staff/models");
const staffRoutes = require("./staff/routes");
const registerStaffSocketHandlers = require("./staff/socketHandlers");

const { createHttpError } = require("./shared/http");
const { createRealtimeEmitter } = require("./shared/realtime");

async function initializeOrdersEngineSchema(pool) {
  await restaurantsModel.initializeSchema(pool);
  await kitchenModel.initializeSchema(pool);
  await ordersModel.initializeSchema(pool);
  await staffModel.initializeSchema(pool);
  await tabletOrderingModel.initializeSchema(pool);
  await posModel.initializeSchema(pool);
  await analyticsModel.initializeSchema(pool);
}

function createOrdersEngineContext({ pool, io }) {
  const realtime = createRealtimeEmitter(io);

  return {
    pool,
    realtime,
    async assertRestaurantAccess(clientId, restaurantId) {
      if (!restaurantId) {
        throw createHttpError(400, "restaurant_id is required.");
      }

      const result = await pool.query(
        "SELECT restaurant_id FROM restaurants WHERE client_id = $1 AND restaurant_id = $2 LIMIT 1",
        [clientId, restaurantId]
      );

      if (!result.rows.length) {
        throw createHttpError(404, "Restaurant not found for this client.");
      }

      return result.rows[0];
    }
  };
}

function registerOrdersEngineRoutes({ app, pool, requireClient, io }) {
  const context = createOrdersEngineContext({ pool, io });
  const routeOptions = {
    pool,
    realtime: context.realtime
  };

  app.use("/api/restaurants", requireClient, restaurantsRoutes(routeOptions));
  app.use("/api/orders", requireClient, ordersRoutes(routeOptions));
  app.use("/api/kitchen", requireClient, kitchenRoutes(routeOptions));
  app.use("/api/tablet-ordering", requireClient, tabletOrderingRoutes(routeOptions));
  app.use("/api/pos", requireClient, posRoutes(routeOptions));
  app.use("/api/analytics", requireClient, analyticsRoutes(routeOptions));
  app.use("/api/staff", requireClient, staffRoutes(routeOptions));

  return context;
}

function registerOrdersEngineSockets({ io, pool, verifyClientToken }) {
  if (!io || !pool || !verifyClientToken) return;

  const context = createOrdersEngineContext({ pool, io });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token || "";
      const payload = verifyClientToken(token);

      if (!payload) {
        return next(new Error("Unauthorized socket session."));
      }

      const result = await pool.query(
        "SELECT id, client_code, display_name FROM clients WHERE id = $1 AND client_code = $2",
        [payload.clientId, payload.clientCode]
      );

      if (!result.rows.length) {
        return next(new Error("Client session is not valid."));
      }

      socket.data.client = result.rows[0];
      next();
    } catch (error) {
      next(new Error("Unauthorized socket session."));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`client:${socket.data.client.id}`);

    registerRestaurantSocketHandlers(socket, context);
    registerOrderSocketHandlers(socket, context);
    registerKitchenSocketHandlers(socket, context);
    registerTabletOrderingSocketHandlers(socket, context);
    registerPosSocketHandlers(socket, context);
    registerAnalyticsSocketHandlers(socket, context);
    registerStaffSocketHandlers(socket, context);
  });
}

module.exports = {
  initializeOrdersEngineSchema,
  registerOrdersEngineRoutes,
  registerOrdersEngineSockets
};
