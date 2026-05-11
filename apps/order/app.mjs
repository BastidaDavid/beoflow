import {
  createTabletOrder,
  escapeHtml,
  findStationName,
  formatCurrency,
  formatLabel,
  getRestaurantId,
  getStationId,
  listKitchenStations,
  listRestaurants,
  renderRestaurantOptions,
  setStatus,
  wireAuthGate
} from "/apps/shared/ops-core.mjs";

const menuItems = [
  { name: "Burger", category: "Hot line", price: 18 },
  { name: "Coffee", category: "Cafe", price: 5 },
  { name: "Caesar Salad", category: "Cold line", price: 14 },
  { name: "Dessert", category: "Pastry", price: 9 },
  { name: "Sparkling Water", category: "Bar", price: 6 },
  { name: "Room Service Breakfast", category: "Room service", price: 24 }
];

const state = {
  restaurants: [],
  stations: [],
  cart: []
};

const elements = {
  restaurantSelect: document.getElementById("restaurant-select"),
  orderType: document.getElementById("order-type"),
  tableId: document.getElementById("table-id"),
  customerName: document.getElementById("customer-name"),
  stationSelect: document.getElementById("station-select"),
  menuGrid: document.getElementById("menu-grid"),
  cartList: document.getElementById("cart-list"),
  cartTotal: document.getElementById("cart-total"),
  submitOrder: document.getElementById("submit-order"),
  status: document.getElementById("order-status"),
  customName: document.getElementById("custom-item-name"),
  customPrice: document.getElementById("custom-item-price"),
  customQuantity: document.getElementById("custom-item-quantity"),
  customModifiers: document.getElementById("custom-item-modifiers"),
  customNotes: document.getElementById("custom-item-notes"),
  addCustom: document.getElementById("add-custom-item")
};

function parseModifiers(value = "") {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((option) => ({ group: "custom", option }));
}

function selectedRestaurantId() {
  return elements.restaurantSelect?.value || "";
}

function selectedStationId() {
  return elements.stationSelect?.value || "";
}

function renderStations() {
  const restaurantId = selectedRestaurantId();
  const stations = state.stations.filter((station) => !restaurantId || String(station.restaurant_id) === restaurantId);

  elements.stationSelect.innerHTML = [
    '<option value="">No station</option>',
    ...stations.map((station) => `<option value="${escapeHtml(getStationId(station))}">${escapeHtml(station.station_name || "Station")}</option>`)
  ].join("");
}

function renderMenu() {
  elements.menuGrid.innerHTML = menuItems.map((item, index) => `
    <button type="button" class="menu-item" data-menu-index="${index}">
      <strong>${escapeHtml(item.name)}</strong>
      <span>${escapeHtml(item.category)} · ${formatCurrency(item.price)}</span>
    </button>
  `).join("");
}

function renderCart() {
  const total = state.cart.reduce((sum, item) => sum + item.total_price, 0);
  elements.cartTotal.textContent = formatCurrency(total);

  if (!state.cart.length) {
    elements.cartList.innerHTML = '<div class="empty-state">Cart is empty.</div>';
    return;
  }

  elements.cartList.innerHTML = state.cart.map((item, index) => {
    const stationName = findStationName(state.stations, item.assigned_station_id);
    return `
      <div class="cart-row">
        <div>
          <strong>${escapeHtml(item.quantity)}x ${escapeHtml(item.menu_item_id)}</strong>
          <span>${formatCurrency(item.total_price)}${stationName ? ` · ${escapeHtml(stationName)}` : ""}</span>
        </div>
        <button type="button" class="secondary-btn" data-remove-cart="${index}">Remove</button>
      </div>
    `;
  }).join("");
}

function addItem(item) {
  const quantity = Math.max(1, Number.parseInt(item.quantity || 1, 10));
  const unitPrice = Number(item.unit_price || 0);
  state.cart.push({
    menu_item_id: item.menu_item_id,
    quantity,
    modifiers: item.modifiers || [],
    notes: item.notes || "",
    assigned_station_id: selectedStationId() || null,
    unit_price: unitPrice,
    total_price: unitPrice * quantity
  });
  renderCart();
}

async function refreshData() {
  state.restaurants = await listRestaurants();
  state.stations = await listKitchenStations();

  elements.restaurantSelect.innerHTML = state.restaurants.length
    ? renderRestaurantOptions(state.restaurants)
    : '<option value="">Create a restaurant in Admin first</option>';

  renderStations();
  renderMenu();
  renderCart();
}

async function submitOrder() {
  const restaurantId = selectedRestaurantId();
  if (!restaurantId || !state.cart.length) {
    setStatus(elements.status, "Choose a restaurant and add at least one item.", "error");
    return;
  }

  const subtotal = state.cart.reduce((sum, item) => sum + item.total_price, 0);
  const payload = {
    restaurant_id: restaurantId,
    table_id: elements.tableId.value.trim(),
    customer_name: elements.customerName.value.trim(),
    order_type: elements.orderType.value || "DINE_IN",
    payment_status: "UNPAID",
    subtotal,
    taxes: 0,
    total: subtotal,
    items: state.cart
  };

  try {
    const order = await createTabletOrder(payload);
    state.cart = [];
    renderCart();
    elements.tableId.value = "";
    elements.customerName.value = "";
    setStatus(elements.status, `Order #${String(order.order_id || "").slice(-6)} submitted as ${formatLabel(order.order_status)}.`, "success");
  } catch (error) {
    setStatus(elements.status, error.message || "Order could not be submitted.", "error");
  }
}

elements.restaurantSelect.addEventListener("change", renderStations);
elements.menuGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-menu-index]");
  if (!button) return;
  const item = menuItems[Number(button.dataset.menuIndex)];
  addItem({
    menu_item_id: item.name,
    quantity: 1,
    unit_price: item.price,
    modifiers: [],
    notes: ""
  });
});

elements.cartList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-cart]");
  if (!button) return;
  state.cart.splice(Number(button.dataset.removeCart), 1);
  renderCart();
});

elements.addCustom.addEventListener("click", () => {
  const name = elements.customName.value.trim();
  if (!name) {
    setStatus(elements.status, "Custom item name is required.", "error");
    return;
  }

  addItem({
    menu_item_id: name,
    quantity: elements.customQuantity.value || 1,
    unit_price: Number(elements.customPrice.value || 0),
    modifiers: parseModifiers(elements.customModifiers.value),
    notes: elements.customNotes.value.trim()
  });

  [elements.customName, elements.customPrice, elements.customModifiers, elements.customNotes].forEach((input) => {
    input.value = "";
  });
  elements.customQuantity.value = "1";
});

elements.submitOrder.addEventListener("click", submitOrder);

wireAuthGate({
  onReady: async () => {
    try {
      await refreshData();
    } catch (error) {
      setStatus(elements.status, error.message || "Order app could not load.", "error");
    }
  }
});
