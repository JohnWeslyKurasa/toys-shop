import { apiLogin, apiGetAllOrders, apiCreateProduct, getStoredUser } from './api.js';

// DOM Elements
const loginSection = document.getElementById("adminLoginSection");
const dashboardSection = document.getElementById("adminDashboardSection");
const loginForm = document.getElementById("adminLoginForm");
const emailInput = document.getElementById("adminEmail");
const passwordInput = document.getElementById("adminPassword");
const logoutBtn = document.getElementById("adminLogoutBtn");

const navItems = document.querySelectorAll(".nav-item");
const tabContents = document.querySelectorAll(".tab-content");
const ordersTableBody = document.getElementById("adminOrdersTableBody");
const refreshOrdersBtn = document.getElementById("refreshOrdersBtn");

const addProductForm = document.getElementById("adminAddProductForm");
const submitProductBtn = document.getElementById("adminSubmitBtn");

// ── Toasts ──
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── Initialization ──
function checkAuth() {
  const user = getStoredUser();
  if (user && user.role === 'admin') {
    loginSection.style.display = "none";
    dashboardSection.style.display = "flex";
    loadOrders();
  } else {
    loginSection.style.display = "flex";
    dashboardSection.style.display = "none";
  }
}

// ── Authentication ──
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("adminLoginBtn");
  btn.disabled = true;
  btn.innerText = "Logging in...";

  try {
    const res = await apiLogin(emailInput.value, passwordInput.value);
    if (res.success && res.user.role === 'admin') {
      showToast("Welcome Admin", "success");
      checkAuth();
    } else {
      // If user is not admin
      if (res.success && res.user.role !== 'admin') {
        showToast("Access Denied: Not an admin", "error");
        localStorage.removeItem("mt_jwt");
        localStorage.removeItem("mt_user");
      } else {
        showToast(res.message || "Login failed", "error");
      }
    }
  } catch (error) {
    showToast(error.message || "An error occurred", "error");
  } finally {
    btn.disabled = false;
    btn.innerText = "Login to Dashboard";
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("mt_jwt");
  localStorage.removeItem("mt_user");
  checkAuth();
});

// ── Tab Switching ──
navItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    navItems.forEach(nav => nav.classList.remove("active"));
    item.classList.add("active");

    tabContents.forEach(content => content.style.display = "none");
    const targetTab = item.getAttribute("data-tab");
    document.getElementById(`${targetTab}Tab`).style.display = "block";

    if (targetTab === 'orders') {
      loadOrders();
    }
  });
});

// ── Load Orders ──
async function loadOrders() {
  ordersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">Loading orders...</td></tr>`;
  try {
    const res = await apiGetAllOrders();
    if (res.success && res.orders) {
      if (res.orders.length === 0) {
        ordersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">No orders found.</td></tr>`;
        return;
      }
      
      ordersTableBody.innerHTML = res.orders.map(order => `
        <tr>
          <td>${order._id.substring(0, 8)}...</td>
          <td>${new Date(order.createdAt).toLocaleDateString()}</td>
          <td>${order.user ? order.user.name : 'Guest'}</td>
          <td>₹${order.totalAmount}</td>
          <td><span style="padding: 4px 8px; border-radius: 4px; background: #e0e0e0; font-size: 0.85rem; font-weight: 600;">${order.paymentStatus || 'Pending'}</span></td>
          <td><a href="#" style="color: var(--primary);">View</a></td>
        </tr>
      `).join('');
    } else {
      ordersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: red;">Failed to load orders</td></tr>`;
    }
  } catch (err) {
    ordersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: red;">Error loading orders</td></tr>`;
  }
}

refreshOrdersBtn.addEventListener("click", loadOrders);

// ── Add Product (Cloudinary Upload) ──
addProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const fileInput = document.getElementById("adminProductImage");
  const file = fileInput.files[0];
  if (!file) {
    showToast("Please select an image.", "error");
    return;
  }

  submitProductBtn.disabled = true;
  submitProductBtn.textContent = "Uploading Image...";

  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !uploadPreset || cloudName.includes('your_cloud_name')) {
      showToast("Cloudinary credentials missing in .env", "error");
      submitProductBtn.disabled = false;
      submitProductBtn.textContent = "Publish Product";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData
    });

    if (!cloudinaryRes.ok) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    const cloudinaryData = await cloudinaryRes.json();
    const imageUrl = cloudinaryData.secure_url;

    submitProductBtn.textContent = "Saving Product...";

    const productData = {
      name: document.getElementById("adminProductName").value,
      price: Number(document.getElementById("adminProductPrice").value),
      originalPrice: document.getElementById("adminProductOriginalPrice").value ? Number(document.getElementById("adminProductOriginalPrice").value) : null,
      category: document.getElementById("adminProductCategory").value,
      description: document.getElementById("adminProductDescription").value,
      ageGroup: document.getElementById("adminProductAgeGroup").value,
      inStock: document.getElementById("adminProductInStock").checked,
      isNewProduct: document.getElementById("adminProductIsNew").checked,
      isSale: document.getElementById("adminProductIsSale").checked,
      image: imageUrl
    };

    const response = await apiCreateProduct(productData);

    if (response.success || response._id || response.id || (response.data && response.data._id)) {
      showToast("Product added successfully!", "success");
      addProductForm.reset();
    } else {
      showToast(response.message || "Failed to save product", "error");
    }

  } catch (err) {
    console.error(err);
    showToast("Error adding product.", "error");
  } finally {
    submitProductBtn.disabled = false;
    submitProductBtn.textContent = "Publish Product";
  }
});

// Run auth check on load
checkAuth();
