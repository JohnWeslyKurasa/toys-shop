import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  getDocs,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const hasFirebaseKeys = firebaseConfig.apiKey && 
                         firebaseConfig.projectId && 
                         firebaseConfig.apiKey !== "undefined" && 
                         firebaseConfig.projectId !== "undefined" &&
                         firebaseConfig.apiKey !== "null" && 
                         firebaseConfig.projectId !== "null" &&
                         firebaseConfig.apiKey.trim() !== "" &&
                         firebaseConfig.projectId.trim() !== "";

let app;
let auth;
let db;
let useMock = !hasFirebaseKeys;

if (!useMock) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Safe Analytics Initialization
    isSupported().then(yes => {
      if (yes && firebaseConfig.measurementId && firebaseConfig.measurementId !== "undefined" && firebaseConfig.measurementId !== "null") {
        try {
          getAnalytics(app);
        } catch (analyticsErr) {
          console.warn("Firebase Analytics initialization skipped/failed:", analyticsErr.message);
        }
      }
    });
    console.log("Client Firebase initialized successfully ✅");
  } catch (err) {
    console.error("Firebase init failed, switching to mock mode:", err);
    useMock = true;
  }
} else {
  console.warn("⚠️ Firebase environment variables are not configured in Vercel. Auth and Database will run in offline/mock mode.");
}

// Mock State for Demo Mode
let authStateListeners = [];
const mockAuthObj = {
  currentUser: JSON.parse(localStorage.getItem("mt_mock_user")) || null
};

export function onAuthStateChanged(authInstance, callback) {
  if (!useMock) {
    return firebaseOnAuthStateChanged(auth, callback);
  }
  authStateListeners.push(callback);
  callback(mockAuthObj.currentUser);
  return () => {
    authStateListeners = authStateListeners.filter(l => l !== callback);
  };
}

function triggerAuthStateChange(user) {
  mockAuthObj.currentUser = user;
  authStateListeners.forEach(cb => {
    try { cb(user); } catch (e) { console.error(cb, e); }
  });
}

const exportedAuth = !useMock ? auth : mockAuthObj;
const exportedDb = !useMock ? db : {};
export { exportedAuth as auth, exportedDb as db };

/**
 * Register a new user with email/password and save details in Firestore
 */
export async function signUpUser(name, email, phone, password) {
  if (!useMock) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      phone: phone,
      role: "user",
      createdDate: serverTimestamp()
    });
    
    return user;
  } else {
    const mockUser = {
      uid: "mock-uid-" + Math.floor(100000 + Math.random() * 900000),
      email: email,
      displayName: name
    };
    
    const profiles = JSON.parse(localStorage.getItem("mt_mock_profiles") || "{}");
    profiles[mockUser.uid] = {
      uid: mockUser.uid,
      name: name,
      email: email,
      phone: phone,
      role: "user",
      createdDate: { seconds: Math.floor(Date.now() / 1000) }
    };
    localStorage.setItem("mt_mock_profiles", JSON.stringify(profiles));
    localStorage.setItem("mt_mock_user", JSON.stringify(mockUser));
    
    triggerAuthStateChange(mockUser);
    return mockUser;
  }
}

/**
 * Log in an existing user
 */
export async function loginUser(email, password) {
  if (!useMock) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } else {
    if (email === "admin@motherntoddler.com" && password === "AdminPassword123") {
      const mockAdmin = {
        uid: "mock-admin-uid",
        email: "admin@motherntoddler.com",
        displayName: "Shopkeeper Admin"
      };
      localStorage.setItem("mt_mock_user", JSON.stringify(mockAdmin));
      triggerAuthStateChange(mockAdmin);
      return mockAdmin;
    }
    
    const profiles = JSON.parse(localStorage.getItem("mt_mock_profiles") || "{}");
    let matchedUid = null;
    for (const uid in profiles) {
      if (profiles[uid].email.toLowerCase() === email.toLowerCase()) {
        matchedUid = uid;
        break;
      }
    }
    
    const mockUser = {
      uid: matchedUid || "mock-uid-" + Math.floor(100000 + Math.random() * 900000),
      email: email,
      displayName: matchedUid ? profiles[matchedUid].name : email.split("@")[0]
    };
    
    if (!matchedUid) {
      profiles[mockUser.uid] = {
        uid: mockUser.uid,
        name: mockUser.displayName,
        email: email,
        phone: "9999999999",
        role: "user",
        createdDate: { seconds: Math.floor(Date.now() / 1000) }
      };
      localStorage.setItem("mt_mock_profiles", JSON.stringify(profiles));
    }
    
    localStorage.setItem("mt_mock_user", JSON.stringify(mockUser));
    triggerAuthStateChange(mockUser);
    return mockUser;
  }
}

/**
 * Log out the current user
 */
export async function logoutUser() {
  if (!useMock) {
    await signOut(auth);
  } else {
    localStorage.removeItem("mt_mock_user");
    triggerAuthStateChange(null);
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
  if (!useMock) {
    await sendPasswordResetEmail(auth, email);
  } else {
    console.log("Mock password reset email sent to:", email);
  }
}

/**
 * Fetch profile data for a specific user ID
 */
export async function getUserProfile(uid) {
  if (!useMock) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } else {
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
    const profiles = JSON.parse(localStorage.getItem("mt_mock_profiles") || "{}");
    return profiles[uid] || null;
  }
}

/**
 * Update profile data for a specific user ID
 */
export async function updateUserProfile(uid, data) {
  if (!useMock) {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, data);
  } else {
    const profiles = JSON.parse(localStorage.getItem("mt_mock_profiles") || "{}");
    if (profiles[uid]) {
      profiles[uid] = { ...profiles[uid], ...data };
      localStorage.setItem("mt_mock_profiles", JSON.stringify(profiles));
    }
    
    const currentUser = JSON.parse(localStorage.getItem("mt_mock_user") || "null");
    if (currentUser && currentUser.uid === uid && data.name) {
      currentUser.displayName = data.name;
      localStorage.setItem("mt_mock_user", JSON.stringify(currentUser));
      triggerAuthStateChange(currentUser);
    }
  }
}

/**
 * Create a new order document in Firestore
 */
export async function placeOrder(userId, name, email, phone, cartItems, subtotal, shippingAddress = "", paymentMethod = "COD", paymentStatus = "Pending") {
  const orderId = "MT-" + Math.floor(100000 + Math.random() * 900000);

  let productsList = [];
  try {
    const savedProducts = localStorage.getItem("mt_products");
    if (savedProducts) {
      productsList = JSON.parse(savedProducts);
    }
  } catch (e) {
    console.error("Failed to parse mt_products from localStorage:", e);
  }

  const productsArray = Array.isArray(cartItems) ? cartItems : [];
  const mappedProducts = productsArray.map(item => {
    const prod = productsList.find(p => p.id === item.productId || p.id === Number(item.productId));
    return {
      productId: item?.productId !== undefined && item?.productId !== null ? String(item.productId) : "",
      name: item?.name || prod?.name || "Unknown Product",
      price: typeof item?.price === 'number' ? item.price : (prod?.price !== undefined ? Number(prod.price) : 0),
      quantity: typeof item?.quantity === 'number' ? item.quantity : (typeof item?.qty === 'number' ? item.qty : 1),
      image: item?.image || prod?.image || ""
    };
  });

  let totalAmountVal = typeof subtotal === 'number' && !isNaN(subtotal) ? subtotal : Number(subtotal);
  if (isNaN(totalAmountVal) || totalAmountVal <= 0) {
    totalAmountVal = mappedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  const orderData = {
    orderId: orderId || null,
    userId: userId || null,
    customerName: name !== undefined && name !== null ? name.trim() : "",
    customerEmail: email !== undefined && email !== null ? email.trim() : "",
    customerPhone: phone !== undefined && phone !== null ? phone.trim() : "",
    shippingAddress: shippingAddress !== undefined && shippingAddress !== null ? shippingAddress.trim() : "",
    paymentMethod: paymentMethod || "COD",
    paymentStatus: paymentStatus || "Pending",
    products: mappedProducts,
    items: mappedProducts,
    totalAmount: totalAmountVal,
    subtotal: totalAmountVal,
    status: "Pending",
    createdDate: !useMock ? serverTimestamp() : { seconds: Math.floor(Date.now() / 1000) }
  };

  if (!orderData.orderId) throw new Error("Order ID generation failed.");
  if (!orderData.userId) throw new Error("User ID is missing. Please sign in to place an order.");
  if (!orderData.customerName) throw new Error("Customer Name is required.");
  if (!orderData.customerEmail) throw new Error("Customer Email is required.");
  if (!orderData.customerPhone) throw new Error("Customer Phone Number is required.");
  if (!orderData.shippingAddress) throw new Error("Shipping Address is required.");
  if (orderData.products.length === 0) throw new Error("Your cart is empty. Please add items before checking out.");

  for (const prod of orderData.products) {
    if (!prod.productId) throw new Error("Product ID is missing for one of the items.");
    if (!prod.name) throw new Error("Product Name is missing for one of the items.");
    if (prod.price <= 0) throw new Error(`Invalid price for product: ${prod.name}`);
    if (prod.quantity <= 0) throw new Error(`Invalid quantity for product: ${prod.name}`);
  }

  if (orderData.totalAmount <= 0) throw new Error("Order total amount must be greater than zero.");

  if (!useMock) {
    const orderRef = doc(db, "orders", orderData.orderId);
    await setDoc(orderRef, orderData);
  } else {
    const orders = JSON.parse(localStorage.getItem("mt_mock_orders") || "[]");
    orders.push(orderData);
    localStorage.setItem("mt_mock_orders", JSON.stringify(orders));
  }

  return orderData.orderId;
}

/**
 * Retrieve all orders ordered by createdDate descending
 */
export async function getAllOrders() {
  if (!useMock) {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdDate", "desc"));
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push(doc.data());
    });
    return orders;
  } else {
    const orders = JSON.parse(localStorage.getItem("mt_mock_orders") || "[]");
    return orders.sort((a, b) => (b.createdDate?.seconds || 0) - (a.createdDate?.seconds || 0));
  }
}

/**
 * Update the status of an order in Firestore
 */
export async function updateOrderStatus(orderId, newStatus) {
  if (!useMock) {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status: newStatus });
  } else {
    const orders = JSON.parse(localStorage.getItem("mt_mock_orders") || "[]");
    const matched = orders.find(o => o.orderId === orderId);
    if (matched) {
      matched.status = newStatus;
      localStorage.setItem("mt_mock_orders", JSON.stringify(orders));
    }
  }
}

/**
 * Retrieve all orders for a specific customer/user ID ordered by createdDate descending
 */
export async function getCustomerOrders(userId) {
  if (!useMock) {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push(doc.data());
    });
    orders.sort((a, b) => (b.createdDate?.seconds || 0) - (a.createdDate?.seconds || 0));
    return orders;
  } else {
    const orders = JSON.parse(localStorage.getItem("mt_mock_orders") || "[]");
    const filtered = orders.filter(o => o.userId === userId);
    return filtered.sort((a, b) => (b.createdDate?.seconds || 0) - (a.createdDate?.seconds || 0));
  }
}

/**
 * Ensures a default admin account exists with admin@motherntoddler.com / AdminPassword123
 */
export async function ensureDefaultAdminAccount() {
  if (!useMock) {
    const adminEmail = "admin@motherntoddler.com";
    const adminPassword = "AdminPassword123";
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      const user = userCredential.user;
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: "Shopkeeper Admin",
        email: adminEmail,
        phone: "9876543210",
        role: "admin",
        createdDate: serverTimestamp()
      });
      console.log("Default admin account created: admin@motherntoddler.com / AdminPassword123");
    } catch (err) {
      if (err.code !== "auth/email-already-in-use") {
        console.error("Error creating default admin account:", err);
      }
    }
  }
}

/**
 * Save an order directly to Firestore from the client side (e.g. as fallback)
 */
export async function saveOrderDirectly(orderId, orderData) {
  if (!useMock) {
    const orderRef = doc(db, "orders", orderId);
    const finalData = {
      ...orderData,
      createdDate: serverTimestamp()
    };
    await setDoc(orderRef, finalData);
  } else {
    const orders = JSON.parse(localStorage.getItem("mt_mock_orders") || "[]");
    if (!orders.some(o => o.orderId === orderId)) {
      orders.push({
        ...orderData,
        createdDate: { seconds: Math.floor(Date.now() / 1000) }
      });
      localStorage.setItem("mt_mock_orders", JSON.stringify(orders));
    }
  }
  return orderId;
}
