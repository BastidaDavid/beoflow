const API_BASE_URL = window.BEOFLOW_API_BASE_URL ||
  (window.location.protocol === "http:" || window.location.protocol === "https:"
    ? window.location.origin
    : "https://beoflow-api.onrender.com");

const AUTH_TOKEN_KEY = "beoflow_auth_token";
const AUTH_CLIENT_KEY = "beoflow_auth_client";

let authToken = localStorage.getItem(AUTH_TOKEN_KEY) || "";

const getAuthHeaders = (headers = {}) => ({
  ...headers,
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
});

export const ORDER_STATUS_FLOW = ["NEW", "ACCEPTED", "PREPARING", "READY", "DELIVERED", "CLOSED"];

export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatCurrency(amount = 0) {
  return `$${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatLabel(value = "") {
  return String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getEntityId(entity = {}, primaryKey = "id") {
  return String(entity[primaryKey] ?? entity.id ?? "");
}

export function getOrderId(order = {}) {
  return String(order.order_id ?? order.id ?? "");
}

export function getRestaurantId(restaurant = {}) {
  return String(restaurant.restaurant_id ?? restaurant.id ?? "");
}

export function getStationId(station = {}) {
  return String(station.station_id ?? station.id ?? "");
}

export function getOrderRestaurantId(order = {}) {
  return String(order.restaurant_id ?? order.restaurantId ?? "");
}

export function getNextOrderStatus(status = "NEW") {
  const index = ORDER_STATUS_FLOW.indexOf(status);
  if (index < 0 || index >= ORDER_STATUS_FLOW.length - 1) return "";
  return ORDER_STATUS_FLOW[index + 1];
}

export function statusClass(status = "") {
  const normalized = String(status || "").toLowerCase();
  if (["ready", "delivered", "closed", "paid", "active"].includes(normalized)) return "ready";
  if (["accepted", "preparing", "authorized"].includes(normalized)) return "prep";
  if (["new", "unpaid"].includes(normalized)) return "draft";
  if (["voided", "refunded"].includes(normalized)) return "issue";
  return "upcoming";
}

export function getAgeLabel(createdAt) {
  const created = createdAt ? new Date(createdAt).getTime() : Date.now();
  const minutes = Math.max(0, Math.floor((Date.now() - created) / 60000));
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function setStatus(element, message = "", type = "info") {
  if (!element) return;
  element.textContent = message;
  element.dataset.type = type;
  element.hidden = !message;
}

export async function requestJson(pathName, options = {}) {
  const response = await fetch(`${API_BASE_URL}${pathName}`, {
    ...options,
    headers: getAuthHeaders({
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    })
  });

  const result = await response.json().catch(() => ({}));

  if (response.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CLIENT_KEY);
    authToken = "";
  }

  if (!response.ok) {
    throw new Error(result.error || "Request failed.");
  }

  return result;
}

export async function login(clientCode, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientCode, password })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Login failed.");
  }

  authToken = result.token;
  localStorage.setItem(AUTH_TOKEN_KEY, result.token);
  localStorage.setItem(AUTH_CLIENT_KEY, JSON.stringify(result.client || {}));
  return result.client;
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_CLIENT_KEY);
  authToken = "";
  window.location.reload();
}

export async function requireSession() {
  if (!authToken) return null;
  try {
    const result = await requestJson("/api/auth/me");
    return result.client || null;
  } catch {
    return null;
  }
}

export function wireAuthGate({ onReady }) {
  const loginScreen = document.getElementById("login-screen");
  const appShell = document.getElementById("app-shell");
  const loginForm = document.getElementById("login-form");
  const loginClientCode = document.getElementById("login-client-code");
  const loginPassword = document.getElementById("login-password");
  const loginStatus = document.getElementById("login-status");

  const showLogin = (message = "") => {
    if (appShell) appShell.hidden = true;
    if (loginScreen) loginScreen.hidden = false;
    setStatus(loginStatus, message, message ? "error" : "info");
    loginClientCode?.focus();
  };

  const showApp = () => {
    if (loginScreen) loginScreen.hidden = true;
    if (appShell) appShell.hidden = false;
  };

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus(loginStatus, "Signing in...", "info");
    try {
      const client = await login(loginClientCode?.value.trim(), loginPassword?.value || "");
      showApp();
      await onReady(client);
    } catch (error) {
      setStatus(loginStatus, error.message || "Login failed.", "error");
    }
  });

  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", logout);
  });

  requireSession().then(async (client) => {
    if (!client) {
      showLogin();
      return;
    }
    showApp();
    await onReady(client);
  });
}

export async function listRestaurants() {
  const result = await requestJson("/api/restaurants");
  return Array.isArray(result.restaurants) ? result.restaurants : [];
}

export async function listKitchenStations(params = {}) {
  const query = new URLSearchParams();
  if (params.restaurantId) query.set("restaurantId", params.restaurantId);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const result = await requestJson(`/api/kitchen/stations${suffix}`);
  return Array.isArray(result.stations) ? result.stations : [];
}

export async function listOrders(params = {}) {
  const query = new URLSearchParams();
  if (params.restaurantId) query.set("restaurantId", params.restaurantId);
  if (params.status) query.set("status", params.status);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const result = await requestJson(`/api/orders${suffix}`);
  return Array.isArray(result.orders) ? result.orders : [];
}

export async function listKitchenOrders(params = {}) {
  const query = new URLSearchParams();
  if (params.restaurantId) query.set("restaurantId", params.restaurantId);
  if (params.stationId) query.set("stationId", params.stationId);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const result = await requestJson(`/api/kitchen/orders${suffix}`);
  return Array.isArray(result.orders) ? result.orders : [];
}

export async function createTabletOrder(payload) {
  const result = await requestJson("/api/tablet-ordering/orders", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return result.order;
}

export async function updateOrderStatus(orderId, status) {
  const result = await requestJson(`/api/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
  return result.order;
}

export async function updatePaymentStatus(orderId, paymentStatus) {
  const result = await requestJson(`/api/pos/orders/${encodeURIComponent(orderId)}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ payment_status: paymentStatus })
  });
  return result.order;
}

export async function closeOrder(orderId) {
  const result = await requestJson(`/api/pos/orders/${encodeURIComponent(orderId)}/close`, {
    method: "POST",
    body: JSON.stringify({ note: "Closed from POS" })
  });
  return result.order;
}

export function renderRestaurantOptions(restaurants, selectedValue = "", includeAll = false) {
  const options = restaurants.map((restaurant) => {
    const id = getRestaurantId(restaurant);
    return `<option value="${escapeHtml(id)}" ${id === selectedValue ? "selected" : ""}>${escapeHtml(restaurant.restaurant_name || "Restaurant")}</option>`;
  });

  return [
    includeAll ? '<option value="">All restaurants</option>' : "",
    ...options
  ].join("");
}

export function findRestaurantName(restaurants, restaurantId) {
  const id = String(restaurantId || "");
  return restaurants.find((restaurant) => getRestaurantId(restaurant) === id)?.restaurant_name || "Restaurant";
}

export function findStationName(stations, stationId) {
  const id = String(stationId || "");
  return stations.find((station) => getStationId(station) === id)?.station_name || "";
}
