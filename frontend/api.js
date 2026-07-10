/**
 * api.js — MongoDB/Express backend service layer
 * All calls go to the Express server at /api/*
 * JWT is stored in localStorage under "mt_jwt" and "mt_user"
 */

let BASE_URL = "https://toys-shop-1.onrender.com/api";
try {
  if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
    BASE_URL = import.meta.env.VITE_API_URL;
  }
} catch (e) {}

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
    if (res.status === 401 && (data.message.includes('Invalid token') || data.message.includes('expired') || data.message.includes('User no longer exists') || data.message.includes('No token'))) {
      localStorage.removeItem("mt_jwt");
      localStorage.removeItem("mt_user");
      window.location.reload();
    }
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
  const res = await fetch(`${BASE_URL}/orders/razorpay/create`, {
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
  const res = await fetch(`${BASE_URL}/orders/razorpay/verify`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(paymentData),
  });
  return handleResponse(res);
}

// ── Products ─────────────────────────────────────────────────────────────────

/**
 * Get all products
 */
export async function apiGetProducts() {
  const res = await fetch(`${BASE_URL}/products`);
  return handleResponse(res);
}

/**
 * Create a new product (admin)
 */
export async function apiCreateProduct(productData) {
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(productData),
  });
  return handleResponse(res);
}

/**
 * Update a product (admin)
 */
export async function apiUpdateProduct(productId, productData) {
  const res = await fetch(`${BASE_URL}/products/${productId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(productData),
  });
  return handleResponse(res);
}

/**
 * Delete a product (admin)
 */
export async function apiDeleteProduct(productId) {
  const res = await fetch(`${BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * Submit a product review (registered/purchased customers)
 */
export async function apiCreateProductReview(productId, rating, comment) {
  const res = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ rating, comment }),
  });
  return handleResponse(res);
}

// ── Categories ───────────────────────────────────────────────────────────────

/**
 * Get active categories (public) — includes subcategories & product counts
 */
export async function apiGetCategories() {
  const res = await fetch(`${BASE_URL}/categories`);
  return handleResponse(res);
}

/**
 * Get ALL categories for admin (including inactive)
 */
export async function apiGetAllCategoriesAdmin() {
  const res = await fetch(`${BASE_URL}/categories/admin/all`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * Get single category by ID
 */
export async function apiGetCategoryById(id) {
  const res = await fetch(`${BASE_URL}/categories/${id}`);
  return handleResponse(res);
}

/**
 * Create a new category (admin)
 */
export async function apiCreateCategory(categoryData) {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(categoryData),
  });
  return handleResponse(res);
}

/**
 * Update a category (admin)
 */
export async function apiUpdateCategory(id, categoryData) {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(categoryData),
  });
  return handleResponse(res);
}

/**
 * Delete a category (admin)
 */
export async function apiDeleteCategory(id) {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * Reorder categories (admin) — pass array of category IDs in new order
 */
export async function apiReorderCategories(orderedIds) {
  const res = await fetch(`${BASE_URL}/categories/reorder`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ orderedIds }),
  });
  return handleResponse(res);
}

/**
 * Bulk update category status (admin)
 */
export async function apiBulkCategoryStatus(ids, isActive) {
  const res = await fetch(`${BASE_URL}/categories/bulk-status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ ids, isActive }),
  });
  return handleResponse(res);
}

/**
 * Bulk delete categories (admin)
 */
export async function apiBulkDeleteCategories(ids) {
  const res = await fetch(`${BASE_URL}/categories/bulk-delete`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  });
  return handleResponse(res);
}

// ── Subcategories ────────────────────────────────────────────────────────────

/**
 * Get subcategories for a category
 */
export async function apiGetSubcategories(categoryId) {
  const res = await fetch(`${BASE_URL}/subcategories/${categoryId}`);
  return handleResponse(res);
}

/**
 * Create a subcategory (admin)
 */
export async function apiCreateSubcategory(subcategoryData) {
  const res = await fetch(`${BASE_URL}/subcategories`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(subcategoryData),
  });
  return handleResponse(res);
}

/**
 * Update a subcategory (admin)
 */
export async function apiUpdateSubcategory(id, subcategoryData) {
  const res = await fetch(`${BASE_URL}/subcategories/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(subcategoryData),
  });
  return handleResponse(res);
}

/**
 * Delete a subcategory (admin)
 */
export async function apiDeleteSubcategory(id) {
  const res = await fetch(`${BASE_URL}/subcategories/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * Reorder subcategories (admin)
 */
export async function apiReorderSubcategories(orderedIds) {
  const res = await fetch(`${BASE_URL}/subcategories/reorder`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ orderedIds }),
  });
  return handleResponse(res);
}
