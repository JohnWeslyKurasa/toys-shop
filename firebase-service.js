import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Safe Analytics Initialization
isSupported().then(yes => {
  if (yes) getAnalytics(app);
});

/**
 * Register a new user with email/password and save details in Firestore
 */
export async function signUpUser(name, email, phone, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Store profile under users collection
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name: name,
    email: email,
    phone: phone,
    role: "user",
    createdDate: serverTimestamp()
  });
  
  return user;
}

/**
 * Log in an existing user
 */
export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Log out the current user
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Fetch profile data for a specific user ID
 */
export async function getUserProfile(uid) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

/**
 * Update profile data for a specific user ID
 */
export async function updateUserProfile(uid, data) {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, data);
}

/**
 * Create a new order document in Firestore
 */
export async function placeOrder(userId, name, email, phone, cartItems, subtotal, shippingAddress = "", paymentMethod = "COD", paymentStatus = "Pending") {
  // 1. Generate Order ID
  const orderId = "MT-" + Math.floor(100000 + Math.random() * 900000);

  // 2. Fetch products from localStorage for data enrichment if needed
  let productsList = [];
  try {
    const savedProducts = localStorage.getItem("mt_products");
    if (savedProducts) {
      productsList = JSON.parse(savedProducts);
    }
  } catch (e) {
    console.error("Failed to parse mt_products from localStorage:", e);
  }

  // 3. Ensure products is always an array
  const productsArray = Array.isArray(cartItems) ? cartItems : [];

  // 4. Map and replace undefined/null/invalid values with safe defaults
  const mappedProducts = productsArray.map(item => {
    // Attempt to lookup item details from local products list if missing
    const prod = productsList.find(p => p.id === item.productId || p.id === Number(item.productId));
    
    return {
      productId: item?.productId !== undefined && item?.productId !== null ? String(item.productId) : "",
      name: item?.name || prod?.name || "Unknown Product",
      price: typeof item?.price === 'number' ? item.price : (prod?.price !== undefined ? Number(prod.price) : 0),
      quantity: typeof item?.quantity === 'number' ? item.quantity : (typeof item?.qty === 'number' ? item.qty : 1),
      image: item?.image || prod?.image || ""
    };
  });

  // 5. Ensure totalAmount is always a number
  let totalAmountVal = typeof subtotal === 'number' && !isNaN(subtotal) ? subtotal : Number(subtotal);
  if (isNaN(totalAmountVal) || totalAmountVal <= 0) {
    // Fallback: calculate subtotal from mapped products
    totalAmountVal = mappedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // 6. Construct orderData object
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
    items: mappedProducts, // For backward compatibility with existing order rendering (uses .items)
    totalAmount: totalAmountVal,
    subtotal: totalAmountVal, // For backward compatibility with existing order rendering (uses .subtotal)
    status: "Pending",
    createdDate: serverTimestamp()
  };

  // 7. Log the complete orderData object
  console.log("Complete orderData object before setDoc:", orderData);

  // 8. Validate all fields and prevent setDoc if required fields are missing
  if (!orderData.orderId) {
    throw new Error("Order ID generation failed.");
  }
  if (!orderData.userId) {
    throw new Error("User ID is missing. Please sign in to place an order.");
  }
  if (!orderData.customerName) {
    throw new Error("Customer Name is required.");
  }
  if (!orderData.customerEmail) {
    throw new Error("Customer Email is required.");
  }
  if (!orderData.customerPhone) {
    throw new Error("Customer Phone Number is required.");
  }
  if (!orderData.shippingAddress) {
    throw new Error("Shipping Address is required.");
  }
  if (orderData.products.length === 0) {
    throw new Error("Your cart is empty. Please add items before checking out.");
  }
  
  // Validate each product item
  for (const prod of orderData.products) {
    if (!prod.productId) {
      throw new Error("Product ID is missing for one of the items.");
    }
    if (!prod.name) {
      throw new Error("Product Name is missing for one of the items.");
    }
    if (prod.price <= 0) {
      throw new Error(`Invalid price for product: ${prod.name}`);
    }
    if (prod.quantity <= 0) {
      throw new Error(`Invalid quantity for product: ${prod.name}`);
    }
  }

  if (orderData.totalAmount <= 0) {
    throw new Error("Order total amount must be greater than zero.");
  }

  // 9. Execute setDoc
  const orderRef = doc(db, "orders", orderData.orderId);
  await setDoc(orderRef, orderData);

  return orderData.orderId;
}

/**
 * Retrieve all orders ordered by createdDate descending
 */
export async function getAllOrders() {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, orderBy("createdDate", "desc"));
  const querySnapshot = await getDocs(q);
  const orders = [];
  querySnapshot.forEach((doc) => {
    orders.push(doc.data());
  });
  return orders;
}

/**
 * Update the status of an order in Firestore
 */
export async function updateOrderStatus(orderId, newStatus) {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, {
    status: newStatus
  });
}

/**
 * Retrieve all orders for a specific customer/user ID ordered by createdDate descending
 */
export async function getCustomerOrders(userId) {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const orders = [];
  querySnapshot.forEach((doc) => {
    orders.push(doc.data());
  });
  // Sort in-memory to avoid needing a Firestore composite index
  orders.sort((a, b) => {
    const dateA = a.createdDate?.seconds || 0;
    const dateB = b.createdDate?.seconds || 0;
    return dateB - dateA;
  });
  return orders;
}

/**
 * Ensures a default admin account exists with admin@motherntoddler.com / AdminPassword123
 */
export async function ensureDefaultAdminAccount() {
  const adminEmail = "admin@motherntoddler.com";
  const adminPassword = "AdminPassword123";
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    // Store profile under users collection with role: "admin"
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

/**
 * Save an order directly to Firestore from the client side (e.g. as fallback)
 */
export async function saveOrderDirectly(orderId, orderData) {
  const orderRef = doc(db, "orders", orderId);
  const finalData = {
    ...orderData,
    createdDate: serverTimestamp()
  };
  await setDoc(orderRef, finalData);
  return orderId;
}

export { auth, db, onAuthStateChanged };
