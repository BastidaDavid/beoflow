async function initializeSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS restaurants (
      restaurant_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      restaurant_name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'restaurant',
      location TEXT,
      active_status BOOLEAN NOT NULL DEFAULT TRUE,
      service_modes JSONB NOT NULL DEFAULT '[]'::jsonb,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS restaurants_client_active_idx
    ON restaurants (client_id, active_status, restaurant_name);
  `);
}

async function listRestaurants(pool, clientId, filters = {}) {
  const params = [clientId];
  const clauses = ["client_id = $1"];

  if (filters.activeOnly) {
    clauses.push("active_status = TRUE");
  }

  const result = await pool.query(
    `SELECT *
     FROM restaurants
     WHERE ${clauses.join(" AND ")}
     ORDER BY restaurant_name ASC`,
    params
  );

  return result.rows;
}

async function createRestaurant(pool, clientId, payload) {
  const result = await pool.query(
    `INSERT INTO restaurants
      (client_id, restaurant_name, category, location, active_status, service_modes, metadata)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb)
     RETURNING *`,
    [
      clientId,
      payload.restaurant_name,
      payload.category,
      payload.location || null,
      payload.active_status,
      JSON.stringify(payload.service_modes || []),
      JSON.stringify(payload.metadata || {})
    ]
  );

  return result.rows[0];
}

async function getRestaurant(pool, clientId, restaurantId) {
  const result = await pool.query(
    `SELECT *
     FROM restaurants
     WHERE client_id = $1 AND restaurant_id = $2
     LIMIT 1`,
    [clientId, restaurantId]
  );

  return result.rows[0] || null;
}

async function updateRestaurant(pool, clientId, restaurantId, payload) {
  const result = await pool.query(
    `UPDATE restaurants
     SET restaurant_name = $1,
         category = $2,
         location = $3,
         active_status = $4,
         service_modes = $5::jsonb,
         metadata = $6::jsonb,
         updated_at = NOW()
     WHERE client_id = $7 AND restaurant_id = $8
     RETURNING *`,
    [
      payload.restaurant_name,
      payload.category,
      payload.location || null,
      payload.active_status,
      JSON.stringify(payload.service_modes || []),
      JSON.stringify(payload.metadata || {}),
      clientId,
      restaurantId
    ]
  );

  return result.rows[0] || null;
}

module.exports = {
  initializeSchema,
  createRestaurant,
  getRestaurant,
  listRestaurants,
  updateRestaurant
};
