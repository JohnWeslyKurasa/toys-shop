/**
 * api.js — MongoDB/Express backend service layer
 * All calls go to the Express server at /api/*
 * JWT is stored in localStorage under "mt_jwt" and "mt_user"
 */

const BASE_URL = "/api"; // Routed through Vite proxy → Express on :3000

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getJwt() {
  return localStorage.getItem("mt_jwt") || null;
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("mt_user")) || null;
  } catch {
    return null;
  }
}

function setSession(token, user) {
  localStorage.setItem("mt_jwt", token);
  localStorage.setItem("mt_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("mt_jwt");
  localStorage.removeItem("mt_user");
}

function authHeaders() {
  const token = getJwt();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Register a new user — returns { token, user }
 */
export async function apiRegister(name, email, phone, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password }),
  });
  const data = await handleResponse(res);
  setSession(data.token, data.user);
  return data;
}

/**
 * Login — returns { token, user }
 */
export async function apiLogin(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  setSession(data.token, data.user);
  return data;
}

/**
 * Logout — clears local session
 */
export function apiLogout() {
  clearSession();
}

/**
 * Get logged-in user's profile from backend
 */
export async function apiGetProfile() {
  const res = await fetch(`${BASE_URL}/auth/profile`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ── Orders ────────────────────────────────────────────────────────────────────

/**
 * Place an order — saves to MongoDB
 * @param {object} orderPayload — { items, totalAmount, paymentId, paymentStatus, shippingAddress, notes }
 */
export async function apiPlaceOrder(orderPayload) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(orderPayload),
  });
  return handleResponse(res);
}

/**
 * Get orders for the currently logged-in user
 */
export async function apiGetMyOrders() {
  const res = await fetch(`${BASE_URL}/orders/me`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * Get all orders (admin only)
 */
export async function apiGetAllOrders() {
  const res = await fetch(`${BASE_URL}/orders`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * Update order status (admin only)
 * @param {string} orderId — MongoDB _id of the order
 * @param {string} status  — new status string
 */
export async function apiUpdateOrderStatus(orderId, status) {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

// ── Payment ──────────────────────────────────────────────────────────────────

/**
 * Create a Razorpay Order
 */
export async function apiCreateRazorpayOrder(amount, currency = 'INR') {
  const res = await fetch(`${BASE_URL}/payment/razorpay-order`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ amount, currency }),
  });
  return handleResponse(res);
}

/**
 * Verify Razorpay Payment
 */
export async function apiVerifyPayment(paymentData) {
  const res = await fetch(`${BASE_URL}/payment/verify`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(paymentData),
  });
  return handleResponse(res);
}
