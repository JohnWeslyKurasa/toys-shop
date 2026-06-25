const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const STORAGE_USER_KEY = "mt_backend_auth_user";
const STORAGE_TOKEN_KEY = "mt_backend_auth_token";
const STORAGE_PROFILES_KEY = "mt_mock_profiles";
const STORAGE_ORDERS_KEY = "mt_mock_orders";

let authStateListeners = [];
let currentUser = null;
let authToken = null;
let useMock = false;

if (typeof window !== "undefined") {
  currentUser = JSON.parse(localStorage.getItem(STORAGE_USER_KEY) || "null");
  authToken = localStorage.getItem(STORAGE_TOKEN_KEY);
}

const auth = {
  get currentUser() {
    return currentUser;
  }
};

const db = {};

function triggerAuthStateChange(user) {
  currentUser = user;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  }
  authStateListeners.forEach((cb) => {
    try { cb(user); } catch (e) { console.error(e); }
  });
}

export function onAuthStateChanged(authInstance, callback) {
  authStateListeners.push(callback);
  callback(currentUser);
  return () => {
    authStateListeners = authStateListeners.filter((listener) => listener !== callback);
  };
}

function getHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

async function backendFetch(path, options = {}) {
  if (useMock) {
    throw new Error("Mock mode enabled");
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, options);
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json") ? await response.json() : null;

    if (!response.ok) {
      const message = body?.message || response.statusText || "Backend request failed";
      throw new Error(message);
    }

    return body;
  } catch (err) {
    if (typeof window !== "undefined" && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
      console.warn("Backend unreachable, switching to mock mode:", err.message);
      useMock = true;
    }
    throw err;
  }
}

function normalizeUser(user) {
  if (!user) return null;
  return {
    uid: user.uid || user._id || user.id,
    name: user.name || user.displayName || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "user"
  };
}

function setSession(user, token) {
  authToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_TOKEN_KEY, token || "");
  }
  const normalized = normalizeUser(user);
  triggerAuthStateChange(normalized);
}

async function setMockUser(user) {
  if (typeof window !== "undefined") {
    localStorage.setItem("mt_mock_user", JSON.stringify(user));
  }
  triggerAuthStateChange(user);
}

async function ensureMockDataKeys() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(STORAGE_PROFILES_KEY)) {
    localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify({}));
  }
  if (!localStorage.getItem(STORAGE_ORDERS_KEY)) {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify([]));
  }
}

export async function signUpUser(name, email, phone, password) {
  if (!useMock) {
    try {
      const payload = await backendFetch("/api/auth/signup", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name, email, phone, password })
      });
      setSession(payload.user, payload.token);
      return payload.user;
    } catch (err) {
      if (!useMock) throw err;
    }
  }

  await ensureMockDataKeys();
  const mockUser = {
    uid: "mock-uid-" + Math.floor(100000 + Math.random() * 900000),
    email,
    displayName: name,
    name,
    phone
  };

  const profiles = JSON.parse(localStorage.getItem(STORAGE_PROFILES_KEY) || "{}");
  profiles[mockUser.uid] = {
    uid: mockUser.uid,
    name,
    email,
    phone,
    role: "user",
    createdDate: { seconds: Math.floor(Date.now() / 1000) }
  };
  localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
  setMockUser({ uid: mockUser.uid, email, displayName: name, name, phone });
  return mockUser;
}

export async function loginUser(email, password) {
  if (!useMock) {
    try {
      const payload = await backendFetch("/api/auth/login", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, password })
      });
      setSession(payload.user, payload.token);
      return payload.user;
    } catch (err) {
      if (!useMock) throw err;
    }
  }

  await ensureMockDataKeys();
  if (email === "admin@motherntoddler.com" && password === "AdminPassword123") {
    const mockAdmin = {
      uid: "mock-admin-uid",
      email: "admin@motherntoddler.com",
      displayName: "Shopkeeper Admin",
      name: "Shopkeeper Admin",
      phone: "9876543210",
      role: "admin"
    };
    setMockUser(mockAdmin);
    return mockAdmin;
  }

  const profiles = JSON.parse(localStorage.getItem(STORAGE_PROFILES_KEY) || "{}");
  let matchedUid = null;
  for (const uid in profiles) {
    if (profiles[uid].email.toLowerCase() === email.toLowerCase()) {
      matchedUid = uid;
      break;
    }
  }

  const mockUser = {
    uid: matchedUid || "mock-uid-" + Math.floor(100000 + Math.random() * 900000),
    email,
    displayName: matchedUid ? profiles[matchedUid].name : email.split("@")[0],
    name: matchedUid ? profiles[matchedUid].name : email.split("@")[0],
    phone: matchedUid ? profiles[matchedUid].phone : "9999999999",
    role: matchedUid ? profiles[matchedUid].role : "user"
  };

  if (!matchedUid) {
    profiles[mockUser.uid] = {
      uid: mockUser.uid,
      name: mockUser.name,
      email,
      phone: mockUser.phone,
      role: mockUser.role,
      createdDate: { seconds: Math.floor(Date.now() / 1000) }
    };
    localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
  }

  setMockUser(mockUser);
  return mockUser;
}

export async function logoutUser() {
  authToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  }
  triggerAuthStateChange(null);
}

export async function resetPassword(email) {
  if (!useMock) {
    try {
      await backendFetch("/api/auth/reset-password", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email })
      });
      return;
    } catch (err) {
      if (!useMock) throw err;
    }
  }
  console.log("Mock password reset email sent to:", email);
}

export async function getUserProfile(uid) {
  if (!useMock && authToken) {
    try {
      const payload = await backendFetch("/api/auth/profile", {
        method: "GET",
        headers: getHeaders()
      });
      return payload.profile;
    } catch (err) {
      if (!useMock) throw err;
    }
  }

  await ensureMockDataKeys();
  if (uid === "mock-admin-uid") {
    return {
      uid: "mock-admin-uid",
      name: "Shopkeeper Admin",
      email: "admin@motherntoddler.com",
      phone: "9876543210",
      role: "admin",
      createdDate: { seconds: Math.floor(Date.now() / 1000) }
    };
  }
  const profiles = JSON.parse(localStorage.getItem(STORAGE_PROFILES_KEY) || "{}");
  return profiles[uid] || null;
}

export async function updateUserProfile(uid, data) {
  if (!useMock && authToken) {
    try {
      const payload = await backendFetch("/api/auth/profile", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      const updated = payload.profile;
      setSession(updated, authToken);
      return updated;
    } catch (err) {
      if (!useMock) throw err;
    }
  }

  await ensureMockDataKeys();
  const profiles = JSON.parse(localStorage.getItem(STORAGE_PROFILES_KEY) || "{}");
  if (profiles[uid]) {
    profiles[uid] = { ...profiles[uid], ...data };
    localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
  }
  const currentUserObj = JSON.parse(localStorage.getItem("mt_mock_user") || "null");
  if (currentUserObj && currentUserObj.uid === uid && data.name) {
    currentUserObj.displayName = data.name;
    localStorage.setItem("mt_mock_user", JSON.stringify(currentUserObj));
    triggerAuthStateChange(currentUserObj);
  }
}

export async function placeOrder(userId, name, email, phone, cartItems, subtotal, shippingAddress = "", paymentMethod = "COD", paymentStatus = "Pending") {
  if (!useMock && authToken) {
    try {
      const payload = await backendFetch("/api/orders", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ userId, name, email, phone, cartItems, subtotal, shippingAddress, paymentMethod, paymentStatus })
      });
      return payload.orderId;
    } catch (err) {
      if (!useMock) throw err;
    }
  }

  const orderId = "MT-" + Math.floor(100000 + Math.random() * 900000);
  const savedProducts = JSON.parse(localStorage.getItem("mt_products") || "[]");
  const productsArray = Array.isArray(cartItems) ? cartItems : [];
  const mappedProducts = productsArray.map((item) => {
    const prod = savedProducts.find((p) => p.id === item.productId || p.id === Number(item.productId));
    return {
      productId: item?.productId !== undefined && item?.productId !== null ? String(item.productId) : "",
      name: item?.name || prod?.name || "Unknown Product",
      price: typeof item?.price === "number" ? item.price : (prod?.price !== undefined ? Number(prod.price) : 0),
      quantity: typeof item?.quantity === "number" ? item.quantity : (typeof item?.qty === "number" ? item.qty : 1),
      image: item?.image || prod?.image || ""
    };
  });

  const totalAmountVal = typeof subtotal === "number" && !isNaN(subtotal) ? subtotal : Number(subtotal);
  const orderData = {
    orderId,
    userId,
    customerName: name?.trim() || "",
    customerEmail: email?.trim() || "",
    customerPhone: phone?.trim() || "",
    shippingAddress: shippingAddress?.trim() || "",
    paymentMethod,
    paymentStatus,
    products: mappedProducts,
    items: mappedProducts,
    totalAmount: totalAmountVal,
    subtotal: totalAmountVal,
    status: "Pending",
    createdDate: { seconds: Math.floor(Date.now() / 1000) }
  };
  const orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY) || "[]");
  orders.push(orderData);
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  return orderId;
}

export async function getAllOrders() {
  if (!useMock && authToken) {
    try {
      const payload = await backendFetch("/api/orders", { method: "GET", headers: getHeaders() });
      return payload.orders || [];
    } catch (err) {
      if (!useMock) throw err;
    }
  }

  const orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY) || "[]");
  return orders.sort((a, b) => (b.createdDate?.seconds || 0) - (a.createdDate?.seconds || 0));
}

export async function updateOrderStatus(orderId, newStatus) {
  if (!useMock && authToken) {
    try {
      await backendFetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ newStatus })
      });
      return;
    } catch (err) {
      if (!useMock) throw err;
    }
  }

  const orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY) || "[]");
  const matched = orders.find((o) => o.orderId === orderId);
  if (matched) {
    matched.status = newStatus;
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  }
}

export async function getCustomerOrders(userId) {
  if (!useMock && authToken) {
    try {
      const payload = await backendFetch("/api/orders/me", { method: "GET", headers: getHeaders() });
      return payload.orders || [];
    } catch (err) {
      if (!useMock) throw err;
    }
  }

  const orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY) || "[]");
  const filtered = orders.filter((o) => o.userId === userId);
  return filtered.sort((a, b) => (b.createdDate?.seconds || 0) - (a.createdDate?.seconds || 0));
}

export async function ensureDefaultAdminAccount() {
  if (!useMock) {
    try {
      await backendFetch("/api/auth/ensure-admin", { method: "POST", headers: getHeaders() });
      return;
    } catch (err) {
      console.warn("Ensure admin failed, switching to mock mode if needed:", err.message);
    }
  }

  await ensureMockDataKeys();
  const profiles = JSON.parse(localStorage.getItem(STORAGE_PROFILES_KEY) || "{}");
  if (!profiles["mock-admin-uid"]) {
    profiles["mock-admin-uid"] = {
      uid: "mock-admin-uid",
      name: "Shopkeeper Admin",
      email: "admin@motherntoddler.com",
      phone: "9876543210",
      role: "admin",
      createdDate: { seconds: Math.floor(Date.now() / 1000) }
    };
    localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
  }
}

export async function saveOrderDirectly(orderId, orderData) {
  const orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY) || "[]");
  if (!orders.some((o) => o.orderId === orderId)) {
    orders.push({
      ...orderData,
      createdDate: { seconds: Math.floor(Date.now() / 1000) }
    });
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  }
  return orderId;
}

export { auth as auth, db as db };
