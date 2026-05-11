async function initializeSchema() {
  return undefined;
}

async function getOrdersSummary(pool, clientId, filters = {}) {
  const params = [clientId];
  const clauses = ["client_id = $1"];

  if (filters.restaurantId) {
    params.push(filters.restaurantId);
    clauses.push(`restaurant_id = $${params.length}`);
  }

  const result = await pool.query(
    `SELECT
       COUNT(*)::INTEGER AS order_count,
       COALESCE(SUM(total), 0)::NUMERIC(12,2) AS gross_sales,
       COUNT(*) FILTER (WHERE order_status IN ('NEW','ACCEPTED','PREPARING','READY'))::INTEGER AS active_order_count,
       COUNT(*) FILTER (WHERE order_status = 'CLOSED')::INTEGER AS closed_order_count,
       JSONB_OBJECT_AGG(order_status, status_count) AS status_counts
     FROM (
       SELECT order_status, COUNT(*) AS status_count, SUM(total) AS total
       FROM orders
       WHERE ${clauses.join(" AND ")}
       GROUP BY order_status
     ) grouped`,
    params
  );

  return result.rows[0];
}

module.exports = {
  initializeSchema,
  getOrdersSummary
};
