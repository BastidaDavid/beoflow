async function initializeSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      restaurant_id BIGINT NOT NULL REFERENCES restaurants(restaurant_id) ON DELETE RESTRICT,
      table_id TEXT,
      customer_name TEXT,
      order_type TEXT NOT NULL DEFAULT 'DINE_IN',
      order_status TEXT NOT NULL DEFAULT 'NEW',
      payment_status TEXT NOT NULL DEFAULT 'UNPAID',
      subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
      taxes NUMERIC(12,2) NOT NULL DEFAULT 0,
      total NUMERIC(12,2) NOT NULL DEFAULT 0,
      source_channel TEXT NOT NULL DEFAULT 'POS',
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT orders_status_check CHECK (order_status IN ('NEW','ACCEPTED','PREPARING','READY','DELIVERED','CLOSED')),
      CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('UNPAID','AUTHORIZED','PAID','PARTIALLY_REFUNDED','REFUNDED','VOIDED'))
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      order_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
      menu_item_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      modifiers JSONB NOT NULL DEFAULT '[]'::jsonb,
      notes TEXT,
      item_status TEXT NOT NULL DEFAULT 'NEW',
      assigned_station_id BIGINT REFERENCES kitchen_stations(station_id) ON DELETE SET NULL,
      unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT order_items_status_check CHECK (item_status IN ('NEW','ACCEPTED','PREPARING','READY','DELIVERED','CLOSED'))
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_status_history (
      order_status_history_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
      previous_status TEXT,
      next_status TEXT NOT NULL,
      changed_by TEXT,
      source_channel TEXT,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS orders_client_restaurant_status_idx
    ON orders (client_id, restaurant_id, order_status, created_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS order_items_order_status_idx
    ON order_items (order_id, item_status);
  `);
}

async function assertRestaurantBelongsToClient(db, clientId, restaurantId) {
  const result = await db.query(
    "SELECT restaurant_id FROM restaurants WHERE client_id = $1 AND restaurant_id = $2",
    [clientId, restaurantId]
  );

  return result.rows.length > 0;
}

async function fetchOrderItems(db, clientId, orderId) {
  const result = await db.query(
    `SELECT *
     FROM order_items
     WHERE client_id = $1 AND order_id = $2
     ORDER BY order_item_id ASC`,
    [clientId, orderId]
  );

  return result.rows;
}

async function fetchOrderById(db, clientId, orderId) {
  const result = await db.query(
    `SELECT *
     FROM orders
     WHERE client_id = $1 AND order_id = $2
     LIMIT 1`,
    [clientId, orderId]
  );

  if (!result.rows.length) return null;

  return {
    ...result.rows[0],
    items: await fetchOrderItems(db, clientId, orderId)
  };
}

async function listOrders(pool, clientId, filters = {}) {
  const params = [clientId];
  const clauses = ["client_id = $1"];

  if (filters.restaurantId) {
    params.push(filters.restaurantId);
    clauses.push(`restaurant_id = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    clauses.push(`order_status = $${params.length}`);
  }

  const result = await pool.query(
    `SELECT *
     FROM orders
     WHERE ${clauses.join(" AND ")}
     ORDER BY created_at DESC
     LIMIT 250`,
    params
  );

  return result.rows;
}

async function createOrder(pool, clientId, payload) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const restaurantExists = await assertRestaurantBelongsToClient(client, clientId, payload.restaurant_id);
    if (!restaurantExists) {
      const error = new Error("Restaurant not found for this client.");
      error.statusCode = 404;
      throw error;
    }

    const orderResult = await client.query(
      `INSERT INTO orders
        (client_id, restaurant_id, table_id, customer_name, order_type, order_status, payment_status,
         subtotal, taxes, total, source_channel, metadata)
       VALUES ($1,$2,$3,$4,$5,'NEW',$6,$7,$8,$9,$10,$11::jsonb)
       RETURNING *`,
      [
        clientId,
        payload.restaurant_id,
        payload.table_id || null,
        payload.customer_name || null,
        payload.order_type,
        payload.payment_status,
        payload.subtotal,
        payload.taxes,
        payload.total,
        payload.source_channel,
        JSON.stringify(payload.metadata || {})
      ]
    );

    const order = orderResult.rows[0];
    for (const item of payload.items) {
      if (item.assigned_station_id) {
        const stationResult = await client.query(
          `SELECT station_id
           FROM kitchen_stations
           WHERE client_id = $1 AND restaurant_id = $2 AND station_id = $3
           LIMIT 1`,
          [clientId, payload.restaurant_id, item.assigned_station_id]
        );

        if (!stationResult.rows.length) {
          const error = new Error("Assigned kitchen station is not valid for this restaurant.");
          error.statusCode = 400;
          throw error;
        }
      }

      await client.query(
        `INSERT INTO order_items
          (client_id, order_id, menu_item_id, quantity, modifiers, notes, item_status,
           assigned_station_id, unit_price, total_price)
         VALUES ($1,$2,$3,$4,$5::jsonb,$6,'NEW',$7,$8,$9)`,
        [
          clientId,
          order.order_id,
          item.menu_item_id,
          item.quantity,
          JSON.stringify(item.modifiers || []),
          item.notes || null,
          item.assigned_station_id || null,
          item.unit_price,
          item.total_price
        ]
      );
    }

    await client.query(
      `INSERT INTO order_status_history
        (client_id, order_id, previous_status, next_status, changed_by, source_channel, note)
       VALUES ($1,$2,NULL,'NEW',$3,$4,$5)`,
      [clientId, order.order_id, payload.changed_by || null, payload.source_channel, "Order created"]
    );

    await client.query("COMMIT");
    return fetchOrderById(pool, clientId, order.order_id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function updateOrderStatus(pool, clientId, orderId, nextStatus, options = {}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currentResult = await client.query(
      "SELECT * FROM orders WHERE client_id = $1 AND order_id = $2 FOR UPDATE",
      [clientId, orderId]
    );

    if (!currentResult.rows.length) {
      const error = new Error("Order not found.");
      error.statusCode = 404;
      throw error;
    }

    const currentOrder = currentResult.rows[0];
    if (typeof options.validateTransition === "function") {
      options.validateTransition(currentOrder.order_status, nextStatus);
    }

    const updateResult = await client.query(
      `UPDATE orders
       SET order_status = $1, updated_at = NOW()
       WHERE client_id = $2 AND order_id = $3
       RETURNING *`,
      [nextStatus, clientId, orderId]
    );

    await client.query(
      `INSERT INTO order_status_history
        (client_id, order_id, previous_status, next_status, changed_by, source_channel, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        clientId,
        orderId,
        currentOrder.order_status,
        nextStatus,
        options.changedBy || null,
        options.sourceChannel || null,
        options.note || null
      ]
    );

    await client.query("COMMIT");
    return {
      ...updateResult.rows[0],
      items: await fetchOrderItems(pool, clientId, orderId)
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function updatePaymentStatus(pool, clientId, orderId, paymentStatus) {
  const result = await pool.query(
    `UPDATE orders
     SET payment_status = $1, updated_at = NOW()
     WHERE client_id = $2 AND order_id = $3
     RETURNING *`,
    [paymentStatus, clientId, orderId]
  );

  if (!result.rows.length) return null;
  return {
    ...result.rows[0],
    items: await fetchOrderItems(pool, clientId, orderId)
  };
}

async function updateOrderItemStatus(pool, clientId, orderItemId, nextStatus) {
  const result = await pool.query(
    `UPDATE order_items
     SET item_status = $1, updated_at = NOW()
     WHERE client_id = $2 AND order_item_id = $3
     RETURNING *`,
    [nextStatus, clientId, orderItemId]
  );

  return result.rows[0] || null;
}

module.exports = {
  initializeSchema,
  createOrder,
  fetchOrderById,
  listOrders,
  updateOrderItemStatus,
  updateOrderStatus,
  updatePaymentStatus
};
