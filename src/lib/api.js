// Client API layer communicating exclusively with backend /api/* endpoints
const API_BASE = '/api';

export async function createOrder(orderData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create order');
  return data.order;
}

export async function getOrder(orderId) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch order');
  return data.order;
}

export async function confirmOrder(orderId) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}/confirm`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to confirm order');
    err.order = data.order;
    err.status = res.status;
    throw err;
  }
  return data.order;
}

export async function cancelOrder(orderId, reason = 'Cancelled by Student') {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to cancel order');
  return data.order;
}

export async function updateOrderStatus(orderId, status, reason = null) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reason })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update order status');
  return data.order;
}

export async function deleteOrder(orderId) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete order');
  return true;
}

export async function getAllOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
  return data.orders;
}

export async function getStudentOrders(studentIdentifier) {
  const res = await fetch(`${API_BASE}/orders/student/${encodeURIComponent(studentIdentifier)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch student orders');
  return data.orders;
}

export async function getSystemStatus() {
  const res = await fetch(`${API_BASE}/system/status`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch system status');
  return data;
}

export async function updateSystemSettings(settings) {
  const res = await fetch(`${API_BASE}/system/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update settings');
  return data;
}

export async function updateRestaurantStatus(restaurantId, status) {
  const res = await fetch(`${API_BASE}/restaurants/${encodeURIComponent(restaurantId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update restaurant status');
  return data;
}
