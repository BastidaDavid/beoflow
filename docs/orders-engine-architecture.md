# BEOFlow Orders Engine Architecture

BEOFlow should treat the pizza restaurant as the first deployment of a broader hospitality operations engine. The core design below is restaurant-neutral and supports pizza shops, cafes, bars, food courts, room service, banquets, pool service, and multiple venues inside casino or hotel properties.

## 1. Recommended Folder Structure

```text
modules/
  orders/
    routes/
    controllers/
    services/
    models/
    socketHandlers/
  kitchen/
    routes/
    controllers/
    services/
    models/
    socketHandlers/
  tablet-ordering/
    routes/
    controllers/
    services/
    models/
    socketHandlers/
  pos/
    routes/
    controllers/
    services/
    models/
    socketHandlers/
  analytics/
    routes/
    controllers/
    services/
    models/
    socketHandlers/
  restaurants/
    routes/
    controllers/
    services/
    models/
    socketHandlers/
  staff/
    routes/
    controllers/
    services/
    models/
    socketHandlers/
```

Supporting files:

```text
modules/ordersEngine.js                 # Registers routes, sockets, and schema
modules/shared/http.js                  # Request helpers and HTTP errors
modules/shared/realtime.js              # Socket.io room/event emitter
db/migrations/001_orders_engine.sql     # SQL reference migration
docs/orders-engine-architecture.md      # This architecture guide
```

## 2. Backend Architecture

The backend follows a modular Express architecture:

- Routes define HTTP contracts only.
- Controllers translate HTTP input/output.
- Services enforce business rules such as universal order flow and payment requirements.
- Models own PostgreSQL queries and transactions.
- Socket handlers manage real-time subscriptions and real-time workflow actions.

The root server remains a thin composition layer. It initializes the database, mounts module routes, and starts Socket.io on the same HTTP server as Express.

The central engine is tenant-scoped through the existing `clients` table. Each restaurant, order, item, station, and staff role belongs to a `client_id`, allowing a hotel or casino account to run many restaurants through one backend.

Universal order flow:

```text
NEW -> ACCEPTED -> PREPARING -> READY -> DELIVERED -> CLOSED
```

The implementation avoids pizza-specific fields. Item customization is modeled through:

- `modifiers` for sizes, options, add-ons, removals, sauces, temperatures, milk types, drink options, etc.
- `kitchen_stations` for routing work to any station type.
- `category`, `station_type`, and metadata for venue-specific behavior without hardcoding.

## 3. PostgreSQL Schema

Core tables:

```sql
restaurants (
  restaurant_id,
  client_id,
  restaurant_name,
  category,
  location,
  active_status,
  service_modes,
  metadata,
  created_at,
  updated_at
)

orders (
  order_id,
  client_id,
  restaurant_id,
  table_id,
  customer_name,
  order_type,
  order_status,
  payment_status,
  subtotal,
  taxes,
  total,
  source_channel,
  metadata,
  created_at,
  updated_at
)

order_items (
  order_item_id,
  client_id,
  order_id,
  menu_item_id,
  quantity,
  modifiers,
  notes,
  item_status,
  assigned_station_id,
  unit_price,
  total_price,
  created_at,
  updated_at
)

kitchen_stations (
  station_id,
  client_id,
  restaurant_id,
  station_name,
  station_type,
  active_status,
  display_order,
  metadata,
  created_at,
  updated_at
)

staff_roles (
  role_id,
  client_id,
  role_name,
  permissions,
  active_status,
  created_at,
  updated_at
)
```

Additional operational table:

```sql
order_status_history (
  order_status_history_id,
  client_id,
  order_id,
  previous_status,
  next_status,
  changed_by,
  source_channel,
  note,
  created_at
)
```

`db/migrations/001_orders_engine.sql` contains the concrete migration reference.

## 4. API Route Examples

Restaurants:

```http
GET    /api/restaurants
POST   /api/restaurants
GET    /api/restaurants/:restaurantId
PUT    /api/restaurants/:restaurantId
```

Orders:

```http
GET    /api/orders?restaurantId=1&status=PREPARING
POST   /api/orders
GET    /api/orders/:orderId
PATCH  /api/orders/:orderId/status
PATCH  /api/orders/:orderId/items/:orderItemId/status
```

Example order payload:

```json
{
  "restaurant_id": 1,
  "table_id": "12",
  "customer_name": "Guest",
  "order_type": "DINE_IN",
  "subtotal": 24.5,
  "taxes": 2.04,
  "total": 26.54,
  "items": [
    {
      "menu_item_id": "burger-001",
      "quantity": 1,
      "modifiers": [
        { "group": "temperature", "option": "medium" },
        { "group": "side", "option": "fries" }
      ],
      "notes": "No onion",
      "assigned_station_id": 2,
      "unit_price": 18.5,
      "total_price": 18.5
    }
  ]
}
```

Kitchen:

```http
GET    /api/kitchen/stations?restaurantId=1
POST   /api/kitchen/stations
PUT    /api/kitchen/stations/:stationId
GET    /api/kitchen/orders?restaurantId=1&stationId=2
PATCH  /api/kitchen/orders/:orderId/status
PATCH  /api/kitchen/items/:orderItemId/status
```

Tablet ordering:

```http
POST   /api/tablet-ordering/orders
```

POS:

```http
PATCH  /api/pos/orders/:orderId/payment
POST   /api/pos/orders/:orderId/close
```

Analytics and staff:

```http
GET    /api/analytics/orders/summary?restaurantId=1
GET    /api/staff/roles
POST   /api/staff/roles
```

## 5. Socket.io Event Architecture

Authentication:

```js
io("https://api.example.com", {
  auth: { token: beoflowAuthToken }
});
```

Rooms:

```text
client:{clientId}
manager:{clientId}
restaurant:{clientId}:{restaurantId}
kitchen:{clientId}:{restaurantId}
station:{clientId}:{stationId}
pos:{clientId}:{restaurantId}
staff:{clientId}
```

Client-to-server subscriptions:

```text
restaurants:join
orders:join
kds:join
tablet:join
pos:join
analytics:join
staff:join
```

Client-to-server workflow events:

```text
orders:status:update
kds:item_status:update
```

Server-to-client events:

```text
restaurants:created
restaurants:updated
orders:created
orders:status_changed
orders:closed
kitchen:station_created
kitchen:station_updated
kitchen:order_status_changed
kitchen:item_status_changed
pos:payment_status_changed
staff:role_saved
```

Recommended event payload shape:

```json
{
  "clientId": 1,
  "restaurantId": 4,
  "stationId": 8,
  "order": {},
  "item": {},
  "emittedAt": "2026-05-11T00:00:00.000Z"
}
```

## 6. Frontend Architecture Recommendations

Customer Tablet UI:

- Browse restaurant-specific menus by category.
- Configure items through generic modifier groups and options.
- Maintain a local cart, submit to `/api/tablet-ordering/orders`, then listen for order updates.
- Support venue modes such as dine-in, pool service, QR ordering, and room delivery through `order_type`.

Kitchen Display System:

- Subscribe to `kds:join` for a restaurant or station.
- Show `NEW`, `ACCEPTED`, `PREPARING`, and `READY` queues.
- Display timers from `created_at`, item notes, modifiers, station assignments, and priority flags.
- Use `kds:item_status:update` and `/api/kitchen/orders/:orderId/status` for prep tracking.

POS / Cashier:

- Search and filter active orders by restaurant, table, guest, or order status.
- Handle payment updates through `/api/pos/orders/:orderId/payment`.
- Close paid orders through `/api/pos/orders/:orderId/close`.
- Keep receipts, refunds, comps, and void permissions in the POS module rather than the kitchen module.

Manager Dashboard:

- Subscribe to `analytics:join` and restaurant rooms.
- Filter active orders across all restaurants or a single venue.
- Track order counts, active queue age, ready-but-not-delivered items, sales, payment state, and station load.
- Keep future analytics separate from transaction writes so reporting can scale independently.

## 7. Scaling Recommendations

- Keep a single operational engine with `client_id` and `restaurant_id` boundaries instead of one backend per venue.
- Add Redis adapter for Socket.io before running multiple Node instances.
- Move database migrations into a migration runner before production.
- Add partial indexes for active kitchen queues, for example active `order_status` values by restaurant.
- Use background jobs for inventory deduction, receipt generation, notifications, and analytics rollups.
- Use append-only event tables for audits, voids, refunds, and manager overrides.
- Keep menu data normalized around categories, items, modifier groups, modifier options, and price rules.
- Introduce row-level security or a strict authorization layer before supporting many operators per client.

## 8. Enterprise Best Practices

- Model operational concepts universally: restaurant, order, item, modifier, station, staff role, payment status.
- Do not encode business types into columns such as pizza size, drink syrup, burger temperature, or coffee milk. Store those as modifier data.
- Enforce the universal order flow in services and keep status history for auditability.
- Separate KDS, POS, tablet ordering, analytics, and restaurant management permissions.
- Treat sockets as notification and workflow channels, while REST remains the source of durable writes.
- Scope every query by `client_id`.
- Prefer additive schema changes and module-level migrations.
- Keep integration points ready for future inventory deduction, Apple Watch alerts, mobile ordering, QR ordering, room delivery, and AI operational insights.
