import {
  closeOrder,
  escapeHtml,
  findRestaurantName,
  formatCurrency,
  formatLabel,
  getOrderId,
  getOrderRestaurantId,
  getRestaurantId,
  listOrders,
  listRestaurants,
  renderRestaurantOptions,
  setStatus,
  statusClass,
  updatePaymentStatus,
  wireAuthGate
} from "/apps/shared/ops-core.mjs";

const state = {
  restaurants: [],
  orders: []
};

const elements = {
  restaurantFilter: document.getElementById("restaurant-filter"),
  statusFilter: document.getElementById("status-filter"),
  ordersBody: document.getElementById("orders-body"),
  status: document.getElementById("pos-status"),
  refresh: document.getElementById("refresh-pos"),
  receiptPanel: document.getElementById("receipt-panel"),
  receiptBody: document.getElementById("receipt-body")
};

function renderFilters() {
  const selected = elements.restaurantFilter.value || "";
  elements.restaurantFilter.innerHTML = renderRestaurantOptions(state.restaurants, selected, true);
}

function filteredOrders() {
  const restaurantId = elements.restaurantFilter.value || "";
  const status = elements.statusFilter.value || "";
  return state.orders.filter((order) => {
    return (!restaurantId || getOrderRestaurantId(order) === restaurantId) &&
      (!status || order.order_status === status);
  });
}

function renderOrders() {
  renderFilters();
  const orders = filteredOrders();

  if (!orders.length) {
    elements.ordersBody.innerHTML = '<tr><td colspan="7" class="empty-state">No orders in this view.</td></tr>';
    return;
  }

  elements.ordersBody.innerHTML = orders.map((order) => {
    const orderId = getOrderId(order);
    const isPaid = ["PAID", "VOIDED", "REFUNDED"].includes(order.payment_status);
    const canClose = isPaid && order.order_status === "DELIVERED";
    return `
      <tr>
        <td><strong>#${escapeHtml(orderId.slice(-6) || orderId)}</strong><br><span class="muted">${escapeHtml(order.table_id || order.customer_name || "")}</span></td>
        <td>${escapeHtml(findRestaurantName(state.restaurants, getOrderRestaurantId(order)))}</td>
        <td>${escapeHtml(formatLabel(order.order_type || "DINE_IN"))}</td>
        <td>${formatCurrency(order.total)}</td>
        <td><span class="badge ${statusClass(order.order_status)}">${escapeHtml(formatLabel(order.order_status))}</span></td>
        <td><span class="badge ${statusClass(order.payment_status)}">${escapeHtml(formatLabel(order.payment_status))}</span></td>
        <td>
          <button type="button" class="secondary-btn" data-receipt="${escapeHtml(orderId)}">Receipt</button>
          ${isPaid ? "" : `<button type="button" class="secondary-btn" data-pay="${escapeHtml(orderId)}">Mark Paid</button>`}
          <button type="button" class="primary-btn" data-close="${escapeHtml(orderId)}" ${canClose ? "" : "disabled"}>Close</button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderReceipt(order) {
  const restaurantName = findRestaurantName(state.restaurants, getOrderRestaurantId(order));
  elements.receiptPanel.hidden = false;
  elements.receiptBody.innerHTML = `
    <div class="receipt-line"><span>Order</span><strong>#${escapeHtml(getOrderId(order).slice(-6) || getOrderId(order))}</strong></div>
    <div class="receipt-line"><span>Restaurant</span><strong>${escapeHtml(restaurantName)}</strong></div>
    <div class="receipt-line"><span>Service</span><strong>${escapeHtml(formatLabel(order.order_type || "DINE_IN"))}</strong></div>
    <div class="receipt-line"><span>Subtotal</span><strong>${formatCurrency(order.subtotal)}</strong></div>
    <div class="receipt-line"><span>Tax</span><strong>${formatCurrency(order.taxes)}</strong></div>
    <div class="receipt-line"><span>Total</span><strong>${formatCurrency(order.total)}</strong></div>
    <div class="receipt-line"><span>Payment</span><strong>${escapeHtml(formatLabel(order.payment_status))}</strong></div>
  `;
  elements.receiptPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function refresh() {
  try {
    state.restaurants = await listRestaurants();
    state.orders = await listOrders({
      restaurantId: elements.restaurantFilter.value,
      status: elements.statusFilter.value
    });
    renderOrders();
    setStatus(elements.status, `Loaded ${state.orders.length} orders.`, "success");
  } catch (error) {
    setStatus(elements.status, error.message || "POS could not load.", "error");
  }
}

async function markPaid(orderId) {
  try {
    await updatePaymentStatus(orderId, "PAID");
    setStatus(elements.status, "Payment marked paid.", "success");
    await refresh();
  } catch (error) {
    setStatus(elements.status, error.message || "Payment could not be updated.", "error");
  }
}

async function closeTicket(orderId) {
  try {
    await closeOrder(orderId);
    setStatus(elements.status, "Order closed.", "success");
    await refresh();
  } catch (error) {
    setStatus(elements.status, error.message || "Order could not be closed.", "error");
  }
}

elements.restaurantFilter.addEventListener("change", refresh);
elements.statusFilter.addEventListener("change", refresh);
elements.refresh.addEventListener("click", refresh);
elements.ordersBody.addEventListener("click", (event) => {
  const payButton = event.target.closest("[data-pay]");
  if (payButton) {
    markPaid(payButton.dataset.pay);
    return;
  }

  const closeButton = event.target.closest("[data-close]");
  if (closeButton) {
    closeTicket(closeButton.dataset.close);
    return;
  }

  const receiptButton = event.target.closest("[data-receipt]");
  if (receiptButton) {
    const order = state.orders.find((item) => getOrderId(item) === receiptButton.dataset.receipt);
    if (order) renderReceipt(order);
  }
});

wireAuthGate({ onReady: refresh });
