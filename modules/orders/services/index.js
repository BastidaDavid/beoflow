const orderModel = require("../models");
const { createHttpError, toNumber, toPositiveInteger } = require("../../shared/http");
const { ORDER_STATUS_FLOW, ORDER_TYPES, PAYMENT_STATUSES } = require("../constants");

function normalizeStatus(status, allowedStatuses, fallback) {
  const normalized = String(status || fallback).trim().toUpperCase();
  if (!allowedStatuses.includes(normalized)) {
    throw createHttpError(400, `Unsupported status: ${status}`);
  }

  return normalized;
}

function normalizeOrderType(orderType) {
  const normalized = String(orderType || "DINE_IN").trim().toUpperCase();
  if (!ORDER_TYPES.includes(normalized)) {
    throw createHttpError(400, `Unsupported order type: ${orderType}`);
  }

  return normalized;
}

function validateForwardStatusTransition(currentStatus, nextStatus) {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
  const nextIndex = ORDER_STATUS_FLOW.indexOf(nextStatus);

  if (currentIndex === -1 || nextIndex === -1) {
    throw createHttpError(400, "Order status must use the universal operational flow.");
  }

  if (nextIndex < currentIndex) {
    throw createHttpError(409, `Order cannot move backward from ${currentStatus} to ${nextStatus}.`);
  }

  if (nextIndex > currentIndex + 1) {
    throw createHttpError(409, `Order must move through the universal flow before ${nextStatus}.`);
  }
}

function normalizeItems(items = []) {
  if (!Array.isArray(items) || !items.length) {
    throw createHttpError(400, "At least one order item is required.");
  }

  return items.map((item) => {
    const menuItemId = String(item.menu_item_id || item.menuItemId || "").trim();
    if (!menuItemId) {
      throw createHttpError(400, "Each order item requires menu_item_id.");
    }

    const quantity = toPositiveInteger(item.quantity, 1);
    const unitPrice = toNumber(item.unit_price ?? item.unitPrice, 0);
    const totalPrice = toNumber(item.total_price ?? item.totalPrice, unitPrice * quantity);

    return {
      menu_item_id: menuItemId,
      quantity,
      modifiers: Array.isArray(item.modifiers) || item.modifiers?.constructor === Object ? item.modifiers : [],
      notes: item.notes || "",
      assigned_station_id: item.assigned_station_id || item.assignedStationId || null,
      unit_price: unitPrice,
      total_price: totalPrice
    };
  });
}

function normalizeOrderPayload(payload = {}, defaults = {}) {
  const restaurantId = payload.restaurant_id || payload.restaurantId || defaults.restaurantId;
  if (!restaurantId) {
    throw createHttpError(400, "restaurant_id is required.");
  }

  const items = normalizeItems(payload.items);
  const subtotal = toNumber(payload.subtotal, items.reduce((sum, item) => sum + item.total_price, 0));
  const taxes = toNumber(payload.taxes, 0);
  const total = toNumber(payload.total, subtotal + taxes);

  return {
    restaurant_id: restaurantId,
    table_id: payload.table_id || payload.tableId || null,
    customer_name: payload.customer_name || payload.customerName || null,
    order_type: normalizeOrderType(payload.order_type || payload.orderType),
    payment_status: normalizeStatus(payload.payment_status || payload.paymentStatus, PAYMENT_STATUSES, "UNPAID"),
    subtotal,
    taxes,
    total,
    source_channel: String(payload.source_channel || payload.sourceChannel || defaults.sourceChannel || "POS").toUpperCase(),
    metadata: payload.metadata || {},
    items,
    changed_by: payload.changed_by || payload.changedBy || null
  };
}

async function createOrder(pool, clientId, payload, defaults = {}) {
  return orderModel.createOrder(pool, clientId, normalizeOrderPayload(payload, defaults));
}

async function listOrders(pool, clientId, filters = {}) {
  return orderModel.listOrders(pool, clientId, {
    restaurantId: filters.restaurantId || filters.restaurant_id || null,
    status: filters.status ? normalizeStatus(filters.status, ORDER_STATUS_FLOW, "NEW") : null
  });
}

async function getOrder(pool, clientId, orderId) {
  const order = await orderModel.fetchOrderById(pool, clientId, orderId);
  if (!order) {
    throw createHttpError(404, "Order not found.");
  }

  return order;
}

async function updateOrderStatus(pool, clientId, orderId, nextStatus, options = {}) {
  const normalizedStatus = normalizeStatus(nextStatus, ORDER_STATUS_FLOW, "NEW");
  return orderModel.updateOrderStatus(pool, clientId, orderId, normalizedStatus, {
    ...options,
    validateTransition: validateForwardStatusTransition
  });
}

async function updatePaymentStatus(pool, clientId, orderId, paymentStatus) {
  const normalizedPaymentStatus = normalizeStatus(paymentStatus, PAYMENT_STATUSES, "UNPAID");
  const order = await orderModel.updatePaymentStatus(pool, clientId, orderId, normalizedPaymentStatus);
  if (!order) {
    throw createHttpError(404, "Order not found.");
  }

  return order;
}

async function closeOrder(pool, clientId, orderId, options = {}) {
  const order = await getOrder(pool, clientId, orderId);
  if (!["PAID", "VOIDED", "REFUNDED"].includes(order.payment_status)) {
    throw createHttpError(409, "Order must be paid, voided, or refunded before closing.");
  }

  return updateOrderStatus(pool, clientId, orderId, "CLOSED", options);
}

async function updateOrderItemStatus(pool, clientId, orderItemId, nextStatus) {
  const normalizedStatus = normalizeStatus(nextStatus, ORDER_STATUS_FLOW, "NEW");
  const item = await orderModel.updateOrderItemStatus(pool, clientId, orderItemId, normalizedStatus);
  if (!item) {
    throw createHttpError(404, "Order item not found.");
  }

  return item;
}

module.exports = {
  createOrder,
  closeOrder,
  getOrder,
  listOrders,
  updateOrderItemStatus,
  updateOrderStatus,
  updatePaymentStatus
};
