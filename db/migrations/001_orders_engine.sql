-- BEOFlow Orders Engine schema
-- Apply after the existing clients table has been created.

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

CREATE INDEX IF NOT EXISTS restaurants_client_active_idx
ON restaurants (client_id, active_status, restaurant_name);

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

CREATE INDEX IF NOT EXISTS kitchen_stations_restaurant_active_idx
ON kitchen_stations (client_id, restaurant_id, active_status, display_order);

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

CREATE INDEX IF NOT EXISTS orders_client_restaurant_status_idx
ON orders (client_id, restaurant_id, order_status, created_at DESC);

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

CREATE INDEX IF NOT EXISTS order_items_order_status_idx
ON order_items (order_id, item_status);

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

CREATE INDEX IF NOT EXISTS staff_roles_client_active_idx
ON staff_roles (client_id, active_status, role_name);
