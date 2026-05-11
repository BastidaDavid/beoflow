async function initializeSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS staff_roles (
      role_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      role_name TEXT NOT NULL,
      permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
      active_status BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (client_id, role_name)
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS staff_roles_client_active_idx
    ON staff_roles (client_id, active_status, role_name);
  `);
}

async function listRoles(pool, clientId) {
  const result = await pool.query(
    `SELECT *
     FROM staff_roles
     WHERE client_id = $1
     ORDER BY role_name ASC`,
    [clientId]
  );

  return result.rows;
}

async function createRole(pool, clientId, payload) {
  const result = await pool.query(
    `INSERT INTO staff_roles (client_id, role_name, permissions, active_status)
     VALUES ($1,$2,$3::jsonb,$4)
     ON CONFLICT (client_id, role_name)
     DO UPDATE SET permissions = EXCLUDED.permissions,
                   active_status = EXCLUDED.active_status,
                   updated_at = NOW()
     RETURNING *`,
    [clientId, payload.role_name, JSON.stringify(payload.permissions || []), payload.active_status]
  );

  return result.rows[0];
}

module.exports = {
  initializeSchema,
  createRole,
  listRoles
};
