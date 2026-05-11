import {
  escapeHtml,
  findRestaurantName,
  findStationName,
  formatLabel,
  getAgeLabel,
  getNextOrderStatus,
  getOrderId,
  getOrderRestaurantId,
  getRestaurantId,
  getStationId,
  connectOrdersRealtime,
  listKitchenOrders,
  listKitchenStations,
  listRestaurants,
  renderRestaurantOptions,
  setStatus,
  updateOrderStatus,
  wireAuthGate
} from "/apps/shared/ops-core.mjs";

const statuses = ["NEW", "ACCEPTED", "PREPARING", "READY"];
const state = {
  restaurants: [],
  stations: [],
  orders: [],
  socket: null,
  refreshTimer: null
};

const elements = {
  restaurantFilter: document.getElementById("restaurant-filter"),
  stationFilter: document.getElementById("station-filter"),
  board: document.getElementById("kds-board"),
  status: document.getElementById("kds-status"),
  refresh: document.getElementById("refresh-kds")
};

function renderFilters() {
  const restaurantId = elements.restaurantFilter.value || "";
  elements.restaurantFilter.innerHTML = renderRestaurantOptions(state.restaurants, restaurantId, true);

  const filteredStations = state.stations.filter((station) => {
    return !restaurantId || String(station.restaurant_id) === restaurantId;
  });

  const stationId = elements.stationFilter.value || "";
  elements.stationFilter.innerHTML = [
    '<option value="">All stations</option>',
    ...filteredStations.map((station) => {
      const id = getStationId(station);
      return `<option value="${escapeHtml(id)}" ${id === stationId ? "selected" : ""}>${escapeHtml(station.station_name || "Station")}</option>`;
    })
  ].join("");
}

function getItems(order) {
  return Array.isArray(order.items) ? order.items : [];
}

function getActiveKitchenOrders(orders = []) {
  return orders.filter((order) => statuses.includes(order.order_status));
}

function stationMatches(order) {
  const stationId = elements.stationFilter.value || "";
  if (!stationId) return true;
  return getItems(order).some((item) => String(item.assigned_station_id || "") === stationId);
}

function renderBoard() {
  renderFilters();
  const restaurantId = elements.restaurantFilter.value || "";
  const filteredOrders = getActiveKitchenOrders(state.orders).filter((order) => {
    return (!restaurantId || getOrderRestaurantId(order) === restaurantId) && stationMatches(order);
  });

  console.info("[kds] rendering board", {
    loadedOrders: state.orders.length,
    activeOrders: getActiveKitchenOrders(state.orders).length,
    renderedOrders: filteredOrders.length,
    restaurantFilter: restaurantId,
    stationFilter: elements.stationFilter.value || "",
    statuses: statuses.reduce((counts, status) => {
      counts[status] = filteredOrders.filter((order) => order.order_status === status).length;
      return counts;
    }, {})
  });

  elements.board.innerHTML = statuses.map((status) => {
    const orders = filteredOrders.filter((order) => order.order_status === status);
    const cards = orders.length ? orders.map(renderTicket).join("") : '<div class="empty-state">No tickets</div>';
    return `
      <section class="kds-column">
        <div class="kds-column-header">
          <h2>${escapeHtml(formatLabel(status))}</h2>
          <span class="badge prep">${orders.length}</span>
        </div>
        <div class="ticket-list">${cards}</div>
      </section>
    `;
  }).join("");
}

function renderTicket(order) {
  const orderId = getOrderId(order);
  const items = getItems(order);
  const nextStatus = getNextOrderStatus(order.order_status);
  const stationNames = [...new Set(items.map((item) => findStationName(state.stations, item.assigned_station_id)).filter(Boolean))];

  return `
    <article class="ticket">
      <div class="ticket-head">
        <strong>#${escapeHtml(orderId.slice(-6) || orderId)}</strong>
        <span>${escapeHtml(getAgeLabel(order.created_at))}</span>
      </div>
      <span>${escapeHtml(findRestaurantName(state.restaurants, getOrderRestaurantId(order)))} · ${escapeHtml(order.table_id || order.customer_name || "Open")}</span>
      <ul>
        ${items.map((item) => `
          <li>
            ${escapeHtml(`${item.quantity || 1}x ${item.menu_item_id || "Item"}`)}
            ${item.notes ? `<span>${escapeHtml(item.notes)}</span>` : ""}
          </li>
        `).join("")}
      </ul>
      ${stationNames.length ? `<span>${escapeHtml(stationNames.join(", "))}</span>` : ""}
      ${nextStatus ? `<button type="button" class="primary-btn" data-advance-order="${escapeHtml(orderId)}" data-next-status="${escapeHtml(nextStatus)}">${escapeHtml(formatLabel(nextStatus))}</button>` : ""}
    </article>
  `;
}

async function refresh() {
  try {
    const restaurantFilter = elements.restaurantFilter.value || "";
    const stationFilter = elements.stationFilter.value || "";
    console.info("[kds] refresh start", { restaurantFilter, stationFilter });

    state.restaurants = await listRestaurants();
    state.stations = await listKitchenStations();

    // Load the full active kitchen queue, then apply restaurant/station filters in the UI.
    // This prevents stale select values from hiding newly-created tickets.
    state.orders = await listKitchenOrders();

    renderBoard();
    setStatus(elements.status, `Loaded ${getActiveKitchenOrders(state.orders).length} active kitchen orders.`, "success");
  } catch (error) {
    console.error("[kds] refresh failed", error);
    setStatus(elements.status, error.message || "KDS could not load.", "error");
  }
}

function scheduleRefresh(reason = "unknown") {
  console.info("[kds] scheduled refresh", { reason });
  window.clearTimeout(state.refreshTimer);
  state.refreshTimer = window.setTimeout(refresh, 250);
}

function startRealtime() {
  if (state.socket) return;
  state.socket = connectOrdersRealtime({
    label: "kds",
    onEvent: (eventName) => {
      scheduleRefresh(eventName);
    }
  });
}

async function advanceOrder(orderId, nextStatus) {
  try {
    await updateOrderStatus(orderId, nextStatus);
    setStatus(elements.status, `Order moved to ${formatLabel(nextStatus)}.`, "success");
    await refresh();
  } catch (error) {
    setStatus(elements.status, error.message || "Order status could not be updated.", "error");
  }
}

elements.restaurantFilter.addEventListener("change", () => {
  renderBoard();
  scheduleRefresh("restaurant-filter");
});
elements.stationFilter.addEventListener("change", () => {
  renderBoard();
  scheduleRefresh("station-filter");
});
elements.refresh.addEventListener("click", refresh);
elements.board.addEventListener("click", (event) => {
  const button = event.target.closest("[data-advance-order]");
  if (!button) return;
  advanceOrder(button.dataset.advanceOrder, button.dataset.nextStatus);
});

wireAuthGate({
  onReady: async () => {
    await refresh();
    startRealtime();
    window.setInterval(() => scheduleRefresh("polling-fallback"), 15000);
  }
});
