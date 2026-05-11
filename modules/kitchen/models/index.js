async function initializeSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS kitchen_stations (
      station_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      restaurant_id BIGINT NOT NULL REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
      station_name TEXT NOT NULL,
      station_type TEXT NOT NULL DEFAULT 'general',
      active_status BOOLEAN NOT NULL DEFAULT TRUE,
      display_order INTEGER NOT NULL DEFAULT 0,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS kitchen_stations_restaurant_active_idx
    ON kitchen_stations (client_id, restaurant_id, active_status, display_order);
  `);
}

async function listStations(pool, clientId, filters = {}) {
  const params = [clientId];
  const clauses = ["client_id = $1"];

  if (filters.restaurantId) {
    params.push(filters.restaurantId);
    clauses.push(`restaurant_id = $${params.length}`);
  }

  if (filters.activeOnly) {
    clauses.push("active_status = TRUE");
  }

  const result = await pool.query(
    `SELECT *
     FROM kitchen_stations
     WHERE ${clauses.join(" AND ")}
     ORDER BY restaurant_id ASC, display_order ASC, station_name ASC`,
    params
  );

  return result.rows;
}

async function createStation(pool, clientId, payload) {
  const result = await pool.query(
    `INSERT INTO kitchen_stations
      (client_id, restaurant_id, station_name, station_type, active_status, display_order, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)
     RETURNING *`,
    [
      clientId,
      payload.restaurant_id,
      payload.station_name,
      payload.station_type,
      payload.active_status,
      payload.display_order,
      JSON.stringify(payload.metadata || {})
    ]
  );

  return result.rows[0];
}

async function updateStation(pool, clientId, stationId, payload) {
  const result = await pool.query(
    `UPDATE kitchen_stations
     SET restaurant_id = $1,
         station_name = $2,
         station_type = $3,
         active_status = $4,
         display_order = $5,
         metadata = $6::jsonb,
         updated_at = NOW()
     WHERE client_id = $7 AND station_id = $8
     RETURNING *`,
    [
      payload.restaurant_id,
      payload.station_name,
      payload.station_type,
      payload.active_status,
      payload.display_order,
      JSON.stringify(payload.metadata || {}),
      clientId,
      stationId
    ]
  );

  return result.rows[0] || null;
}

async function listKitchenOrders(pool, clientId, filters = {}) {
  const params = [clientId];
  const clauses = ["o.client_id = $1", "o.order_status IN ('NEW','ACCEPTED','PREPARING','READY')"];

  if (filters.restaurantId) {
    params.push(filters.restaurantId);
    clauses.push(`o.restaurant_id = $${params.length}`);
  }

  if (filters.stationId) {
    params.push(filters.stationId);
    clauses.push(`oi.assigned_station_id = $${params.length}`);
  }

  const result = await pool.query(
    `SELECT
       o.*,
       COALESCE(
         JSONB_AGG(TO_JSONB(oi) ORDER BY oi.order_item_id)
         FILTER (WHERE oi.order_item_id IS NOT NULL),
         '[]'::jsonb
       ) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.order_id AND oi.client_id = o.client_id
     WHERE ${clauses.join(" AND ")}
     GROUP BY o.order_id
     ORDER BY o.created_at ASC`,
    params
  );

  return result.rows;
}

module.exports = {
  initializeSchema,
  createStation,
  listKitchenOrders,
  listStations,
  updateStation
};
