// Mother & Toddler - Main Application Logic
import { initNotifications, setNotificationAuthToken } from './notifications.js';
// MongoDB/Express API service (only backend used)
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiPlaceOrder,
  apiGetMyOrders,
  apiGetAllOrders,
  apiUpdateOrderStatus,
  getStoredUser,
  getJwt,
  apiCreateRazorpayOrder,
  apiVerifyPayment,
  apiGetProducts,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
  apiGetCategories,
  apiGetAllCategoriesAdmin,
  apiCreateCategory,
  apiUpdateCategory,
  apiDeleteCategory,
  apiReorderCategories,
  apiGetSubcategories,
  apiCreateSubcategory,
  apiUpdateSubcategory,
  apiDeleteSubcategory,
  apiReorderSubcategories,
  apiCreateProductReview
} from "./api.js";

// Default product database in Indian Rupees (₹) with ageGroup properties
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Premium Stacking Wooden Toy Blocks",
    price: 1299,
    originalPrice: 1999,
    category: "Toys > Educational Toys",
    image: "assets/product_toy_blocks.png",
    description: "Toxin-free, organic maple wooden block set in lovely pastel yellow, cream, and soft orange hues. Promotes tactile learning, motor skills, and creative assembly for babies and toddlers.",
    rating: 4.9,
    inStock: true,
    isNew: true,
    isSale: true,
    ageGroup: "1-3"
  },
  {
    id: 2,
    name: "Yellow Duckling Cotton Ruffle Dress",
    price: 999,
    originalPrice: 1299,
    category: "Baby Dresses",
    image: "assets/product_baby_dress.png",
    description: "Extremely soft 100% organic cotton dress featuring a playful ruffle hemline and cute hand-stitched details. Safe for infant skin, and comes with easy-snap diaper access.",
    rating: 4.8,
    inStock: true,
    isNew: true,
    isSale: false,
    ageGroup: "1-3"
  },
  {
    id: 3,
    name: "Safe-Grip Toddler Trainer Cup Bottle",
    price: 499,
    originalPrice: 799,
    category: "Feeding Accessories",
    image: "assets/product_feeding_bottle.png",
    description: "BPA-free trainer cup with easy-to-hold side handles and a soft silicone straw. Leak-proof design perfect for babies transitioning from bottles to cups.",
    rating: 4.7,
    inStock: true,
    isNew: false,
    isSale: true,
    ageGroup: "0-1"
  },
  {
    id: 4,
    name: "Organic Bamboo Swaddle Blanket Set (3-Pack)",
    price: 1199,
    originalPrice: 1499,
    category: "Baby Basics",
    image: "assets/product_swaddle.png",
    description: "Breathable and ultra-soft organic swaddle blankets. Kept snug, secure, and thermo-regulated for newborns and babies.",
    rating: 4.9,
    inStock: true,
    isNew: false,
    isSale: false,
    ageGroup: "0-1"
  },
  {
    id: 5,
    name: "Newborn Complete Grooming & Care Kit",
    price: 999,
    originalPrice: 1499,
    category: "Baby Grooming Products",
    image: "assets/product_grooming.png",
    description: "All-in-one newborn safety kit including a soft goat-hair hairbrush, round-tip nail scissors, gentle emery boards, and a digital thermometer.",
    rating: 4.6,
    inStock: true,
    isNew: true,
    isSale: false,
    ageGroup: "0-1"
  },
  {
    id: 6,
    name: "Gentle Calendula Baby Face Cream & Lotion",
    price: 699,
    originalPrice: 899,
    category: "Baby Cosmetics",
    image: "assets/product_cream.png",
    description: "Hypoallergenic cosmetic lotion containing organic calendula and chamomile extracts. Softly moisturizes baby skin without greasy residues.",
    rating: 4.8,
    inStock: true,
    isNew: false,
    isSale: false,
    ageGroup: "0-1"
  },
  {
    id: 7,
    name: "Ergonomic Nursing Feeding Support Pillow",
    price: 1899,
    originalPrice: 2499,
    category: "Feeding Pillows",
    image: "assets/product_pillow.png",
    description: "U-shaped ergonomic pillow with a washable cream slipcover. Relieves arm and back strain for breastfeeding or bottle-feeding mothers.",
    rating: 4.9,
    inStock: true,
    isNew: false,
    isSale: false,
    ageGroup: "0-1"
  },
  {
    id: 8,
    name: "Seamless Cotton Maternity & Feeding Bra",
    price: 799,
    originalPrice: 999,
    category: "Feeding Bras",
    image: "assets/product_bra.png",
    description: "Wire-free nursing bra with one-handed drop-down cups for effortless breastfeeding. Breathable stretch fabric grows with your size.",
    rating: 4.5,
    inStock: true,
    isNew: false,
    isSale: false,
    ageGroup: "All"
  },
  {
    id: 9,
    name: "Wooden Shapes Sorting Educational Clock",
    price: 899,
    originalPrice: 1199,
    category: "Educational Toys",
    image: "assets/product_clock.png",
    description: "Playful wooden block clock with sorted numeric shape pieces. Helps kids learn geometric shapes, colors, and telling time.",
    rating: 4.7,
    inStock: true,
    isNew: false,
    isSale: false,
    ageGroup: "3-6"
  },
  {
    id: 10,
    name: "Luxury Urban Baby Stroller",
    price: 15999,
    originalPrice: 20999,
    category: "Prams & Strollers",
    image: "assets/product_stroller.png",
    description: "Sleek charcoal grey stroller with lightweight aluminum frame, all-terrain wheels, and UPF 50+ canopy. Easy one-hand fold.",
    rating: 4.8,
    inStock: true,
    isNew: true,
    isSale: true,
    ageGroup: "0-3"
  },
  {
    id: 11,
    name: "Modern Adjustable Wooden High Chair",
    price: 4999,
    originalPrice: 6599,
    category: "Baby Furniture",
    image: "assets/product_highchair.png",
    description: "Grows with your baby! Features an adjustable footrest, removable tray, and soft cushion. Solid wood construction.",
    rating: 4.9,
    inStock: true,
    isNew: false,
    isSale: false,
    ageGroup: "0-3"
  },
  {
    id: 12,
    name: "Smart HD Video Baby Monitor",
    price: 3499,
    originalPrice: 4999,
    category: "Nursery Tech",
    image: "assets/product_monitor.png",
    description: "1080p HD camera with night vision, two-way audio, and a 5-inch parent display screen. Peace of mind from any room.",
    rating: 4.7,
    inStock: true,
    isNew: true,
    isSale: true,
    ageGroup: "0-1"
  },
  {
    id: 13,
    name: "Premium Vegan Leather Diaper Bag",
    price: 2499,
    originalPrice: 3199,
    category: "Diaper Bags",
    image: "assets/product_diaperbag.png",
    description: "Stylish and practical backpack style with insulated bottle pockets, changing pad, and stroller straps. Beautiful camel brown finish.",
    rating: 4.9,
    inStock: true,
    isNew: true,
    isSale: false,
    ageGroup: "All"
  },
  {
    id: 14,
    name: "Silicone Teething Rings Set",
    price: 399,
    originalPrice: 599,
    category: "Teethers & Pacifiers",
    image: "assets/product_teether.png",
    description: "Set of 3 food-grade silicone teething rings. Easy to grip, soothing on gums, and safely chewable.",
    rating: 4.8,
    inStock: true,
    isNew: false,
    isSale: true,
    ageGroup: "0-1"
  },
  {
    id: 15,
    name: "Organic Earthy Romper Set",
    price: 899,
    originalPrice: 1299,
    category: "Baby Clothing",
    image: "assets/product_romper.png",
    description: "Super soft organic cotton romper with snap closures for easy changes. Breathable and gentle on sensitive skin.",
    rating: 4.7,
    inStock: true,
    isNew: true,
    isSale: true,
    ageGroup: "0-1"
  },
  {
    id: 16,
    name: "Natural Beechwood Animal Teething Toy",
    price: 399,
    originalPrice: 599,
    category: "Toys > Educational Toys",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400",
    description: "Toxin-free, chemical-free solid beechwood teething rings in cute animal shapes. Helps soothe tender gums and provides safe tactile play.",
    rating: 4.8,
    inStock: true,
    isNew: true,
    isSale: false,
    ageGroup: "0-1"
  },
  {
    id: 17,
    name: "Cute Plush Dino Toddler Backpack",
    price: 899,
    originalPrice: 1299,
    category: "Gifts & Novelties > Photo Frames",
    image: "https://images.unsplash.com/photo-1576016770956-debb63d900bb?q=80&w=400",
    description: "Adorable, lightweight plush backpack featuring soft dino spikes and adjustable padded straps. Perfect for carrying preschool snacks and small toys.",
    rating: 4.7,
    inStock: true,
    isNew: false,
    isSale: true,
    ageGroup: "3-6"
  },
  {
    id: 18,
    name: "Organic Cotton Pastel Bodysuits (5-Pack)",
    price: 1499,
    originalPrice: 1999,
    category: "Baby Dresses",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=400",
    description: "Pack of 5 soft organic cotton bodysuits in gorgeous pastel colours. Tagless labels and nickel-free bottom snaps for ultimate baby comfort.",
    rating: 4.9,
    inStock: true,
    isNew: true,
    isSale: false,
    ageGroup: "0-1"
  },
  {
    id: 19,
    name: "Silicone Easy-Clean Waterproof Bibs (2-Pack)",
    price: 599,
    originalPrice: 799,
    category: "Feeding Accessories",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=400",
    description: "Food-grade silicone bibs with deep spill-catcher pockets and adjustable neck closures. Dishwasher safe and easily rolls up for travel.",
    rating: 4.6,
    inStock: true,
    isNew: false,
    isSale: false,
    ageGroup: "0-1"
  }
];

// Load products from Backend API
let PRODUCTS = [];

function getProductByIdLocal(id) {
  if (!id) return null;
  const idStr = String(id);
  return PRODUCTS.find(p => String(p._id || p.id) === idStr) || null;
}

async function loadProducts() {
  try {
    const res = await apiGetProducts();
    PRODUCTS = (res.data && res.data.length > 0) ? res.data : DEFAULT_PRODUCTS;
  } catch (err) {
    console.error("Failed to load products from backend", err);
    PRODUCTS = DEFAULT_PRODUCTS;
  }
}

const saveProductsToStorage = () => {
  // Deprecated: Products are now saved to backend directly
};

// Default slideshow banners database with animations matching content
const DEFAULT_SLIDES = [
  {
    id: 1,
    badgeText: "NEW ARRIVALS",
    badgeStyle: "yellow",
    title: "Everything for Mom & Your Little One",
    subtitle: "Premium organic products, toys, and parenting essentials curated with love.",
    bgStyle: "yellow",
    illustration: "custom-full",
    imageUrl: "assets/banner_main.jpg",
    ctaText: "Shop Now",
    ctaCategory: "New Born"
  },
  {
    id: 2,
    badgeText: "TOYS",
    badgeStyle: "yellow",
    title: "Cute Toys, Endless Joys",
    subtitle: "Fun, safe, and educational toys for every developmental stage.",
    bgStyle: "yellow",
    illustration: "custom-full",
    imageUrl: "assets/banner_toys.jpg",
    ctaText: "Explore Toys",
    ctaCategory: "Toys"
  },
  {
    id: 3,
    badgeText: "BABY CARE",
    badgeStyle: "yellow",
    title: "Gentle Care, Happy Baby",
    subtitle: "Hypoallergenic, chemical-free bath and skincare essentials.",
    bgStyle: "yellow",
    illustration: "custom-full",
    imageUrl: "assets/banner_care.jpg",
    ctaText: "Shop Baby Care",
    ctaCategory: "New Born"
  },
  {
    id: 4,
    badgeText: "MATERNITY",
    badgeStyle: "pink",
    title: "Everything Mom Needs",
    subtitle: "Comfortable and stylish maternity wear, innerwear, and prenatal accessories.",
    bgStyle: "pink",
    illustration: "custom-full",
    imageUrl: "assets/banner_maternity.jpg",
    ctaText: "Shop Maternity",
    ctaCategory: "Mother Care / Maternity"
  }
];

// Load slides from LocalStorage or fallback to default
let SLIDES = JSON.parse(localStorage.getItem("mt_slides")) || DEFAULT_SLIDES;

// Auto-reset to new defaults if old preset slides are detected
if (SLIDES.length > 0 && (SLIDES[0].illustration === "baby-playing" || SLIDES[0].imageUrl === "assets/main_banner.jpg")) {
  SLIDES = DEFAULT_SLIDES;
  localStorage.setItem("mt_slides", JSON.stringify(SLIDES));
}

const saveSlidesToStorage = () => {
  localStorage.setItem("mt_slides", JSON.stringify(SLIDES));
};

// E-commerce state
let cart = JSON.parse(localStorage.getItem("mt_cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("mt_wishlist")) || [];
let selectedCategory = "all";
let selectedAgeGroup = "all";
let searchQuery = "";
let slideshowInterval = null;
let selectedPaymentMethod = "card";

// ── Shared UI helpers (module-scope so all functions can use them) ──────────
function renderLoggedInUI(displayName, role) {
  setNotificationAuthToken(getJwt());
  const section = document.getElementById("userAuthSection");
  if (!section) return;

  const adminBtn = role === 'admin'
    ? `<a href="#" id="openAdminDashboardBtn" style="background: var(--dark-brown); color: white; text-decoration: none; font-weight: 700; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; margin-right: 10px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">⚙ Admin</a>`
    : '';

  section.innerHTML = `
    ${adminBtn}
    <span style="color: var(--dark-brown); margin-right: 8px;">Hi, ${displayName}!</span>
    <a href="#" id="myOrdersBtn" style="color: var(--light-brown); text-decoration: none; font-weight: 700; margin-right: 12px; border-right: 1.5px solid rgba(93, 64, 55, 0.15); padding-right: 12px;">My Orders</a>
    <a href="#" id="userLogoutBtn" style="color: var(--accent-red); text-decoration: none;">Logout</a>
  `;

  if (role === 'admin') {
    const adminDashBtn = document.getElementById('openAdminDashboardBtn');
    if (adminDashBtn) {
      adminDashBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openOwnerDashboard();
      });
    }
  }
}

function renderLoggedOutUI() {
  setNotificationAuthToken(null);
  const section = document.getElementById("userAuthSection");
  if (!section) return;
  section.innerHTML = `
    <a href="#" id="userLoginRegisterBtn" style="color: var(--light-brown); text-decoration: none;">Sign In / Register</a>
  `;
  const btn = document.getElementById("userLoginRegisterBtn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(document.getElementById("userAuthModal"));
    });
  }
}

// DOM Elements
const elements = {
  loader: document.getElementById("loader"),
  header: document.getElementById("header"),
  hamburger: document.getElementById("hamburgerMenu"),
  searchInput: document.getElementById("searchInput"),
  wishlistToggleBtn: document.getElementById("wishlistToggle"),
  cartToggleBtn: document.getElementById("cartToggle"),
  wishlistBadge: document.getElementById("wishlistBadge"),
  cartBadge: document.getElementById("cartBadge"),
  productsGrid: document.getElementById("productsGrid"),
  filterTabs: document.getElementById("filterTabs"),
  searchSuggestions: document.getElementById("searchSuggestions"),
  ageFilterPills: document.getElementById("ageFilterPills"),
  prevSlideBtn: document.getElementById("prevSlideBtn"),
  nextSlideBtn: document.getElementById("nextSlideBtn"),
  slidesDots: document.getElementById("slidesDots"),
  heroSlideshow: document.getElementById("heroSlideshow"),

  
  // Category Groups
  groupBabyEssentials: document.getElementById("groupBabyEssentials"),
  groupFeedingCare: document.getElementById("groupFeedingCare"),
  groupToys: document.getElementById("groupToys"),
  groupMobilityBooks: document.getElementById("groupMobilityBooks"),
  groupMomsSpecial: document.getElementById("groupMomsSpecial"),
  
  // Drawers
  drawerOverlay: document.getElementById("drawerOverlay"),
  cartDrawer: document.getElementById("cartDrawer"),
  cartDrawerBody: document.getElementById("cartDrawerBody"),
  cartSubtotal: document.getElementById("cartSubtotal"),
  closeCartBtn: document.getElementById("closeCartBtn"),
  checkoutBtn: document.getElementById("checkoutBtn"),
  
  wishlistDrawer: document.getElementById("wishlistDrawer"),
  wishlistDrawerBody: document.getElementById("wishlistDrawerBody"),
  closeWishlistBtn: document.getElementById("closeWishlistBtn"),

  // Left Side Navigation Drawer
  sideNavDrawer: document.getElementById("sideNavDrawer"),
  closeSideNavBtn: document.getElementById("closeSideNavBtn"),
  sideNavCategoriesList: document.getElementById("sideNavCategoriesList"),
  
  // Modal (Quick View)
  quickViewModal: document.getElementById("quickViewModal"),
  modalBodyContent: document.getElementById("modalBodyContent"),
  closeModalBtn: document.getElementById("closeModalBtn"),

  // Owner Dashboard Modal
  ownerDashboardModal: document.getElementById("ownerDashboardModal"),
  closeOwnerDashboardBtn: document.getElementById("closeOwnerDashboardBtn"),
  addNewProductBtn: document.getElementById("addNewProductBtn"),
  addNewSlideBtn: document.createElement("button"),
  ownerLogoutBtn: document.getElementById("ownerLogoutBtn"),
  productFormPanel: document.getElementById("productFormPanel"),
  formPanelTitle: document.getElementById("formPanelTitle"),
  productManageForm: document.getElementById("productManageForm"),
  editProductId: document.getElementById("editProductId"),
  prodName: document.getElementById("prodName"),
  prodCategory: document.getElementById("prodCategory"),
  prodPrice: document.getElementById("prodPrice"),
  prodOriginalPrice: document.getElementById("prodOriginalPrice"),
  prodImage: document.getElementById("prodImage"),
  prodImages: document.getElementById("prodImages"),
  prodStock: document.getElementById("prodStock"),
  prodAgeGroup: document.getElementById("prodAgeGroup"),
  prodDesc: document.getElementById("prodDesc"),
  autoGenDescBtn: document.getElementById("autoGenDescBtn"),
  prodIsNew: document.getElementById("prodIsNew"),
  prodIsSale: document.getElementById("prodIsSale"),
  cancelFormBtn: document.getElementById("cancelFormBtn"),
  adminProductsTableBody: document.getElementById("adminProductsTableBody"),
  
  // Dashboard Tabs & sections
  tabManageProducts: document.getElementById("tabManageProducts"),
  tabManageCategories: document.getElementById("tabManageCategories"),
  tabManageSlides: document.createElement("button"),
  productsDashboardSection: document.getElementById("productsDashboardSection"),
  categoriesDashboardSection: document.getElementById("categoriesDashboardSection"),
  slidesDashboardSection: document.createElement("div"),
  addNewCategoryBtn: document.getElementById("addNewCategoryBtn"),
  adminCategoriesList: document.getElementById("adminCategoriesList"),
  categoryFormPanel: document.getElementById("categoryFormPanel"),
  categoryManageForm: document.getElementById("categoryManageForm"),
  editCategoryId: document.getElementById("editCategoryId"),
  cancelCatFormBtn: document.getElementById("cancelCatFormBtn"),
  subcategoryFormPanel: document.getElementById("subcategoryFormPanel"),
  subcategoryManageForm: document.getElementById("subcategoryManageForm"),
  editSubcategoryId: document.getElementById("editSubcategoryId"),
  subcatParentId: document.getElementById("subcatParentId"),
  cancelSubcatFormBtn: document.getElementById("cancelSubcatFormBtn"),
  slideFormPanel: document.createElement("div"),
  slideFormPanelTitle: document.createElement("div"),
  slideManageForm: document.createElement("form"),
  editSlideId: document.createElement("input"),
  slideTitleInput: document.createElement("input"),
  slideBadgeTextInput: document.createElement("input"),
  slideBadgeStyleInput: document.createElement("input"),
  slideBgStyleInput: document.createElement("input"),
  slideIllustrationInput: document.createElement("input"),
  slideImageUrlGroup: document.createElement("div"),
  slideImageUrlInput: document.createElement("input"),
  slideCtaTextInput: document.createElement("input"),
  slideCtaCategoryInput: document.createElement("input"),
  slideSubtitleInput: document.createElement("input"),
  cancelSlideFormBtn: document.createElement("button"),
  adminSlidesTableBody: document.createElement("tbody"),

  // Forms & Newsletter
  newsletterForm: document.getElementById("newsletterForm"),
  newsletterEmail: document.getElementById("newsletterEmail"),
  toastContainer: document.getElementById("toastContainer"),

  // User Auth Modal Elements
  userAuthModal: document.getElementById("userAuthModal"),
  closeUserAuthBtn: document.getElementById("closeUserAuthBtn"),
  btnUserTabLogin: document.getElementById("btnUserTabLogin"),
  btnUserTabRegister: document.getElementById("btnUserTabRegister"),
  userLoginSection: document.getElementById("userLoginSection"),
  userRegisterSection: document.getElementById("userRegisterSection"),
  userForgotPasswordSection: document.getElementById("userForgotPasswordSection"),
  userLoginForm: document.getElementById("userLoginForm"),
  userRegisterForm: document.getElementById("userRegisterForm"),
  userForgotForm: document.getElementById("userForgotForm"),
  userLoginEmail: document.getElementById("userLoginEmail"),
  userLoginPassword: document.getElementById("userLoginPassword"),
  userRegisterName: document.getElementById("userRegisterName"),
  userRegisterEmail: document.getElementById("userRegisterEmail"),
  userRegisterPhone: document.getElementById("userRegisterPhone"),
  userRegisterPassword: document.getElementById("userRegisterPassword"),
  userForgotPasswordBtn: document.getElementById("userForgotPasswordBtn"),
  userBackToLoginBtn: document.getElementById("userBackToLoginBtn"),
  userForgotEmail: document.getElementById("userForgotEmail"),
  btnUserRoleUser: document.getElementById("btnUserRoleUser"),
  btnUserRoleAdmin: document.getElementById("btnUserRoleAdmin"),
  userLoginRoleHint: document.getElementById("userLoginRoleHint"),
  userSubmitLoginBtn: document.getElementById("userSubmitLoginBtn"),
  userSubmitRegisterBtn: document.getElementById("userSubmitRegisterBtn"),
  userSubmitForgotBtn: document.getElementById("userSubmitForgotBtn"),
  userAuthSection: document.getElementById("userAuthSection"),
  userLoginRegisterBtn: document.getElementById("userLoginRegisterBtn"),
  tabManageOrders: document.getElementById("tabManageOrders"),
  ordersDashboardSection: document.getElementById("ordersDashboardSection"),
  adminOrdersTableBody: document.getElementById("adminOrdersTableBody"),
  customerOrdersModal: document.getElementById("customerOrdersModal"),
  closeCustomerOrdersBtn: document.getElementById("closeCustomerOrdersBtn"),
  customerOrdersTableBody: document.getElementById("customerOrdersTableBody"),
  checkoutPaymentModal: document.getElementById("checkoutPaymentModal"),
  closeCheckoutPaymentBtn: document.getElementById("closeCheckoutPaymentBtn"),
  checkoutName: document.getElementById("checkoutName"),
  checkoutPhone: document.getElementById("checkoutPhone"),
  checkoutAddress: document.getElementById("checkoutAddress"),
  // Payment method pills removed (WhatsApp checkout)
  checkoutSummaryItems: document.getElementById("checkoutSummaryItems"),
  checkoutSubtotalSection: document.getElementById("checkoutSubtotal"),
  checkoutShippingSection: document.getElementById("checkoutShipping"),
  checkoutTaxSection: document.getElementById("checkoutTax"),
  checkoutGrandTotalSection: document.getElementById("checkoutGrandTotal"),
  checkoutPayBtn: document.getElementById("checkoutPayBtn"),
};

function setUserLoginRole(role) {
  const isAdmin = role === "admin";
  elements.btnUserRoleAdmin.classList.toggle("active", isAdmin);
  elements.btnUserRoleUser.classList.toggle("active", !isAdmin);
  elements.userLoginRoleHint.textContent = isAdmin
    ? "Use your admin credentials to access the dashboard."
    : "Sign in as a parent to place orders and manage your wishlist.";
}

// All categories list
const ALL_CATEGORIES = [
  "New Born", "Clothing", "Feeding", "Baby Care", "Accessories", "Dresses",
  "Mother Care or Maternity", "Inners",
  "Toys", "Educational", "Board Games", "Remote Control", "Ride On Cars",
  "Sports", "Tricycles", "Bicycles", "Foot Balls", "Volley Balls", "Basket Balls", "Carrom Board",
  "Stationary", "Colouring Books", "Story Books", "Activity Books", "Colouring Accessories", "Colors", "Crayons", "Pencil", "Brushs",
  "Gifts & Novelties", "Idols", "Photo Frames"
];

// Category Details structure with icons & background colors for styling
const CATEGORY_DETAILS = {
  "New Born": [
    { name: "Clothing", icon: "", color: "#FFF3E0" },
    { name: "Feeding", icon: "", color: "#E0F2F1" },
    { name: "Baby Care", icon: "", color: "#F3E5F5" },
    { name: "Accessories", icon: "", color: "#E8F5E9" },
    { name: "Dresses", icon: "", color: "#E1F5FE" }
  ],
  "Mother Care or Maternity": [
    { name: "Clothing", icon: "", color: "#FFFDE7" },
    { name: "Inners", icon: "", color: "#E0F7FA" },
    { name: "Accessories", icon: "", color: "#FFEBEE" }
  ],
  "Toys": [
    { name: "Educational", icon: "", color: "#FFF8E1" },
    { name: "Board Games", icon: "", color: "#E0F2F1" },
    { name: "Remote Control", icon: "", color: "#E8F5E9" },
    { name: "Ride On Cars", icon: "", color: "#F3E5F5" }
  ],
  "Sports": [
    { name: "Tricycles", icon: "", color: "#E1F5FE" },
    { name: "Bicycles", icon: "", color: "#FFF3E0" },
    { name: "Foot Balls", icon: "", color: "#FFF8E1" },
    { name: "Volley Balls", icon: "", color: "#E0F7FA" },
    { name: "Basket Balls", icon: "", color: "#E8F5E9" },
    { name: "Carrom Board", icon: "", color: "#F3E5F5" }
  ],
  "Stationary": [
    { name: "Colouring Books", icon: "", color: "#FFFDE7" },
    { name: "Story Books", icon: "", color: "#E0F2F1" },
    { name: "Activity Books", icon: "", color: "#FFEBEE" },
    { name: "Colouring Accessories", icon: "", color: "#E8F5E9" },
    { name: "Colors", icon: "", color: "#FFF3E0" },
    { name: "Crayons", icon: "", color: "#E1F5FE" },
    { name: "Pencil", icon: "", color: "#F3E5F5" },
    { name: "Brushs", icon: "", color: "#E0F7FA" }
  ],
  "Gifts & Novelties": [
    { name: "Idols", icon: "", color: "#FFEBEE" },
    { name: "Photo Frames", icon: "", color: "#FFF8E1" }
  ]
};

const DEFAULT_CATEGORIES_DATA = Object.keys(CATEGORY_DETAILS).map((groupName, i) => ({
  _id: "local_cat_" + i,
  name: groupName,
  isActive: true,
  showOnHome: true,
  order: i,
  image: "",
  description: "Curated collection",
  subcategories: CATEGORY_DETAILS[groupName].map((sub, j) => ({ 
    name: sub.name, 
    _id: "local_sub_" + i + "_" + j 
  }))
}));

// Initialize Application
window.addEventListener("DOMContentLoaded", async () => {
  // 1. Hide Loader
  setTimeout(() => {
    elements.loader.style.opacity = "0";
    elements.loader.style.visibility = "hidden";
  }, 600);

  // Initialize Notifications
  initNotifications();

  // Load backend products before rendering
  await loadProducts();

  // 2. Render categories lists
  renderCategoryGroups();
  renderSidebarCategories();

  // 3. Render featured products
  renderProducts();

  // 4. Load & render cart & wishlist states
  updateBadges();

  // 5. Scroll navigation effect & auto-hide
  let lastScrollY = window.scrollY;
  const mobileBottomNav = document.getElementById("mobileBottomNav");
  
  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    
    // Shadow effect on top nav
    if (currentScrollY > 50) {
      elements.header.classList.add("scrolled");
    } else {
      elements.header.classList.remove("scrolled");
    }

    // Slide up/down navbars on scroll direction (threshold to prevent glitching at top)
    if (currentScrollY > 60 && currentScrollY > lastScrollY) {
      // Scrolling down
      elements.header.classList.add("nav-hidden-top");
      if (mobileBottomNav) mobileBottomNav.classList.add("nav-hidden-bottom");
    } else if (currentScrollY < lastScrollY || currentScrollY < 10) {
      // Scrolling up or at very top
      elements.header.classList.remove("nav-hidden-top");
      if (mobileBottomNav) mobileBottomNav.classList.remove("nav-hidden-bottom");
    }
    
    lastScrollY = currentScrollY;
  }, { passive: true });

  // Handle bottom navigation active states
  if (mobileBottomNav) {
    const bottomNavItems = mobileBottomNav.querySelectorAll('.bottom-nav-item');
    bottomNavItems.forEach(item => {
      item.addEventListener('click', function() {
        bottomNavItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }

  // Setup Event Listeners
  setupEventListeners();

  // 6. Render & Initialize Hero Slideshow
  renderHeroSlideshow();
  initHeroSlideshow();

  // ── Auth: MongoDB JWT session only ──────────────────────────────────────
  const mongoUser = getStoredUser();
  if (mongoUser) {
    renderLoggedInUI(mongoUser.name || mongoUser.email || "Parent", mongoUser.role);
  } else {
    renderLoggedOutUI();
  }
  
  // Expose key globally so HTML event triggers work
  window.toggleWishlist = toggleWishlist;
  window.addToCart = addToCart;
  window.buyNow = buyNow;
  window.removeFromCart = removeFromCart;
  window.updateCartQuantity = updateCartQuantity;
  window.moveWishlistToCart = moveWishlistToCart;
  window.openQuickView = openQuickView;
  window.editProduct = editProduct;
  window.deleteProduct = deleteProduct;
  window.editSlide = editSlide;
  window.deleteSlide = deleteSlide;
  window.changeOrderStatus = changeOrderStatus;

  // 7. Render & Bind Primary Categories
  document.querySelectorAll(".primary-category-card").forEach(card => {
    card.addEventListener("click", () => {
      const catName = card.getAttribute("data-category");
      
      const tabs = elements.filterTabs.querySelectorAll(".filter-tab");
      tabs.forEach(tab => tab.classList.remove("active"));
      
      let matchedTab = false;
      tabs.forEach(tab => {
        if (tab.getAttribute("data-category").toLowerCase() === catName.toLowerCase()) {
          tab.classList.add("active");
          matchedTab = true;
        }
      });
      
      selectedCategory = catName;
      selectedAgeGroup = "all"; // Reset age filter
      
      renderProducts();
      
      document.querySelectorAll(".primary-category-card").forEach(c => {
        c.style.transform = "scale(1)";
        c.style.borderColor = "#FFF";
      });
      card.style.transform = "scale(1.04) translateY(-3px)";
      card.style.borderColor = "var(--soft-yellow)";
      
      document.getElementById("products").scrollIntoView({ behavior: 'smooth' });
      showToast(`Filtered: ${card.querySelector('h3').textContent}`, "success");
    });
  });

  // 8. Interactive cursor sparkle trail disabled

  // 9. Add floating background decorative toys
  initFloatingDecorations();

  // 10. Initialize navigation scroll spy and smooth scroll
  initNavigationScrollSpy();

  // 11. Mobile-First Fade in on scroll
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  
  window.observeFadeElements = () => {
    document.querySelectorAll('.product-card:not(.fade-observed), .category-card:not(.fade-observed)').forEach(el => {
      el.classList.add('fade-observed');
      el.style.opacity = 0;
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      fadeObserver.observe(el);
    });
  };

  // Initial call for static HTML elements
  window.observeFadeElements();
});

// Interactive Cursor Sparkle Trail Manager - Completely Removed as requested

// Background Floating Toy Icons Generator
function initFloatingDecorations() {
  const container = document.createElement("div");
  container.className = "decorative-floating-container";
  
  const svgIcons = [
    '<svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: #FFE082; opacity: 0.15;"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/></svg>',
    '<svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: #FFF59D; opacity: 0.15;"><path d="M12,2L14.7,9.3L22,12L14.7,14.7L12,22L9.3,14.7L2,12L9.3,9.3L12,2Z"/></svg>',
    '<svg viewBox="0 0 24 24" style="width: 28px; height: 28px; fill: #FFFFFF; opacity: 0.25;"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>'
  ];
  
  for (let i = 0; i < 8; i++) {
    const el = document.createElement("div");
    el.className = "floating-toy-element";
    el.innerHTML = svgIcons[Math.floor(Math.random() * svgIcons.length)];
    
    el.style.left = `${(i * 12.5) + Math.random() * 5}%`;
    el.style.top = `${Math.random() * 80 + 10}%`;
    
    el.style.animationDuration = `${Math.random() * 6 + 6}s`;
    el.style.animationDelay = `${Math.random() * 4}s`;
    
    const scale = Math.random() * 0.5 + 0.75;
    el.style.transform = `scale(${scale})`;
    
    container.appendChild(el);
  }
  
  document.body.appendChild(container);
}

// Navigation active state and smooth scrolling
function initNavigationScrollSpy() {
  const desktopLinks = document.querySelectorAll("#navLinks a");
  const mobileLinks = document.querySelectorAll("#sideNavDrawer .side-nav-link");

  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    
    // Close side nav drawer if active
    if (elements.sideNavDrawer && elements.sideNavDrawer.classList.contains("active")) {
      elements.sideNavDrawer.classList.remove("active");
      const overlay = document.querySelector(".drawer-overlay");
      if (overlay) overlay.classList.remove("active");
    }

    if (targetId === "#" || targetId === "") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Subtract header height for fixed header positioning
        const headerHeight = elements.header.offsetHeight || 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight + 10;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  // Attach click listeners to desktop nav links
  desktopLinks.forEach(link => {
    const targetId = link.getAttribute("href");
    link.addEventListener("click", (e) => handleLinkClick(e, targetId));
  });

  // Attach click listeners to mobile side nav links
  mobileLinks.forEach(link => {
    const targetId = link.getAttribute("href");
    link.addEventListener("click", (e) => handleLinkClick(e, targetId));
  });

  // Scroll Spy: Highlight active nav link on scroll
  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + (elements.header.offsetHeight || 80) + 120;
    
    let currentSectionId = "home";
    
    const categoriesSec = document.getElementById("categories");
    const productsSec = document.getElementById("products");
    const aboutSec = document.getElementById("about");
    const contactSec = document.getElementById("contact");
    
    if (contactSec && scrollPos >= contactSec.offsetTop) {
      currentSectionId = "contact";
    } else if (aboutSec && scrollPos >= aboutSec.offsetTop) {
      currentSectionId = "about";
    } else if (productsSec && scrollPos >= productsSec.offsetTop) {
      currentSectionId = "products";
    } else if (categoriesSec && scrollPos >= categoriesSec.offsetTop) {
      currentSectionId = "categories";
    }
    
    // Update desktop links active state
    desktopLinks.forEach(link => {
      const targetId = link.getAttribute("href");
      if (
        (currentSectionId === "home" && targetId === "#") ||
        (targetId === "#" + currentSectionId)
      ) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
    
    // Update mobile links active state
    mobileLinks.forEach(link => {
      const targetId = link.getAttribute("href");
      if (
        (currentSectionId === "home" && targetId === "#") ||
        (targetId === "#products" && currentSectionId === "categories") ||
        (targetId === "#" + currentSectionId)
      ) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  });
}

function cleanImageUrl(url) {
  if (!url) return "";
  let clean = url.trim();

  // 1. Check for BBCode [img]...[/img]
  const bbcodeRegex = /\[img\]([^\]\s]+)\[\/img\]/i;
  const bbMatch = clean.match(bbcodeRegex);
  if (bbMatch && bbMatch[1]) {
    return bbMatch[1].trim();
  }

  // 2. Check for HTML <img src="..." />
  const htmlRegex = /<img[^>]+src=["']([^"']+)["']/i;
  const htmlMatch = clean.match(htmlRegex);
  if (htmlMatch && htmlMatch[1]) {
    return htmlMatch[1].trim();
  }

  // 3. Check for Markdown ![](url)
  const mdRegex = /!\[.*?\]\((.*?)\)/;
  const mdMatch = clean.match(mdRegex);
  if (mdMatch && mdMatch[1]) {
    return mdMatch[1].trim();
  }

  // 4. Strip BBCode url tags if present but not handled by regex
  if (clean.includes("[url=") || clean.includes("[/url]")) {
    clean = clean.replace(/\[\/?url.*?\]/gi, "");
    clean = clean.replace(/\[\/?img\]/gi, "");
  }

  return clean;
}

function generateAutoDescription(name, categoryText) {
  if (!name) return "";
  
  const cat = (categoryText || "").toLowerCase();
  let desc = "";
  
  if (cat.includes("toy") || cat.includes("entertainment") || cat.includes("board games")) {
    desc = `Premium quality ${name} designed to spark imagination and creativity. Made from safe, non-toxic materials, this product offers hours of educational fun and learning for children. Sturdy, durable construction makes it perfect for everyday play.`;
  } else if (cat.includes("cloth") || cat.includes("dress") || cat.includes("born") || cat.includes("apparel") || cat.includes("feeding")) {
    desc = `Ultra-soft and breathable ${name}, perfect for your little one's delicate skin. Crafted with 100% premium quality fabric to ensure comfort all day long. Features easy-to-use snaps or elastic waist for quick dressing. Ideal for playtime, outings, or casual wear.`;
  } else if (cat.includes("mother") || cat.includes("maternity") || cat.includes("mom")) {
    desc = `Designed with comfort and style in mind for mothers, this ${name} is made from gentle, premium-quality materials to support you. Extremely versatile, practical, and durably crafted to ensure maximum comfort and convenience.`;
  } else if (cat.includes("sport") || cat.includes("active") || cat.includes("outdoor")) {
    desc = `Encourage active play and coordination with this premium ${name}. Specially designed for kids, ensuring high safety standards and durable materials. Perfect for outdoor fun, family time, and building motor skills.`;
  } else if (cat.includes("stationery") || cat.includes("book") || cat.includes("colour")) {
    desc = `Inspire creativity and learning with our high-quality ${name}. Great for drawing, coloring, and early educational development. Child-safe and non-toxic, making it perfect for school projects or creative fun at home.`;
  } else {
    desc = `Beautiful and premium ${name}, crafted with care from high-quality, child-friendly materials. Highly durable, safe, and designed to bring joy and comfort to your little ones. Perfect for gifting or everyday use.`;
  }
  return desc;
}

// Setup Event Listeners
function setupEventListeners() {
  // Left Side Nav Drawer Trigger (three lines button)
  elements.hamburger.addEventListener("click", () => openDrawer(elements.sideNavDrawer));

  // Drawer open buttons for Cart / Wishlist
  elements.cartToggleBtn.addEventListener("click", () => openDrawer(elements.cartDrawer));
  elements.wishlistToggleBtn.addEventListener("click", () => openDrawer(elements.wishlistDrawer));

  // User Login Role Switcher
  elements.btnUserRoleUser.addEventListener("click", () => setUserLoginRole("user"));
  elements.btnUserRoleAdmin.addEventListener("click", () => setUserLoginRole("admin"));

  // Drawer close buttons
  elements.closeCartBtn.addEventListener("click", closeAllDrawers);
  elements.closeWishlistBtn.addEventListener("click", closeAllDrawers);
  elements.closeSideNavBtn.addEventListener("click", closeAllDrawers);
  elements.drawerOverlay.addEventListener("click", closeAllDrawers);

  // Modal close buttons
  elements.closeModalBtn.addEventListener("click", closeModal);
  elements.closeOwnerDashboardBtn.addEventListener("click", closeModal);
  elements.closeUserAuthBtn.addEventListener("click", closeModal);
  elements.closeCustomerOrdersBtn.addEventListener("click", closeModal);
  elements.closeCheckoutPaymentBtn.addEventListener("click", closeModal);

  // Payment method elements removed (WhatsApp checkout — no payment pills needed)

  // Side Nav page navigation links click listeners
  elements.sideNavDrawer.querySelectorAll(".side-nav-link").forEach(link => {
    link.addEventListener("click", () => {
      elements.sideNavDrawer.querySelectorAll(".side-nav-link").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      closeAllDrawers();
    });
  });

  // Side Nav Age Groups Buttons click listeners
  elements.sideNavDrawer.querySelectorAll(".side-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      // Clear category tab highlight on storefront
      elements.filterTabs.querySelectorAll(".filter-tab").forEach(tab => tab.classList.remove("active"));
      elements.filterTabs.querySelector("[data-category='all']").classList.add("active");
      
      // Clear highlights of other age filters
      elements.sideNavDrawer.querySelectorAll(".side-nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      selectedAgeGroup = btn.getAttribute("data-age");
      selectedCategory = "all"; // Reset category
      
      // Sync storefront age filter pills
      const shopAgePills = document.querySelectorAll(".age-pill");
      shopAgePills.forEach(p => {
        if (p.getAttribute("data-age") === selectedAgeGroup) {
          p.classList.add("active");
        } else {
          p.classList.remove("active");
        }
      });

      renderProducts();
      closeAllDrawers();
      
      // Smooth scroll to products
      document.getElementById("products").scrollIntoView({ behavior: 'smooth' });
      showToast(`Filtered for ${btn.textContent.trim()}`, "success");
    });
  });

  // Owner Logout handler
  elements.ownerLogoutBtn.addEventListener("click", () => {
    closeModal();
    showToast("Logged out of Dashboard successfully.", "success");
  });

  // Dashboard Form panels controls
  elements.addNewProductBtn.addEventListener("click", () => {
    elements.productFormPanel.style.display = "block";
    elements.formPanelTitle.textContent = "Add New Product";
    elements.editProductId.value = "";
    elements.productManageForm.reset();
    elements.addNewProductBtn.style.display = "none";
  });

  elements.cancelFormBtn.addEventListener("click", () => {
    elements.productFormPanel.style.display = "none";
    elements.productManageForm.reset();
    elements.addNewProductBtn.style.display = "block";
  });

  // Description Auto-Generation handlers
  if (elements.autoGenDescBtn) {
    elements.autoGenDescBtn.addEventListener("click", () => {
      const name = elements.prodName.value.trim();
      const catText = elements.prodCategory.selectedIndex >= 0 ? elements.prodCategory.options[elements.prodCategory.selectedIndex].text : "";
      if (!name) {
        showToast("Please enter a product name first", "error");
        return;
      }
      const desc = generateAutoDescription(name, catText);
      elements.prodDesc.value = desc;
      showToast("Description generated!", "success");
    });
  }

  const triggerAutoFill = () => {
    if (!elements.prodDesc.value.trim()) {
      const name = elements.prodName.value.trim();
      const catText = elements.prodCategory.selectedIndex >= 0 ? elements.prodCategory.options[elements.prodCategory.selectedIndex].text : "";
      if (name) {
        elements.prodDesc.value = generateAutoDescription(name, catText);
      }
    }
  };
  elements.prodName.addEventListener("blur", triggerAutoFill);
  elements.prodCategory.addEventListener("change", triggerAutoFill);
  elements.prodImage.addEventListener("blur", () => {
    elements.prodImage.value = cleanImageUrl(elements.prodImage.value);
  });
  // Dashboard Add/Edit Form submit handler
  elements.productManageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = elements.editProductId.value;
    const name = elements.prodName.value.trim();
    const catValue = elements.prodCategory.value; // "categoryId|subcategoryId" or "categoryId|"
    
    let categoryId = null;
    let subcategoryId = null;
    let category = "Uncategorized"; // fallback
    
    if (catValue) {
      const parts = catValue.split('|');
      categoryId = parts[0] || null;
      subcategoryId = parts[1] || null;
      
      // Get category name for local display update if needed
      const selOption = elements.prodCategory.options[elements.prodCategory.selectedIndex];
      if (selOption) {
        category = selOption.text.split('>')[0].trim().replace('-- ', '').replace(' (No subcategories) --', '');
      }
    }
    
    const price = parseFloat(elements.prodPrice.value);
    const originalPriceInput = elements.prodOriginalPrice.value;
    const originalPrice = originalPriceInput ? parseFloat(originalPriceInput) : null;
    const image = cleanImageUrl(elements.prodImage.value);
    const imagesValue = elements.prodImages.value || "";
    const images = imagesValue.split("\n")
      .map(url => cleanImageUrl(url))
      .filter(url => url !== "");
    
    const newProd = {
      name: elements.prodName.value.trim(),
      price: parseFloat(elements.prodPrice.value),
      originalPrice: elements.prodOriginalPrice.value ? parseFloat(elements.prodOriginalPrice.value) : null,
      categoryId: categoryId,
      subcategoryId: subcategoryId,
      category: elements.prodCategory.options[elements.prodCategory.selectedIndex]?.text.replace(/-- /g, '').replace(/ --/g, '') || "Uncategorized",
      image: image,
      images: images,
      inStock: elements.prodStock.value === "true",
      description: elements.prodDesc.value,
      isNew: elements.prodIsNew.checked,
      isSale: elements.prodIsSale.checked,
      ageGroup: elements.prodAgeGroup ? elements.prodAgeGroup.value : "All"
    };

    try {
      if (id) {
        await apiUpdateProduct(id, newProd);
        showToast("Product updated successfully", "success");
      } else {
        await apiCreateProduct(newProd);
        showToast("Product created successfully", "success");
      }
      
      // Reload products and UI
      await loadProducts();
      elements.productFormPanel.style.display = "none";
      elements.addNewProductBtn.style.display = "block";
      elements.productManageForm.reset();
      renderAdminProductsTable();
      renderCategoryGroups();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // Dashboard Tab Switching
  elements.tabManageProducts.addEventListener("click", () => {
    elements.tabManageProducts.classList.add("active");
    elements.tabManageCategories.classList.remove("active");
    elements.tabManageSlides.classList.remove("active");
    elements.tabManageOrders.classList.remove("active");
    if(document.getElementById('tabManageNotifications')) document.getElementById('tabManageNotifications').classList.remove("active");
    elements.productsDashboardSection.style.display = "flex";
    elements.categoriesDashboardSection.style.display = "none";
    elements.slidesDashboardSection.style.display = "none";
    elements.ordersDashboardSection.style.display = "none";
    if(document.getElementById('notificationsDashboardSection')) document.getElementById('notificationsDashboardSection').style.display = "none";
    elements.addNewProductBtn.style.display = "block";
    elements.addNewCategoryBtn.style.display = "none";
    elements.addNewSlideBtn.style.display = "none";
    elements.slideFormPanel.style.display = "none";
    elements.categoryFormPanel.style.display = "none";
    elements.subcategoryFormPanel.style.display = "none";
  });

  elements.tabManageCategories.addEventListener("click", () => {
    elements.tabManageCategories.classList.add("active");
    elements.tabManageProducts.classList.remove("active");
    elements.tabManageSlides.classList.remove("active");
    elements.tabManageOrders.classList.remove("active");
    if(document.getElementById('tabManageNotifications')) document.getElementById('tabManageNotifications').classList.remove("active");
    elements.categoriesDashboardSection.style.display = "flex";
    elements.productsDashboardSection.style.display = "none";
    elements.slidesDashboardSection.style.display = "none";
    elements.ordersDashboardSection.style.display = "none";
    if(document.getElementById('notificationsDashboardSection')) document.getElementById('notificationsDashboardSection').style.display = "none";
    elements.addNewCategoryBtn.style.display = "block";
    elements.addNewProductBtn.style.display = "none";
    elements.addNewSlideBtn.style.display = "none";
    elements.productFormPanel.style.display = "none";
    elements.slideFormPanel.style.display = "none";
    renderAdminCategoriesTable();
  });

  elements.tabManageSlides.addEventListener("click", () => {
    elements.tabManageSlides.classList.add("active");
    elements.tabManageProducts.classList.remove("active");
    elements.tabManageCategories.classList.remove("active");
    elements.tabManageOrders.classList.remove("active");
    if(document.getElementById('tabManageNotifications')) document.getElementById('tabManageNotifications').classList.remove("active");
    elements.slidesDashboardSection.style.display = "flex";
    elements.productsDashboardSection.style.display = "none";
    elements.categoriesDashboardSection.style.display = "none";
    elements.ordersDashboardSection.style.display = "none";
    if(document.getElementById('notificationsDashboardSection')) document.getElementById('notificationsDashboardSection').style.display = "none";
    elements.addNewSlideBtn.style.display = "block";
    elements.addNewProductBtn.style.display = "none";
    elements.addNewCategoryBtn.style.display = "none";
    elements.productFormPanel.style.display = "none";
    elements.categoryFormPanel.style.display = "none";
    elements.subcategoryFormPanel.style.display = "none";
    renderAdminSlidesTable();
  });

  elements.tabManageOrders.addEventListener("click", () => {
    elements.tabManageOrders.classList.add("active");
    elements.tabManageProducts.classList.remove("active");
    elements.tabManageCategories.classList.remove("active");
    elements.tabManageSlides.classList.remove("active");
    if(document.getElementById('tabManageNotifications')) document.getElementById('tabManageNotifications').classList.remove("active");
    elements.ordersDashboardSection.style.display = "flex";
    elements.productsDashboardSection.style.display = "none";
    elements.categoriesDashboardSection.style.display = "none";
    elements.slidesDashboardSection.style.display = "none";
    if(document.getElementById('notificationsDashboardSection')) document.getElementById('notificationsDashboardSection').style.display = "none";
    elements.addNewProductBtn.style.display = "none";
    elements.addNewCategoryBtn.style.display = "none";
    elements.addNewSlideBtn.style.display = "none";
    elements.productFormPanel.style.display = "none";
    elements.slideFormPanel.style.display = "none";
    elements.categoryFormPanel.style.display = "none";
    elements.subcategoryFormPanel.style.display = "none";
    renderAdminOrdersTable();
  });

  // Slide Form toggles
  elements.addNewSlideBtn.addEventListener("click", () => {
    elements.slideFormPanel.style.display = "block";
    elements.addNewSlideBtn.style.display = "none";
    elements.slideFormPanelTitle.textContent = "Add New Slide Banner";
    
    // Clear form
    elements.editSlideId.value = "";
    elements.slideManageForm.reset();
    elements.slideImageUrlGroup.style.display = "none";
  });

  elements.cancelSlideFormBtn.addEventListener("click", () => {
    elements.slideFormPanel.style.display = "none";
    elements.addNewSlideBtn.style.display = "block";
  });

  elements.slideIllustrationInput.addEventListener("change", (e) => {
    if (e.target.value === "custom" || e.target.value === "custom-full") {
      elements.slideImageUrlGroup.style.display = "flex";
    } else {
      elements.slideImageUrlGroup.style.display = "none";
    }
  });
  elements.slideImageUrlInput.addEventListener("blur", () => {
    elements.slideImageUrlInput.value = cleanImageUrl(elements.slideImageUrlInput.value);
  });

  // Slide Manage Form submit
  elements.slideManageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const slideIdVal = elements.editSlideId.value;
    const slideData = {
      title: elements.slideTitleInput.value.trim(),
      badgeText: elements.slideBadgeTextInput.value.trim(),
      badgeStyle: elements.slideBadgeStyleInput.value,
      bgStyle: elements.slideBgStyleInput.value,
      illustration: elements.slideIllustrationInput.value,
      imageUrl: cleanImageUrl(elements.slideImageUrlInput.value),
      ctaText: elements.slideCtaTextInput.value.trim(),
      ctaCategory: elements.slideCtaCategoryInput.value,
      subtitle: elements.slideSubtitleInput.value.trim()
    };

    if (!slideIdVal) {
      // Create new slide
      const nextId = SLIDES.length > 0 ? Math.max(...SLIDES.map(s => s.id)) + 1 : 1;
      slideData.id = nextId;
      SLIDES.push(slideData);
      showToast("Slide banner added successfully.", "success");
    } else {
      // Edit existing slide
      const id = parseInt(slideIdVal);
      const idx = SLIDES.findIndex(s => s.id === id);
      if (idx !== -1) {
        slideData.id = id;
        SLIDES[idx] = slideData;
        showToast("Slide banner updated successfully.", "success");
      }
    }

    saveSlidesToStorage();
    elements.slideFormPanel.style.display = "none";
    elements.addNewSlideBtn.style.display = "block";
    
    renderHeroSlideshow();
    initHeroSlideshow();
    renderAdminSlidesTable();
  });

  // User Auth Modal trigger from topbar
  if (elements.userLoginRegisterBtn) {
    elements.userLoginRegisterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(elements.userAuthModal);
      elements.btnUserTabLogin.click();
      setUserLoginRole("user");
    });
  }

  // User Auth state action delegation
  elements.userAuthSection.addEventListener("click", async (e) => {
    if (e.target.id === "userLogoutBtn") {
      e.preventDefault();
      apiLogout();
      renderLoggedOutUI();
      showToast("Signed out successfully.", "success");
    } else if (e.target.id === "myOrdersBtn") {
      e.preventDefault();
      openModal(elements.customerOrdersModal);
      renderCustomerOrders();
    }
  });

  // Switching tabs inside User Auth Modal
  elements.btnUserTabLogin.addEventListener("click", () => {
    elements.btnUserTabLogin.classList.add("active");
    elements.btnUserTabRegister.classList.remove("active");
    elements.userLoginSection.style.display = "flex";
    elements.userRegisterSection.style.display = "none";
    elements.userForgotPasswordSection.style.display = "none";
    setUserLoginRole("user");
  });

  elements.btnUserTabRegister.addEventListener("click", () => {
    elements.btnUserTabRegister.classList.add("active");
    elements.btnUserTabLogin.classList.remove("active");
    elements.userRegisterSection.style.display = "flex";
    elements.userLoginSection.style.display = "none";
    elements.userForgotPasswordSection.style.display = "none";
  });

  // Forgot Password View link click
  elements.userForgotPasswordBtn.addEventListener("click", (e) => {
    e.preventDefault();
    elements.userLoginSection.style.display = "none";
    elements.userRegisterSection.style.display = "none";
    elements.userForgotPasswordSection.style.display = "flex";
  });

  // Back to login View click
  elements.userBackToLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    elements.btnUserTabLogin.click();
  });

  // User Login Form Submit — MongoDB only
  elements.userLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = elements.userLoginEmail.value.trim();
    const password = elements.userLoginPassword.value;
    const loginRole = elements.btnUserRoleAdmin.classList.contains("active") ? "admin" : "user";

    if (!email || !password) {
      showToast("Please enter your email and password.", "error");
      return;
    }

    elements.userSubmitLoginBtn.disabled = true;
    elements.userSubmitLoginBtn.textContent = "Signing In...";

    try {
      const result = await apiLogin(email, password);
      const user = result.user;

      if (loginRole === "admin" && user.role !== "admin") {
        apiLogout();
        throw new Error("This account does not have admin access.");
      }

      renderLoggedInUI(user.name || user.email, user.role);

      if (loginRole === "admin") {
        showToast("Admin login successful! 👋", "success");
        closeModal();
        openOwnerDashboard();
      } else {
        showToast(`Welcome back, ${user.name || "Parent"}! 🎉`, "success");
        closeModal();
      }

      elements.userLoginForm.reset();
    } catch (err) {
      showToast(err.message || "Login failed. Please check your email and password.", "error");
    } finally {
      elements.userSubmitLoginBtn.disabled = false;
      elements.userSubmitLoginBtn.textContent = "Sign In";
    }
  });

  // User Register Form Submit — MongoDB only
  elements.userRegisterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = elements.userRegisterName.value.trim();
    const email = elements.userRegisterEmail.value.trim();
    const phone = elements.userRegisterPhone.value.trim();
    const password = elements.userRegisterPassword.value;

    if (!name || !email || !password) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    elements.userSubmitRegisterBtn.disabled = true;
    elements.userSubmitRegisterBtn.textContent = "Creating Account...";

    try {
      const result = await apiRegister(name, email, phone, password);
      const user = result.user;
      renderLoggedInUI(user.name || user.email, user.role);
      showToast(`Account created! Welcome, ${user.name}! 🎉`, "success");
      closeModal();
      elements.userRegisterForm.reset();
    } catch (err) {
      let msg = err.message || "Registration failed.";
      if (msg.toLowerCase().includes("already")) msg = "This email is already registered. Please sign in.";
      showToast(msg, "error");
    } finally {
      elements.userSubmitRegisterBtn.disabled = false;
      elements.userSubmitRegisterBtn.textContent = "Register Account";
    }
  });

  // Forgot Password Form Submit — not available with MongoDB (no email service)
  elements.userForgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showToast("Password reset is not available yet. Please contact support.", "error");
  });

  // Search input live handler & autocomplete suggestions
  elements.searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderProducts();
    
    if (!searchQuery) {
      elements.searchSuggestions.style.display = "none";
      return;
    }
    
    // Filter suggestions
    const matches = PRODUCTS.filter(prod => 
      prod.name.toLowerCase().includes(searchQuery) || 
      prod.category.toLowerCase().includes(searchQuery)
    ).slice(0, 5);
    
    if (matches.length === 0) {
      elements.searchSuggestions.innerHTML = `<div class="search-suggestion-empty">No results found for "${e.target.value}"</div>`;
    } else {
      elements.searchSuggestions.innerHTML = matches.map(prod => `
        <div class="search-suggestion-item" data-id="${prod._id || prod.id}">
          <img src="${prod.image}" alt="${prod.name}" class="search-suggest-img">
          <div class="search-suggest-info">
            <span class="search-suggest-title">${prod.name}</span>
            <span class="search-suggest-price">₹${prod.price.toLocaleString('en-IN')}</span>
          </div>
        </div>
      `).join("");
      
      elements.searchSuggestions.querySelectorAll(".search-suggestion-item").forEach(item => {
        item.addEventListener("click", () => {
          const id = item.getAttribute("data-id");
          openQuickView(id);
          elements.searchSuggestions.style.display = "none";
          elements.searchInput.value = "";
          searchQuery = "";
          renderProducts();
        });
      });
    }
    elements.searchSuggestions.style.display = "block";
  });
  
  // Close suggestions if clicked outside
  document.addEventListener("click", (e) => {
    if (!elements.searchInput.contains(e.target) && !elements.searchSuggestions.contains(e.target)) {
      elements.searchSuggestions.style.display = "none";
    }
  });

  // Featured Product Category Tabs
  elements.filterTabs.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-tab")) {
      selectedCategory = e.target.getAttribute("data-category");
      selectedAgeGroup = "all"; // Reset age group filter when tab is clicked
      renderProducts();
    }
  });

  // Storefront Age selector pills click listeners
  elements.ageFilterPills.addEventListener("click", (e) => {
    const pill = e.target.closest(".age-pill");
    if (pill) {
      selectedAgeGroup = pill.getAttribute("data-age");
      selectedCategory = "all"; // Reset category filter when age is clicked
      renderProducts();
      showToast(`Showing age group: ${selectedAgeGroup === 'all' ? 'All' : selectedAgeGroup + ' Years'}`, "success");
    }
  });


  // Checkout button flow: Opens Checkout & Payment Modal
  elements.checkoutBtn.addEventListener("click", async () => {
    if (cart.length === 0) {
      showToast("Your cart is empty!", "error");
      return;
    }
    
    // Require JWT authentication
    if (!getJwt()) {
      closeAllDrawers();
      openModal(elements.userAuthModal);
      showToast("Please sign in or register to place your order.", "error");
      return;
    }

    elements.checkoutBtn.disabled = true;
    elements.checkoutBtn.textContent = "Opening Checkout...";

    try {
      // Pre-fill from MongoDB JWT session
      const mUser = getStoredUser();
      const name = mUser?.name || "";
      const phone = mUser?.phone || "";
      const address = "";

      // Pre-fill fields
      elements.checkoutName.value = name;
      elements.checkoutPhone.value = phone;
      elements.checkoutAddress.value = address;

      const subtotal = cart.reduce((sum, item) => {
        const prod = getProductByIdLocal(item.productId);
        return sum + (prod ? prod.price * item.quantity : 0);
      }, 0);

      const shipping = subtotal > 1500 ? 0 : 99;
      const tax = Math.round(subtotal * 0.18);
      const grandTotal = subtotal + shipping + tax;

      // Populate summary fields
      elements.checkoutSubtotalSection.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
      elements.checkoutShippingSection.textContent = shipping === 0 ? "FREE" : `₹${shipping}`;
      elements.checkoutTaxSection.textContent = `₹${tax.toLocaleString('en-IN')}`;
      elements.checkoutGrandTotalSection.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

      // Populate items list
      elements.checkoutSummaryItems.innerHTML = cart.map(item => {
        const prod = getProductByIdLocal(item.productId);
        if (!prod) return '';
        return `
          <div style="display: flex; gap: 10px; align-items: center; background-color: var(--cream); padding: 8px; border-radius: var(--border-radius-sm);">
            <img src="${prod.image}" alt="${prod.name}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
            <div style="flex: 1; min-width: 0;">
              <h4 style="font-size: 0.8rem; font-weight: 700; margin: 0; color: var(--dark-brown); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${prod.name}</h4>
              <span style="font-size: 0.75rem; color: var(--light-brown);">₹${prod.price.toLocaleString('en-IN')} x ${item.quantity}</span>
            </div>
          </div>
        `;
      }).join("");

      // Open checkout payment modal
      closeAllDrawers();
      openModal(elements.checkoutPaymentModal);
    } catch (err) {
      showToast("Failed to initiate checkout: " + err.message, "error");
    } finally {
      elements.checkoutBtn.disabled = false;
      elements.checkoutBtn.textContent = "Proceed to Checkout";
    }
  });

  // Payment Submission flow (WhatsApp Checkout)
  elements.checkoutPayBtn.addEventListener("click", async () => {
    // 1. Get Form values
    const name = elements.checkoutName.value.trim();
    const phone = elements.checkoutPhone.value.trim();
    const address = elements.checkoutAddress.value.trim();
    
    // 2. Validate basic delivery fields
    if (!name) {
      showToast("Please enter a recipient name.", "error");
      elements.checkoutName.focus();
      return;
    }
    if (!phone) {
      showToast("Please enter a phone number.", "error");
      elements.checkoutPhone.focus();
      return;
    }
    if (!address) {
      showToast("Please enter a shipping address.", "error");
      elements.checkoutAddress.focus();
      return;
    }

    // 3. Calculate total amounts
    const subtotal = cart.reduce((sum, item) => {
      const prod = getProductByIdLocal(item.productId);
      return sum + (prod ? prod.price * item.quantity : 0);
    }, 0);
    const shipping = subtotal > 1500 ? 0 : 99;
    const tax = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + shipping + tax;

    // 4. Save order to backend database
    try {
      elements.checkoutPayBtn.disabled = true;
      elements.checkoutPayBtn.innerHTML = `Creating Order...`;
      elements.checkoutName.disabled = true;
      elements.checkoutPhone.disabled = true;
      elements.checkoutAddress.disabled = true;
      
      const mappedItems = cart.map(item => {
        const prod = getProductByIdLocal(item.productId);
        return {
          productId: String(item.productId),
          name: prod?.name || "Unknown Product",
          price: prod?.price || 0,
          quantity: item.quantity || 1,
          image: prod?.image || ""
        };
      });

      const mongoResult = await apiPlaceOrder({
        items: mappedItems,
        totalAmount: grandTotal,
        paymentStatus: "pending",
        shippingAddress: {
          fullName: name,
          addressLine1: address,
          city: "-",
          state: "-",
          pincode: "-",
          phone: phone
        }
      });

      const orderId = mongoResult.order._id;

      // 5. Construct WhatsApp message
      let itemsListText = cart.map(item => {
        const prod = getProductByIdLocal(item.productId);
        return `• *${prod?.name || "Product"}* (x${item.quantity}) - ₹${(prod ? prod.price * item.quantity : 0).toLocaleString('en-IN')}`;
      }).join("\n");

      const whatsappMessage = `*New Order from Mother & Toddler Shop!* 🛍️\n\n` +
        `*Invoice ID:* ${orderId}\n\n` +
        `*Customer Details:*\n` +
        `- *Name:* ${name}\n` +
        `- *Phone:* ${phone}\n` +
        `- *Address:* ${address}\n\n` +
        `*Items Ordered:*\n${itemsListText}\n\n` +
        `*Order Summary:*\n` +
        `- *Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n` +
        `- *Shipping:* ${shipping === 0 ? "FREE" : "₹" + shipping}\n` +
        `- *GST (Tax):* ₹${tax.toLocaleString('en-IN')}\n` +
        `- *Grand Total:* *₹${grandTotal.toLocaleString('en-IN')}*\n\n` +
        `Please confirm this order and arrange delivery. Thank you!`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/919949911776?text=${encodedMessage}`;

      showToast(`🎉 Order placed! Redirecting to WhatsApp...`, "success");

      // Open WhatsApp link in a new window/tab
      window.open(whatsappUrl, "_blank");

      // Clear cart & Reset UI
      cart = [];
      localStorage.setItem("mt_cart", JSON.stringify(cart));
      renderCart();
      updateBadges();
      closeModal();
    } catch (err) {
      showToast("Order placement failed: " + err.message, "error");
    } finally {
      elements.checkoutPayBtn.disabled = false;
      elements.checkoutPayBtn.innerHTML = `Order via WhatsApp`;
      elements.checkoutName.disabled = false;
      elements.checkoutPhone.disabled = false;
      elements.checkoutAddress.disabled = false;
    }
  });

  // Newsletter Form
  elements.newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = elements.newsletterEmail.value.trim();
    if (email) {
      showToast("Thank you for subscribing! Check your inbox soon.", "success");
      elements.newsletterEmail.value = "";
    }
  });
}

// Render category lists in sidebar nav dynamically
async function renderSidebarCategories() {
  try {
    const res = await apiGetCategories();
    let categories = res.data || [];
    if (categories.length === 0) categories = DEFAULT_CATEGORIES_DATA;
    const activeCats = categories.filter(c => c.isActive).sort((a, b) => a.order - b.order);
    
    elements.sideNavCategoriesList.innerHTML = activeCats.map(cat => `
      <li>
        <button class="side-nav-category-item" data-side-cat="${cat.name}" style="width: 100%; text-align: left; background: none; border: none; font-size: 0.95rem; font-weight: 700; color: var(--dark-brown); cursor: pointer; padding: 6px 0; display: block;">
          ${cat.name} ➔
        </button>
      </li>
    `).join("");

    // Category item click listeners in sidebar
    elements.sideNavCategoriesList.querySelectorAll(".side-nav-category-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const cat = btn.getAttribute("data-side-cat");
        selectedCategory = cat;
        selectedAgeGroup = "all"; // Reset age filter
        
        // Highlight storefront category filter tab
        if (elements.filterTabs) {
          elements.filterTabs.querySelectorAll(".filter-tab").forEach(tab => tab.classList.remove("active"));
          elements.filterTabs.querySelectorAll(".filter-tab").forEach(tab => {
            if (tab.getAttribute("data-category").toLowerCase() === cat.toLowerCase()) {
              tab.classList.add("active");
            }
          });
        }

        renderProducts();
        closeAllDrawers();
        
        document.getElementById("products").scrollIntoView({ behavior: 'smooth' });
        showToast(`Showing ${cat}`, "success");
      });
    });
  } catch (err) {
    console.error("Failed to load sidebar categories", err);
  }
}

// Helper to map category names to beautiful line SVGs instead of emojis
function getPremiumCategoryIcon(categoryName) {
  const name = categoryName.toLowerCase();
  
  if (name.includes("new born") || name.includes("newborn")) {
    return `<svg class="cat-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="8" cy="21" r="2" />
      <circle cx="18" cy="21" r="2" />
      <path d="M12 15V5c0-1.1-.9-2-2-2H4" />
      <path d="M19 9a7 7 0 0 0-7 7h9v-3a4 4 0 0 0-2-4z" />
      <path d="M12 15h9a3 3 0 0 0-3-3h-6" />
    </svg>`;
  }
  if (name.includes("mother") || name.includes("maternity") || name.includes("mom")) {
    return `<svg class="cat-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      <circle cx="12" cy="9" r="2.5" />
      <path d="M8 14c1 1.5 3 2 4 2s3-.5 4-2" />
    </svg>`;
  }
  if (name.includes("toy")) {
    return `<svg class="cat-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="8" height="8" rx="1.5" />
      <circle cx="7" cy="15" r="1.5" />
      <rect x="13" y="11" width="8" height="8" rx="1.5" />
      <line x1="17" y1="13" x2="17" y2="17" />
      <line x1="15" y1="15" x2="19" y2="15" />
      <path d="M12 2L6 9h12z" />
    </svg>`;
  }
  if (name.includes("sport") || name.includes("play")) {
    return `<svg class="cat-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M6.2 6.2a8 8 0 0 0 11.6 11.6" />
      <path d="M17.8 6.2a8 8 0 0 0-11.6 11.6" />
      <path d="M12 2v20" />
      <path d="M2 12h20" />
    </svg>`;
  }
  if (name.includes("stationery") || name.includes("book")) {
    return `<svg class="cat-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="9" y1="6" x2="15" y2="6" />
      <line x1="9" y1="10" x2="15" y2="10" />
      <line x1="9" y1="14" x2="13" y2="14" />
    </svg>`;
  }
  if (name.includes("gift") || name.includes("novelty")) {
    return `<svg class="cat-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <line x1="12" y1="8" x2="12" y2="21" />
      <line x1="3" y1="13" x2="21" y2="13" />
      <path d="M12 8a3 3 0 1 0-3-3 3 3 0 0 0 3 3z" />
      <path d="M12 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3z" />
    </svg>`;
  }
  
  return `<svg class="cat-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>`;
}

// Render dynamic categories on homepage
async function renderCategoryGroups() {
  const dynamicCategoriesGrid = document.getElementById("dynamicCategoriesGrid");
  if (!dynamicCategoriesGrid) return;
  
  try {
    const res = await apiGetCategories();
    let categories = res.data || [];
    if (categories.length === 0) categories = DEFAULT_CATEGORIES_DATA;
    
    // Filter categories that should show on home and sort by order
    const homeCategories = categories
      .filter(cat => cat.isActive && cat.showOnHome)
      .sort((a, b) => a.order - b.order);
      
    if (homeCategories.length === 0) {
      dynamicCategoriesGrid.innerHTML = `<div style="text-align: center; grid-column: 1 / -1; padding: 40px; color: var(--light-brown);">No categories available at the moment.</div>`;
      return;
    }
    
    // Beautiful premium gradients palette for categories
    const gradients = [
      "linear-gradient(135deg, #FFE082, #FFF9C4)", // yellow
      "linear-gradient(135deg, #F8BBD0, #FCE4EC)", // pink
      "linear-gradient(135deg, #B3E5FC, #E1F5FE)", // blue
      "linear-gradient(135deg, #C8E6C9, #E8F5E9)", // green
      "linear-gradient(135deg, #B2DFDB, #E0F2F1)", // teal
      "linear-gradient(135deg, #D1C4E9, #EDE7F6)"  // purple
    ];
    
    // Colors for the icons to match the gradients
    const iconColors = [
      "#FF9100", "#FF4081", "#03A9F4", "#4CAF50", "#009688", "#673AB7"
    ];

    let html = '';
    homeCategories.forEach((cat, index) => {
      const gradient = gradients[index % gradients.length];
      const iconColor = iconColors[index % iconColors.length];
      
      let mediaHtml = '';
      if (cat.image) {
        mediaHtml = `<div style="width: 100%; height: 140px; overflow: hidden; border-radius: var(--border-radius-md); margin-bottom: 15px; box-shadow: var(--shadow-sm);"><img src="${cat.image}" alt="${cat.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform=''"></div>`;
      } else {
        const svgIcon = getPremiumCategoryIcon(cat.name);
        mediaHtml = `<div class="category-icon-container" style="color: ${iconColor};">
          ${svgIcon}
        </div>`;
      }
      
      // Build subcategory pills
      let subcatHtml = '';
      if (cat.subcategories && cat.subcategories.length > 0) {
        subcatHtml = `<div class="subcat-pills-container">`;
        cat.subcategories.forEach(sub => {
          subcatHtml += `<span class="subcat-pill" data-category="${cat.name}" data-subcat="${sub.name}" data-subcatid="${sub._id}">${sub.name}</span>`;
        });
        subcatHtml += `</div>`;
      }

      html += `
        <div class="primary-category-card" data-category="${cat.name}" data-id="${cat._id}" style="background: ${gradient};">
          <div style="width: 100%; display: flex; flex-direction: column; align-items: center; flex-grow: 1;">
            ${mediaHtml}
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--dark-brown); margin-bottom: 4px;">${cat.name}</h3>
            <p style="font-size: 0.85rem; color: var(--light-brown); margin: 0; line-height: 1.3;">${cat.description || 'Curated collection'}</p>
            ${subcatHtml}
          </div>
          <div style="margin-top: 16px; width: 100%; display: flex; justify-content: center;">
             <span class="view-all-btn" style="font-size: 0.75rem;">View All →</span>
          </div>
        </div>
      `;
    });
    
    dynamicCategoriesGrid.innerHTML = html;
    
    // Attach click events to the entire category card
    document.querySelectorAll(".primary-category-card").forEach(card => {
      card.addEventListener("click", () => {
        const catName = card.getAttribute("data-category");
        selectedCategory = catName;
        selectedAgeGroup = "all";
        searchQuery = "";
        elements.searchInput.value = "";
        renderProducts();
        const productsSection = document.getElementById("products");
        if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
        showToast(`Showing all ${catName}`, "success");
      });
    });

    // Attach click events for subcategory pills (stops propagation so whole card click doesn't trigger)
    document.querySelectorAll(".subcat-pill").forEach(pill => {
      pill.addEventListener("click", (e) => {
        e.stopPropagation();
        const catName = pill.getAttribute("data-category");
        const subName = pill.getAttribute("data-subcat");
        selectedCategory = catName;
        selectedAgeGroup = "all";
        searchQuery = subName.toLowerCase();
        elements.searchInput.value = subName;
        renderProducts();
        const productsSection = document.getElementById("products");
        if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
        showToast(`Showing ${catName} › ${subName}`, "success");
      });
    });
    
    // Render the subcategory filters (pills) for the active category
    renderSubcategoryFilters(homeCategories);
    
  } catch (err) {
    console.error("Failed to load home categories:", err);
    dynamicCategoriesGrid.innerHTML = `<div style="text-align: center; grid-column: 1 / -1; padding: 40px; color: var(--accent-red);">Failed to load categories. Please try again.</div>`;
  }
}

function renderSubcategoryFilters(categories) {
  // Find or create the filter-tabs container
  let filterTabsContainer = elements.filterTabs;
  if (filterTabsContainer) {
    filterTabsContainer.innerHTML = `<button class="filter-tab active" data-category="all">All Categories</button>`;
    
    categories.forEach(cat => {
      filterTabsContainer.innerHTML += `<button class="filter-tab" data-category="${cat.name}">${cat.name}</button>`;
    });
    
    // Reattach event listeners to new tabs
    const tabs = elements.filterTabs.querySelectorAll(".filter-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        selectedCategory = tab.getAttribute("data-category");
        renderProducts();
      });
    });
  }
}

// Render featured products grid with Rupees pricing and percentage discounts and ageGroup filters
function renderProducts() {
  // Centralized visual state updates for filters
  const shopAgePills = document.querySelectorAll(".age-pill");
  if (shopAgePills.length > 0) {
    shopAgePills.forEach(p => {
      if (p.getAttribute("data-age") === selectedAgeGroup) {
        p.classList.add("active");
      } else {
        p.classList.remove("active");
      }
    });
  }

  const sideAgeBtns = elements.sideNavDrawer.querySelectorAll(".side-nav-btn");
  if (sideAgeBtns.length > 0) {
    sideAgeBtns.forEach(b => {
      if (b.getAttribute("data-age") === selectedAgeGroup) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  }

  const catTabs = elements.filterTabs.querySelectorAll(".filter-tab");
  if (catTabs.length > 0) {
    catTabs.forEach(t => {
      if (t.getAttribute("data-category").toLowerCase() === selectedCategory.toLowerCase()) {
        t.classList.add("active");
      } else {
        t.classList.remove("active");
      }
    });
  }

  let filtered = PRODUCTS.filter(prod => {
    const matchesCategory = selectedCategory === "all" || 
      (prod.category && prod.category.toLowerCase().startsWith(selectedCategory.toLowerCase()));
      
    const matchesAgeGroup = selectedAgeGroup === "all" || prod.ageGroup === selectedAgeGroup || prod.ageGroup === "All";
    const matchesSearch = prod.name && (prod.name.toLowerCase().includes(searchQuery) || 
      (prod.category && prod.category.toLowerCase().includes(searchQuery)));
      
    return matchesCategory && matchesAgeGroup && matchesSearch;
  });

  if (filtered.length === 0) {
    elements.productsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--light-brown);">
        <p style="font-size: 1.2rem; font-weight: bold; margin-bottom: 8px;">No products found</p>
        <p style="font-size: 0.95rem;">Try another keyword or select a different category tab.</p>
      </div>
    `;
    return;
  }

  elements.productsGrid.innerHTML = filtered.map(prod => {
    const isWished = wishlist.includes(prod._id) || wishlist.includes(prod.id) || wishlist.includes(String(prod.id)) || wishlist.includes(Number(prod.id));
    
    // Calculate discount percentage
    let discountBadge = "";
    if (prod.originalPrice && prod.originalPrice > prod.price) {
      const discountPct = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
      if (discountPct > 0) {
        discountBadge = `<span class="badge-tag badge-discount">${discountPct}% OFF</span>`;
      }
    }

    return `
      <div class="product-card" onclick="openQuickView('${prod._id || prod.id}')" style="cursor: pointer; animation: fadeIn 0.5s ease forwards; ${!prod.inStock ? 'opacity: 0.7;' : ''}">
        <div class="product-badges">
          ${prod.isNew ? '<span class="badge-tag badge-new">NEW</span>' : ''}
          ${prod.isSale ? '<span class="badge-tag badge-sale">SALE</span>' : ''}
          ${discountBadge}
          ${!prod.inStock ? '<span class="badge-tag" style="background-color: #E0E0E0; color: #757575;">OUT OF STOCK</span>' : ''}
        </div>
        <button class="wishlist-toggle-btn ${isWished ? 'wished' : ''}" onclick="event.stopPropagation(); toggleWishlist('${prod._id || prod.id}')" title="Add to Wishlist">
          <svg viewBox="0 0 24 24">
            <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.41,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.59,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
          </svg>
        </button>
        <div class="product-img-wrapper" onclick="openQuickView('${prod._id || prod.id}')">
          <img src="${prod.image}" alt="${prod.name}" class="product-img" loading="lazy">
          <div class="product-actions-overlay">
            <button class="product-overlay-btn" onclick="event.stopPropagation(); openQuickView('${prod._id || prod.id}')">Quick View</button>
          </div>
        </div>
        <div class="product-info">
          <span class="product-category">${prod.category} ${prod.ageGroup && prod.ageGroup !== 'All' ? `• Age: ${prod.ageGroup} Yrs` : ''}</span>
          <h3 class="product-name" onclick="openQuickView('${prod._id || prod.id}')">${prod.name}</h3>
          <div class="product-rating">
            <span>${(prod.rating || 5).toFixed(1)}</span>
            <svg viewBox="0 0 24 24"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/></svg>
            <span class="rating-count">(${prod.reviews ? prod.reviews.length : 0})</span>
          </div>
          <div class="product-price-row">
            <div class="price-container">
              <span class="product-price">₹${prod.price.toLocaleString('en-IN')}</span>
              ${prod.originalPrice ? `<span class="product-original-price">₹${prod.originalPrice.toLocaleString('en-IN')}</span>` : ''}
              ${prod.originalPrice && prod.originalPrice > prod.price ? `<span class="discount-tag-orange">(${Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF)</span>` : ''}
            </div>
          </div>
          ${!prod.inStock ? `<span style="font-size: 0.8rem; font-weight: 700; color: var(--accent-red); margin-top: 8px; display: block;">Sold Out</span>` : ''}
        </div>
      </div>
    `;
  }).join("");

  if (window.observeFadeElements) window.observeFadeElements();
}

// Render shopping cart list items inside the sliding cart drawer in Rupees
function renderCart() {
  if (cart.length === 0) {
    elements.cartDrawerBody.innerHTML = `
      <div class="empty-drawer-view">
        <svg viewBox="0 0 24 24">
          <path d="M17,18A2,2 0 0,1 19,20A2,2 0 0,1 17,22A2,2 0 0,1 15,20A2,2 0 0,1 17,18M7,18A2,2 0 0,1 9,20A2,2 0 0,1 7,22A2,2 0 0,1 5,20A2,2 0 0,1 7,18M7.2,14.63L7.17,14.75A0.25,0.25 0 0,0 7.42,15H19V17H7A2,2 0 0,1 5,15C5,14.65 5.07,14.31 5.24,14L6.6,11.59L3,2H1V0H4.27L5.21,2H20A1,1 0 0,1 21,3C21,3.26 20.92,3.5 20.8,3.71L17.15,10.32C16.8,11 16,11.5 15.1,11.5H8.53L7.2,14.63Z"/>
        </svg>
        <h3 style="font-size: 1.2rem; margin-bottom: 8px;">Your cart is empty</h3>
        <p style="font-size: 0.9rem;">Fill it with loving items and premium toys for your baby!</p>
      </div>
    `;
    elements.cartSubtotal.textContent = "₹0";
    return;
  }

  let total = 0;
  elements.cartDrawerBody.innerHTML = cart.map(item => {
    const prod = getProductByIdLocal(item.productId);
    if (!prod) return '';
    const itemSubtotal = prod.price * item.quantity;
    total += itemSubtotal;
    return `
      <div class="drawer-item">
        <img src="${prod.image}" alt="${prod.name}" class="drawer-item-img">
        <div class="drawer-item-details">
          <h4 class="drawer-item-title">${prod.name}</h4>
          <span class="drawer-item-price">₹${prod.price.toLocaleString('en-IN')}</span>
          <div class="drawer-item-qty">
            <button class="qty-btn" onclick="updateCartQuantity('${prod._id || prod.id}', ${item.quantity - 1})">-</button>
            <span style="font-weight: bold; font-size: 0.95rem;">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQuantity('${prod._id || prod.id}', ${item.quantity + 1})">+</button>
          </div>
        </div>
        <button class="drawer-item-remove" onclick="removeFromCart('${prod._id || prod.id}')" title="Remove item">
          <svg viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
        </button>
      </div>
    `;
  }).join("");

  elements.cartSubtotal.textContent = `₹${total.toLocaleString('en-IN')}`;
}
// Render wishlist saved items inside the sliding wishlist drawer in Rupees
function renderWishlist() {
  if (wishlist.length === 0) {
    elements.wishlistDrawerBody.innerHTML = `
      <div class="empty-drawer-view">
        <svg viewBox="0 0 24 24">
          <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.41,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.59,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
        </svg>
        <h3 style="font-size: 1.2rem; margin-bottom: 8px;">Your wishlist is empty</h3>
        <p style="font-size: 0.9rem;">Tap the heart icon on products to save them for later!</p>
      </div>
    `;
    return;
  }

  elements.wishlistDrawerBody.innerHTML = wishlist.map(id => {
    const prod = getProductByIdLocal(id);
    if (!prod) return '';

    return `
      <div class="drawer-item">
        <img src="${prod.image}" alt="${prod.name}" class="drawer-item-img">
        <div class="drawer-item-details">
          <h4 class="drawer-item-title">${prod.name}</h4>
          <span class="drawer-item-price">₹${prod.price.toLocaleString('en-IN')}</span>
          ${prod.inStock ? `
            <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem; margin-top: 8px; border-radius: 20px;" onclick="moveWishlistToCart('${prod._id || prod.id}')">
              Add to Cart
            </button>
          ` : '<span style="font-size: 0.75rem; color: var(--accent-red); display:block; margin-top:6px; font-weight:700;">Sold Out</span>'}
        </div>
        <button class="drawer-item-remove" onclick="toggleWishlist('${prod._id || prod.id}')" title="Remove item">
          <svg viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
        </button>
      </div>
    `;
  }).join("");
}

// Add item to cart
function addToCart(productId, qty) {
  const prod = getProductByIdLocal(productId);
  if (!prod) return;

  const existing = cart.find(item => String(item.productId) === String(productId));
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ productId, quantity: qty });
  }

  localStorage.setItem("mt_cart", JSON.stringify(cart));
  updateBadges();
  renderCart();
  showToast(`Added ${prod.name} to Cart!`, "success");
}

// Buy Now function - adds to cart and immediately triggers checkout
function buyNow(productId, qty = 1) {
  const prod = getProductByIdLocal(productId);
  if (!prod) return;

  const existing = cart.find(item => String(item.productId) === String(productId));
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ productId, quantity: qty });
  }

  localStorage.setItem("mt_cart", JSON.stringify(cart));
  updateBadges();
  renderCart();
  
  // Trigger checkout directly
  elements.checkoutBtn.click();
}

// Remove item from cart
function removeFromCart(productId) {
  cart = cart.filter(item => String(item.productId) !== String(productId));
  localStorage.setItem("mt_cart", JSON.stringify(cart));
  updateBadges();
  renderCart();
  showToast("Removed item from cart.", "error");
}

// Update cart quantity
function updateCartQuantity(productId, qty) {
  if (qty <= 0) {
    removeFromCart(productId);
    return;
  }

  const existing = cart.find(item => String(item.productId) === String(productId));
  if (existing) {
    existing.quantity = qty;
  }

  localStorage.setItem("mt_cart", JSON.stringify(cart));
  updateBadges();
  renderCart();
}

// Toggle product in wishlist
function toggleWishlist(productId) {
  const indexStr = wishlist.indexOf(String(productId));
  const indexNum = wishlist.indexOf(Number(productId));
  const prod = getProductByIdLocal(productId);

  if (indexStr > -1) {
    wishlist.splice(indexStr, 1);
    showToast("Removed from wishlist.", "error");
  } else if (indexNum > -1) {
    wishlist.splice(indexNum, 1);
    showToast("Removed from wishlist.", "error");
  } else {
    wishlist.push(productId);
    showToast(`Saved ${prod?.name || 'product'} to Wishlist!`, "success");
  }

  localStorage.setItem("mt_wishlist", JSON.stringify(wishlist));
  updateBadges();
  renderWishlist();
  renderProducts(); // Refresh heart states in main grid
}

// Move item from wishlist to cart
function moveWishlistToCart(productId) {
  addToCart(productId, 1);
  toggleWishlist(productId); // Remove from wishlist
}

// Update badges on cart/wishlist icons
function updateBadges() {
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  elements.cartBadge.textContent = totalCartItems;
  elements.wishlistBadge.textContent = wishlist.length;

  elements.cartBadge.style.display = totalCartItems > 0 ? "flex" : "none";
  elements.wishlistBadge.style.display = wishlist.length > 0 ? "flex" : "none";
}

// Render star SVGs based on rating
function renderStars(rating) {
  const rounded = Math.round(rating || 5);
  let starsHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      starsHtml += `<svg style="width:16px;height:16px;fill:#FFA726" viewBox="0 0 24 24"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/></svg>`;
    } else {
      starsHtml += `<svg style="width:16px;height:16px;fill:#E0E0E0" viewBox="0 0 24 24"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/></svg>`;
    }
  }
  return starsHtml;
}

// Render star percentage breakdown
function renderRatingBreakdown(reviews) {
  const list = reviews || [];
  const total = list.length;
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  list.forEach(r => {
    const rVal = Math.round(r.rating) || 5;
    if (counts[rVal] !== undefined) {
      counts[rVal]++;
    }
  });

  let breakdownHtml = '<div style="display: flex; flex-direction: column; gap: 8px;">';
  for (let star = 5; star >= 1; star--) {
    const count = counts[star];
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    breakdownHtml += `
      <div style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem;">
        <span style="width: 15px; font-weight: 600; color: var(--dark-brown);">${star}</span>
        <svg style="width:12px;height:12px;fill:#FFA726" viewBox="0 0 24 24"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/></svg>
        <div style="flex: 1; height: 8px; background-color: var(--cream); border-radius: 4px; overflow: hidden;">
          <div style="width: ${pct}%; height: 100%; background-color: var(--light-orange); border-radius: 4px;"></div>
        </div>
        <span style="width: 35px; text-align: right; color: var(--light-brown); font-weight: 600;">${pct}%</span>
      </div>
    `;
  }
  breakdownHtml += '</div>';
  return breakdownHtml;
}

// Render list of individual reviews
function renderReviewList(reviews) {
  const list = reviews || [];
  if (list.length === 0) {
    return `
      <div style="text-align: center; padding: 30px 10px; color: var(--light-brown);">
        <p style="font-size: 1rem; font-weight: 600; margin-bottom: 4px;">No reviews yet</p>
        <p style="font-size: 0.85rem;">Be the first to buy and review this product!</p>
      </div>
    `;
  }

  return list.map(r => {
    const dateStr = new Date(r.createdAt || Date.now()).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    const colors = ['#FFD180', '#FF8A80', '#EA80FC', '#8C9EFF', '#80D8FF', '#A7FFEB', '#CCFF90'];
    const charCodeSum = (r.name || 'A').charCodeAt(0) + (r.name || 'A').charCodeAt((r.name || 'A').length - 1);
    const avatarBg = colors[charCodeSum % colors.length];
    const initials = (r.name || 'A').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return `
      <div class="review-item" style="border-bottom: 1px solid var(--cream); padding-bottom: 16px; margin-bottom: 16px; animation: fadeIn 0.4s ease;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background-color: ${avatarBg}; color: var(--dark-brown); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; box-shadow: var(--shadow-sm);">
              ${initials}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="font-weight: 700; color: var(--dark-brown); font-size: 0.95rem;">${r.name}</span>
                <span style="background-color: #E8F5E9; color: #2E7D32; font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 12px; display: inline-flex; align-items: center; gap: 2px;">
                  <svg style="width: 10px; height: 10px; fill: #2E7D32;" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  Verified Buyer
                </span>
              </div>
              <span style="font-size: 0.75rem; color: var(--light-brown);">${dateStr}</span>
            </div>
          </div>
          <div>
            ${renderStars(r.rating)}
          </div>
        </div>
        <p style="font-size: 0.9rem; color: var(--dark-brown); line-height: 1.5; margin-left: 48px; margin-top: -4px;">${r.comment}</p>
      </div>
    `;
  }).join('');
}

// Open Quick View Modal with populated contents in Rupees
async function openQuickView(productId) {
  const prod = getProductByIdLocal(productId);
  if (!prod) return;

  // Check if user is logged in and check purchase status
  const currentUser = getStoredUser();
  let hasPurchased = false;

  if (currentUser) {
    try {
      const ordersRes = await apiGetMyOrders();
      const userOrders = ordersRes.data || [];
      hasPurchased = userOrders.some(order => 
        order.status !== 'cancelled' &&
        order.items.some(item => String(item.productId) === String(prod._id || prod.id))
      );
    } catch (err) {
      console.error("Error checking purchase status:", err);
    }
  }

  // Get similar products from the same category or category group
  let similarProds = PRODUCTS.filter(p => 
    (p._id || p.id) !== prod.id && (p._id || p.id) !== prod._id &&
    p.category === prod.category
  );
  
  if (similarProds.length === 0) {
    const mainCat = (prod.category || "").split('>')[0].trim();
    similarProds = PRODUCTS.filter(p => 
      (p._id || p.id) !== prod.id && (p._id || p.id) !== prod._id &&
      (p.category || "").split('>')[0].trim() === mainCat
    );
  }
  similarProds = similarProds.slice(0, 6);

  // Get all unique product images (primary first, then additional)
  const allImages = [prod.image, ...(prod.images || [])]
    .map(url => url ? url.trim() : "")
    .filter((val, index, self) => val !== "" && self.indexOf(val) === index);

  // 1. Pre-render Carousel navigation buttons
  let navButtonsHtml = "";
  if (allImages.length > 1) {
    navButtonsHtml = `
      <button id="carouselPrevBtn" class="carousel-nav-btn" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.92); border: none; box-shadow: var(--shadow-md); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 2; transition: all 0.2s;">
        <svg style="width: 22px; height: 22px; fill: var(--dark-brown);" viewBox="0 0 24 24"><path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"/></svg>
      </button>
      <button id="carouselNextBtn" class="carousel-nav-btn" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.92); border: none; box-shadow: var(--shadow-md); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 2; transition: all 0.2s;">
        <svg style="width: 22px; height: 22px; fill: var(--dark-brown);" viewBox="0 0 24 24"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/></svg>
      </button>
    `;
  }

  // 2. Pre-render Carousel thumbnails
  let thumbnailsHtml = "";
  if (allImages.length > 1) {
    const thumbsListHtml = allImages.map((img, idx) => `
      <img class="carousel-thumb-img ${idx === 0 ? 'active' : ''}" src="${img}" data-index="${idx}" style="width: 54px; height: 54px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid ${idx === 0 ? 'var(--light-orange)' : 'transparent'}; background-color: var(--cream); transition: all 0.2s; box-shadow: var(--shadow-xs);">
    `).join('');

    thumbnailsHtml = `
      <div class="carousel-thumbnails-row" style="display: flex; gap: 8px; justify-content: center; width: 100%; overflow-x: auto; padding: 6px 0; scrollbar-width: thin;">
        ${thumbsListHtml}
      </div>
    `;
  }

  // 3. Pre-render Similar products list
  let similarProductsHtml = "";
  if (similarProds.length > 0) {
    const cardsListHtml = similarProds.map(p => `
      <div class="similar-product-card" onclick="openQuickView('${p._id || p.id}')" style="flex: 0 0 160px; background-color: var(--cream); border-radius: var(--border-radius-md); padding: 12px; cursor: pointer; text-align: center; border: 1px solid rgba(93,64,55,0.05); display: flex; flex-direction: column; justify-content: space-between; height: 230px;">
        <div style="width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background-color: white; border-radius: 6px; overflow: hidden; margin-bottom: 8px;">
          <img src="${p.image}" alt="${p.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; text-align: left;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--dark-brown); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0;">${p.name}</h4>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--dark-brown);">₹${p.price.toLocaleString('en-IN')}</span>
            ${p.originalPrice ? `<span style="font-size: 0.75rem; color: var(--light-brown); text-decoration: line-through;">₹${p.originalPrice.toLocaleString('en-IN')}</span>` : ''}
          </div>
          <div style="display: flex; align-items: center; font-size: 0.75rem; color: var(--light-orange); font-weight: bold; gap: 2px;">
            ★ ${(p.rating || 5.0).toFixed(1)}
          </div>
        </div>
      </div>
    `).join('');

    similarProductsHtml = `
      <div class="similar-products-section" style="padding: 30px; border-top: 2px solid var(--cream); background-color: var(--white);">
        <h3 style="font-family: var(--font-header); font-size: 1.2rem; margin-bottom: 16px; color: var(--dark-brown); display: flex; align-items: center; gap: 8px;">
          <svg style="width: 22px; height: 22px; fill: var(--light-orange);" viewBox="0 0 24 24"><path d="M12,18H6V14H12M21,14V12L20,7H4L3,12V14H4V20H14V14H18V20H20V14M20,4H4V6H20V4Z"/></svg>
          Similar Products You May Like
        </h3>
        <div class="similar-products-scroll" style="display: flex; gap: 16px; overflow-x: auto; padding: 8px 0; scrollbar-width: thin; -webkit-overflow-scrolling: touch;">
          ${cardsListHtml}
        </div>
      </div>
    `;
  }

  // 4. Pre-render Reviews right column HTML to completely de-nest template strings
  let reviewsRightColHtml = "";
  if (hasPurchased) {
    reviewsRightColHtml = `
      <div class="write-review-card" style="background-color: var(--white); border: 2px solid var(--cream); border-radius: var(--border-radius-lg); padding: 20px; box-shadow: var(--shadow-sm);">
        <h4 style="font-family: var(--font-header); font-size: 1.05rem; margin-bottom: 10px; color: var(--dark-brown);">Share Your Experience</h4>
        <form id="productReviewForm" style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label style="font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 4px; color: var(--dark-brown);">Your Rating</label>
            <div class="star-rating-selector" style="display: flex; gap: 6px; font-size: 1.6rem; cursor: pointer; color: #E0E0E0; line-height: 1;">
              <span class="selector-star" data-rating="1">★</span>
              <span class="selector-star" data-rating="2">★</span>
              <span class="selector-star" data-rating="3">★</span>
              <span class="selector-star" data-rating="4">★</span>
              <span class="selector-star" data-rating="5">★</span>
            </div>
            <input type="hidden" id="reviewRatingInput" value="" required>
          </div>
          <div>
            <label for="reviewCommentInput" style="font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 4px; color: var(--dark-brown);">Your Review</label>
            <textarea id="reviewCommentInput" rows="2" required placeholder="Tell others about quality, size, and fit..." style="border: 2px solid var(--cream); padding: 8px 12px; border-radius: var(--border-radius-md); font-family: var(--font-body); width: 100%; outline: none; resize: none; font-size: 0.9rem;"></textarea>
          </div>
          <button type="submit" class="btn" style="background: var(--deep-orange); color: white; font-weight: 700; border-radius: 30px; border: none; padding: 8px 18px; transition: transform 0.2s; align-self: flex-start; cursor: pointer; font-size: 0.9rem;">Submit Review</button>
        </form>
      </div>
    `;
  } else {
    const loginTextHtml = currentUser 
      ? "Only customers who purchased this product can leave a review." 
      : `Please <span style="text-decoration: underline; cursor: pointer; color: var(--deep-orange); font-weight: 700;" onclick="closeModal(); openModal(elements.userAuthModal);">login</span> to write a review.`;

    reviewsRightColHtml = `
      <div style="background-color: var(--cream); border-radius: var(--border-radius-md); padding: 15px; text-align: center; border: 1px dashed var(--light-brown); color: var(--light-brown);">
        <p style="font-size: 0.85rem; margin-bottom: 0; font-weight: 600;">
          ${loginTextHtml}
        </p>
      </div>
    `;
  }

  elements.modalBodyContent.innerHTML = `
    <div class="quickview-main-details">
      <!-- Carousel Column -->
      <div class="modal-img-col" style="padding: 30px; display: flex; flex-direction: column; gap: 16px; align-items: center; justify-content: flex-start;">
        <div class="carousel-main-wrapper" style="position: relative; width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background-color: var(--cream); border-radius: var(--border-radius-lg); overflow: hidden; border: 1px solid rgba(93,64,55,0.06); box-shadow: var(--shadow-sm);">
          <img id="carouselMainImg" src="${allImages[0] || prod.image}" alt="${prod.name}" style="max-width: 100%; max-height: 100%; object-fit: contain; transition: opacity 0.2s ease;">
          ${navButtonsHtml}
        </div>
        ${thumbnailsHtml}
      </div>

      <!-- Info Column -->
      <div class="modal-info-col" style="padding: 30px;">
        <span class="modal-category">${prod.category} ${prod.ageGroup && prod.ageGroup !== 'All' ? `• Age: ${prod.ageGroup} Yrs` : ''}</span>
        <h2 class="modal-title" style="margin-bottom: 8px;">${prod.name}</h2>
        <div class="modal-rating" style="margin-bottom: 12px;">
          ${renderStars(prod.rating || 5.0)}
          <span style="font-weight: bold; margin-left: 4px; color: var(--dark-brown);">${(prod.rating || 5.0).toFixed(1)}</span>
          <span style="color: var(--light-brown); font-size: 0.85rem; margin-left: 8px;">(${prod.reviews ? prod.reviews.length : 0} reviews)</span>
        </div>
        <div class="modal-price-row" style="margin-bottom: 12px;">
          <span class="modal-price" style="font-size: 1.5rem; color: var(--dark-brown);">₹${prod.price.toLocaleString('en-IN')}</span>
          ${prod.originalPrice ? `<span class="product-original-price" style="font-size: 1.1rem;">₹${prod.originalPrice.toLocaleString('en-IN')}</span>` : ''}
        </div>
        <p class="modal-desc" style="margin-bottom: 16px; font-size: 0.9rem;">${prod.description}</p>
        
        <div class="modal-actions" style="display: flex; gap: 10px; align-items: stretch; margin-top: 10px;">
          ${prod.inStock ? `
            <div class="modal-qty">
              <button id="modalQtyDec">-</button>
              <input type="text" id="modalQtyVal" value="1" readonly>
              <button id="modalQtyInc">+</button>
            </div>
            <button class="btn" id="modalAddToCartBtn" style="flex: 1; background: var(--soft-yellow); color: var(--dark-brown); font-weight: 700; border-radius: 30px; border: 2px solid var(--light-orange); transition: transform 0.2s;">Add to Cart</button>
            <button class="btn" id="modalBuyNowBtn" style="flex: 1; background: linear-gradient(to right, var(--deep-orange), var(--light-orange)); color: white; font-weight: 700; border-radius: 30px; border: none; box-shadow: var(--shadow-md); transition: transform 0.2s;">Buy Now</button>
          ` : `<span style="font-weight: 700; color: var(--accent-red); font-size: 1.1rem; padding: 6px 0;">Product Currently Sold Out</span>`}
        </div>
      </div>
    </div>

    <!-- Similar Products Section -->
    ${similarProductsHtml}

    <!-- Reviews Grid Section -->
    <div class="reviews-section-container">
      <div class="reviews-left-col">
        <h3 style="font-family: var(--font-header); font-size: 1.25rem; margin-bottom: 16px; color: var(--dark-brown);">Customer Reviews</h3>
        
        <div class="rating-overview-box" style="background-color: var(--cream); border-radius: var(--border-radius-md); padding: 20px; text-align: center; margin-bottom: 20px; border: 1px solid rgba(93,64,55,0.05);">
          <div style="font-size: 3rem; font-weight: 800; color: var(--dark-brown); line-height: 1;">${(prod.rating || 5.0).toFixed(1)}</div>
          <div style="margin: 8px 0;">${renderStars(prod.rating || 5.0)}</div>
          <div style="font-size: 0.85rem; color: var(--light-brown); font-weight: 600;">Based on ${prod.reviews ? prod.reviews.length : 0} Reviews</div>
        </div>

        ${renderRatingBreakdown(prod.reviews)}
      </div>

      <div class="reviews-right-col" style="display: flex; flex-direction: column; gap: 20px;">
        ${reviewsRightColHtml}

        <div class="reviews-list-container" style="max-height: 250px; overflow-y: auto; padding-right: 8px;">
          ${renderReviewList(prod.reviews)}
        </div>
      </div>
    </div>
  `;

  // Hook up Image Carousel event listeners
  if (allImages.length > 1) {
    const mainImg = document.getElementById("carouselMainImg");
    const prevBtn = document.getElementById("carouselPrevBtn");
    const nextBtn = document.getElementById("carouselNextBtn");
    const thumbs = document.querySelectorAll(".carousel-thumb-img");
    
    let currentIndex = 0;
    
    const updateCarousel = (index) => {
      currentIndex = (index + allImages.length) % allImages.length;
      
      // Fade transition effect
      if (mainImg) {
        mainImg.style.opacity = 0.2;
        setTimeout(() => {
          mainImg.src = allImages[currentIndex];
          mainImg.style.opacity = 1;
        }, 120);
      }
      
      // Toggle active states on thumbs
      thumbs.forEach((t, idx) => {
        if (idx === currentIndex) {
          t.style.borderColor = "var(--light-orange)";
          t.classList.add("active");
        } else {
          t.style.borderColor = "transparent";
          t.classList.remove("active");
        }
      });
    };
    
    if (prevBtn) prevBtn.addEventListener("click", () => updateCarousel(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => updateCarousel(currentIndex + 1));
    
    thumbs.forEach(thumb => {
      thumb.addEventListener("click", () => {
        const idx = parseInt(thumb.getAttribute("data-index"));
        updateCarousel(idx);
      });
    });
  }

  if (prod.inStock) {
    const qtyVal = document.getElementById("modalQtyVal");
    document.getElementById("modalQtyDec").addEventListener("click", () => {
      let current = parseInt(qtyVal.value);
      if (current > 1) qtyVal.value = current - 1;
    });
    document.getElementById("modalQtyInc").addEventListener("click", () => {
      let current = parseInt(qtyVal.value);
      qtyVal.value = current + 1;
    });
    document.getElementById("modalAddToCartBtn").addEventListener("click", () => {
      const quantity = parseInt(qtyVal.value);
      addToCart(prod._id || prod.id, quantity);
      closeModal();
    });
    const modalBuyNowBtn = document.getElementById("modalBuyNowBtn");
    if (modalBuyNowBtn) {
      modalBuyNowBtn.addEventListener("click", () => {
        const quantity = parseInt(qtyVal.value);
        buyNow(prod._id || prod.id, quantity);
      });
    }
  }

  // Hook up Star Selector Events if form is rendered
  const stars = document.querySelectorAll(".selector-star");
  const ratingInput = document.getElementById("reviewRatingInput");
  
  if (stars.length > 0 && ratingInput) {
    let currentRating = 0;
    
    stars.forEach(star => {
      star.addEventListener("mouseover", () => {
        const rVal = parseInt(star.getAttribute("data-rating"));
        highlightStars(rVal);
      });
      
      star.addEventListener("mouseout", () => {
        highlightStars(currentRating);
      });
      
      star.addEventListener("click", () => {
        currentRating = parseInt(star.getAttribute("data-rating"));
        ratingInput.value = currentRating;
        highlightStars(currentRating);
      });
    });
    
    function highlightStars(rating) {
      stars.forEach(s => {
        const val = parseInt(s.getAttribute("data-rating"));
        if (val <= rating) {
          s.style.color = "#FFA726";
        } else {
          s.style.color = "#E0E0E0";
        }
      });
    }
  }

  // Hook up Review Form Submit
  const reviewForm = document.getElementById("productReviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const rating = parseInt(ratingInput.value);
      const comment = document.getElementById("reviewCommentInput").value.trim();
      
      if (!rating) {
        showToast("Please select a rating star", "error");
        return;
      }
      
      try {
        const submitBtn = reviewForm.querySelector("button[type='submit']");
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
        
        await apiCreateProductReview(prod._id || prod.id, rating, comment);
        showToast("Review submitted successfully!", "success");
        
        // Reload products and refresh modal
        await loadProducts();
        openQuickView(prod._id || prod.id);
      } catch (err) {
        showToast(err.message || "Failed to submit review", "error");
        const submitBtn = reviewForm.querySelector("button[type='submit']");
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Review";
      }
    });
  }

  elements.drawerOverlay.classList.add("active");
  elements.quickViewModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// Owner Dashboard UI Operations
function openOwnerDashboard() {
  openModal(elements.ownerDashboardModal);
  elements.prodCategory.innerHTML = ALL_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  elements.slideCtaCategoryInput.innerHTML = ALL_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  
  // Reset active dashboard tabs
  elements.tabManageProducts.classList.add("active");
  elements.tabManageSlides.classList.remove("active");
  elements.tabManageOrders.classList.remove("active");
  elements.productsDashboardSection.style.display = "flex";
  elements.slidesDashboardSection.style.display = "none";
  elements.ordersDashboardSection.style.display = "none";
  elements.addNewProductBtn.style.display = "block";
  elements.addNewSlideBtn.style.display = "none";
  
  renderAdminProductsTable();
  renderAdminSlidesTable();
  renderAdminOrdersTable();
}

function renderAdminProductsTable() {
  if (PRODUCTS.length === 0) {
    elements.adminProductsTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 24px; color: var(--light-brown);">
          No products currently in store. Tap "Add Product" to create one!
        </td>
      </tr>
    `;
    return;
  }

  elements.adminProductsTableBody.innerHTML = PRODUCTS.map(prod => {
    let discountInfo = "-";
    if (prod.originalPrice && prod.originalPrice > prod.price) {
      const pct = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
      discountInfo = `${pct}% OFF (Save ₹${prod.originalPrice - prod.price})`;
    }

    return `
      <tr style="border-bottom: 1px solid rgba(93, 64, 55, 0.05);">
        <td style="padding: 8px 12px;">
          <img src="${prod.image}" alt="${prod.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; background-color: var(--cream);">
        </td>
        <td style="padding: 8px 12px; font-weight: 600; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${prod.name}
        </td>
        <td style="padding: 8px 12px; color: var(--light-brown); font-size: 0.85rem;">
          ${prod.category}
        </td>
        <td style="padding: 8px 12px; font-weight: 700;">
          ₹${prod.price.toLocaleString('en-IN')}
        </td>
        <td style="padding: 8px 12px; font-size: 0.85rem; color: ${discountInfo !== '-' ? 'var(--accent-red)' : 'var(--light-brown)'}; font-weight: ${discountInfo !== '-' ? '700' : 'normal'};">
          ${discountInfo}
        </td>
        <td style="padding: 8px 12px;">
          <span class="admin-stock-badge ${prod.inStock ? 'admin-stock-in' : 'admin-stock-out'}">
            ${prod.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </td>
        <td style="padding: 8px 12px; text-align: center; white-space: nowrap;">
          <button class="admin-action-btn admin-btn-edit" onclick="editProduct('${prod._id || prod.id}')" title="Edit Product">
            <svg viewBox="0 0 24 24"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.07,6.19L3,17.25Z"/></svg>
          </button>
          <button class="admin-action-btn admin-btn-delete" onclick="deleteProduct('${prod._id || prod.id}')" title="Delete Product">
            <svg viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// Edit existing product
function editProduct(id) {
  const prod = PRODUCTS.find(p => (p._id || p.id) === id);
  if (!prod) return;

  elements.productFormPanel.style.display = "block";
  elements.addNewProductBtn.style.display = "none";
  elements.formPanelTitle.textContent = "Edit Product Details";

  elements.editProductId.value = prod._id || prod.id;
  elements.prodName.value = prod.name;
  
  // Set category dropdown value
  let catVal = "";
  if (prod.categoryId) {
    catVal = prod.categoryId + "|" + (prod.subcategoryId || "");
  }
  elements.prodCategory.value = catVal;
  
  elements.prodPrice.value = Math.round(prod.price);
  elements.prodOriginalPrice.value = prod.originalPrice ? Math.round(prod.originalPrice) : "";
  elements.prodImage.value = prod.image || "";
  elements.prodImages.value = (prod.images || []).join("\n");
  elements.prodStock.value = prod.inStock ? "true" : "false";
  elements.prodAgeGroup.value = prod.ageGroup || "All";
  elements.prodDesc.value = prod.description || "";
  elements.prodIsNew.checked = !!prod.isNew;
  elements.prodIsSale.checked = !!prod.isSale;

  elements.productFormPanel.scrollIntoView({ behavior: 'smooth' });
}

// Delete product
async function deleteProduct(id) {
  const prod = PRODUCTS.find(p => (p._id || p.id) === id);
  if (!prod) return;

  if (confirm(`Are you sure you want to remove "${prod.name}" from the store catalog?`)) {
    try {
      await apiDeleteProduct(prod._id || prod.id);
      showToast("Product deleted successfully.", "success");
      await loadProducts();
      renderProducts();
      renderAdminProductsTable();
      renderCategoryGroups();
    } catch (err) {
      showToast(err.message || "Failed to delete product", "error");
    }
  }
}

// Drawer open/close helper functions
function openDrawer(drawer) {
  if (drawer === elements.cartDrawer) {
    renderCart();
  } else if (drawer === elements.wishlistDrawer) {
    renderWishlist();
  }
  elements.drawerOverlay.classList.add("active");
  drawer.classList.add("active");
  document.body.style.overflow = "hidden";
}

function openModal(modal) {
  elements.drawerOverlay.classList.add("active");
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeAllDrawers() {
  elements.drawerOverlay.classList.remove("active");
  elements.cartDrawer.classList.remove("active");
  elements.wishlistDrawer.classList.remove("active");
  elements.sideNavDrawer.classList.remove("active");
  closeModal();
  document.body.style.overflow = "";
}

function closeModal() {
  elements.quickViewModal.classList.remove("active");
  elements.ownerDashboardModal.classList.remove("active");
  elements.userAuthModal.classList.remove("active");
  elements.customerOrdersModal.classList.remove("active");
  elements.checkoutPaymentModal.classList.remove("active");
  if (!elements.cartDrawer.classList.contains("active") && !elements.wishlistDrawer.classList.contains("active") && !elements.sideNavDrawer.classList.contains("active")) {
    elements.drawerOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Toast notification function
export function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    ${type === 'success' ? '<svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: none; stroke: var(--success); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; vertical-align: middle; margin-right: 6px;"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: none; stroke: var(--accent-red); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'}
    <span>${message}</span>
  `;
  
  elements.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = "toastIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.25) reverse forwards";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Bridge for notifications.js (avoids circular import)
window.addEventListener('show-toast', (e) => showToast(e.detail.message, e.detail.type));

// Global category click API (called from footer)
window.app = {
  filterCategory: (catName) => {
    selectedCategory = catName;
    selectedAgeGroup = "all"; // Reset age filter
    renderProducts();
    
    // Clear sidebar age group selection highlight
    elements.sideNavDrawer.querySelectorAll(".side-nav-btn").forEach(btn => btn.classList.remove("active"));

    const tabs = elements.filterTabs.querySelectorAll(".filter-tab");
    tabs.forEach(tab => {
      if (tab.getAttribute("data-category").toLowerCase() === catName.toLowerCase()) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    document.querySelectorAll(".category-card").forEach(c => {
      if (c.getAttribute("data-cat-name").toLowerCase() === catName.toLowerCase()) {
        c.classList.add("active");
      } else {
        c.classList.remove("active");
      }
    });
  }
};

// Initialize FirstCry-Style Hero Slideshow Banner
function initHeroSlideshow() {
  let currentSlide = 0;
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".dot");
  const totalSlides = slides.length;

  if (totalSlides === 0) return;

  if (slideshowInterval) {
    clearInterval(slideshowInterval);
  }

  function showSlide(index) {
    if (index >= totalSlides) index = 0;
    if (index < 0) index = totalSlides - 1;
    
    slides.forEach((slide, idx) => {
      if (idx === index) {
        slide.classList.add("active");
      } else {
        slide.classList.remove("active");
      }
    });

    dots.forEach((dot, idx) => {
      if (idx === index) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });

    currentSlide = index;
  }

  function startSlideshow() {
    slideshowInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 4000);
  }

  function resetSlideshow() {
    clearInterval(slideshowInterval);
    startSlideshow();
  }

  if (elements.prevSlideBtn && elements.nextSlideBtn) {
    elements.prevSlideBtn.addEventListener("click", () => {
      showSlide(currentSlide - 1);
      resetSlideshow();
    });

    elements.nextSlideBtn.addEventListener("click", () => {
      showSlide(currentSlide + 1);
      resetSlideshow();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const slideIndex = parseInt(dot.getAttribute("data-slide"));
      showSlide(slideIndex);
      resetSlideshow();
    });
  });

  const heroSlider = document.querySelector(".hero-slider-container");
  if (heroSlider) {
    heroSlider.addEventListener("mouseenter", () => {
      clearInterval(slideshowInterval);
    });
    heroSlider.addEventListener("mouseleave", () => {
      startSlideshow();
    });
  }

  showSlide(0);
  startSlideshow();
}

// Generate inline SVG or image for dynamic hero slideshow illustration
function getIllustrationSvg(type, imageUrl) {
  if (type === "mother-holding") {
    return `
      <div style="position: relative; width: 100%; display: flex; justify-content: center; align-items: center;">
        <img src="assets/realistic_mother_baby.png" alt="Mother holding baby" class="hero-banner-img" style="width: 100%; max-width: 420px; border-radius: var(--border-radius-xl); box-shadow: var(--shadow-lg); border: 8px solid var(--white); transform: rotate(-1.5deg); transition: var(--transition-bounce);">
        
        <!-- Floating elements inside the hero slide -->
        <svg class="floating-element" viewBox="0 0 24 24" style="width: 32px; height: 32px; fill: #FF8A80; top: 10%; right: 5%; animation: float 4.5s ease-in-out infinite;"><path d="M12 2a6 6 0 0 0-6 6c0 3.5 2.5 6 6 8.5 3.5-2.5 6-5 6-8.5a6 6 0 0 0-6-6zm0 15c-.5 0-1-.5-1-1v-2c0-.5.5-1 1-1s1 .5 1 1v2c0 .5-.5 1-1 1z"/></svg>
        <svg class="floating-element" viewBox="0 0 24 24" style="width: 32px; height: 32px; fill: #B3E5FC; bottom: 15%; left: 5%; animation: float-reverse 5.5s ease-in-out infinite;"><path d="M12 3a3 3 0 0 0-3 3c0 .8.3 1.5.8 2C7.3 9.4 6 11.5 6 14c0 3.3 2.7 6 6 6s6-2.7 6-6c0-2.5-1.3-4.6-3.8-6 .5-.5.8-1.2.8-2a3 3 0 0 0-3-3zm-5 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm10 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
        <svg class="floating-element" viewBox="0 0 24 24" style="width: 28px; height: 28px; fill: #FFE082; top: 40%; left: -8%; animation: bounce 3s ease-in-out infinite;"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/></svg>
        <svg class="floating-element" viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: #FFF59D; bottom: 40%; right: -5%; animation: bounce 4s ease-in-out infinite 0.5s;"><path d="M12,2L14.7,9.3L22,12L14.7,14.7L12,22L9.3,14.7L2,12L9.3,9.3L12,2Z"/></svg>
      </div>
    `;
  } else if (type === "baby-playing") {
    return `
      <div style="position: relative; width: 100%; display: flex; justify-content: center; align-items: center;">
        <img src="assets/realistic_baby_clothing.png" alt="Baby in organic cotton wear" class="hero-banner-img" style="width: 100%; max-width: 420px; border-radius: var(--border-radius-xl); box-shadow: var(--shadow-lg); border: 8px solid var(--white); transform: rotate(1.5deg); transition: var(--transition-bounce);">
      </div>
    `;
  } else if (type === "baby-crawling") {
    return `
      <div style="position: relative; width: 100%; display: flex; justify-content: center; align-items: center;">
        <img src="assets/realistic_baby_feeding.png" alt="Baby with silicone trainer cup" class="hero-banner-img" style="width: 100%; max-width: 420px; border-radius: var(--border-radius-xl); box-shadow: var(--shadow-lg); border: 8px solid var(--white); transform: rotate(-1deg); transition: var(--transition-bounce);">
      </div>
    `;
  } else {
    // Custom URL image
    return `
      <div style="position: relative; width: 100%; display: flex; justify-content: center; align-items: center;">
        <img src="${imageUrl || 'assets/hero_banner_custom.png'}" alt="Slideshow Image" class="hero-banner-img" style="width: 100%; max-width: 420px; border-radius: var(--border-radius-xl); box-shadow: var(--shadow-lg); border: 8px solid var(--white); transform: rotate(1deg); transition: var(--transition-bounce);">
      </div>
    `;
  }
}

// Render dynamic hero slideshow slides & dots
function renderHeroSlideshow() {
  if (SLIDES.length === 0) {
    elements.heroSlideshow.innerHTML = `
      <div class="hero-slide active" style="background: linear-gradient(135deg, #FFFDE7 0%, #FFE082 100%);">
        <div class="hero-slide-grid container" style="display: flex; align-items: center; justify-content: center;">
          <h2 style="color: var(--dark-brown);">No Banners Configured</h2>
        </div>
      </div>
    `;
    elements.slidesDots.innerHTML = "";
    return;
  }

  let slidesHtml = "";
  let dotsHtml = "";

  SLIDES.forEach((slide, idx) => {
    let gradient = "";
    if (slide.bgStyle === "yellow") {
      gradient = "linear-gradient(135deg, #FFFDE7 0%, #FFE082 100%)";
    } else if (slide.bgStyle === "pink") {
      gradient = "linear-gradient(135deg, #FFF0F2 0%, #FFCDD2 100%)";
    } else if (slide.bgStyle === "blue") {
      gradient = "linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)";
    } else {
      gradient = "linear-gradient(135deg, #FFFDE7 0%, #FFE082 100%)"; // Fallback
    }

    let badgeStyle = "";
    if (slide.badgeStyle === "yellow") {
      badgeStyle = "background-color: var(--soft-yellow); color: var(--dark-brown);";
    } else if (slide.badgeStyle === "red") {
      badgeStyle = "background-color: var(--accent-red); color: white;";
    } else if (slide.badgeStyle === "blue") {
      badgeStyle = "background-color: #00acc1; color: white;";
    }

    let btnStyle = "";
    if (slide.badgeStyle === "yellow") {
      btnStyle = "";
    } else if (slide.badgeStyle === "red") {
      btnStyle = "background-color: var(--accent-red); color: white;";
    } else if (slide.badgeStyle === "blue") {
      btnStyle = "background-color: #00acc1; color: white;";
    }

    const illustrationHtml = getIllustrationSvg(slide.illustration, slide.imageUrl);

    if (slide.illustration === "custom-full") {
      slidesHtml += `
        <div class="hero-slide ${idx === 0 ? 'active' : ''}" style="background: none; padding: 0;">
          <a href="#products" onclick="app.filterCategory('${slide.ctaCategory || ''}')" style="display: block; width: 100%; height: 100%;">
            <img src="${slide.imageUrl || 'assets/main_banner.jpg'}" alt="${slide.title || 'Slide'}" style="width: 100%; height: 100%; object-fit: cover; display: block; border-radius: var(--border-radius-xl);">
          </a>
        </div>
      `;
    } else {
      slidesHtml += `
        <div class="hero-slide ${idx === 0 ? 'active' : ''}" style="background: ${gradient};">
          <div class="hero-slide-grid container">
            <div class="hero-slide-content">
              <span class="slide-badge" style="${badgeStyle}">${slide.badgeText}</span>
              <h1 class="slide-title">${slide.title}</h1>
              <p class="slide-subtitle">${slide.subtitle}</p>
              <div class="slide-ctas">
                <a href="#products" onclick="app.filterCategory('${slide.ctaCategory}')" class="btn btn-primary" style="${btnStyle}">${slide.ctaText}</a>
              </div>
            </div>
            <div class="hero-slide-image animated-hero-illustration">
              ${illustrationHtml}
            </div>
          </div>
        </div>
      `;
    }

    dotsHtml += `
      <span class="dot ${idx === 0 ? 'active' : ''}" data-slide="${idx}"></span>
    `;
  });

  elements.heroSlideshow.innerHTML = slidesHtml;
  elements.slidesDots.innerHTML = dotsHtml;
}

// Render slides table in owner dashboard
function renderAdminSlidesTable() {
  if (SLIDES.length === 0) {
    elements.adminSlidesTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 24px; color: var(--light-brown);">
          No slideshow banners configured. Tap "Add Banner" to create one!
        </td>
      </tr>
    `;
    return;
  }

  elements.adminSlidesTableBody.innerHTML = SLIDES.map(slide => {
    let badgeColor = "";
    if (slide.badgeStyle === "yellow") badgeColor = "background-color: var(--soft-yellow); color: var(--dark-brown);";
    else if (slide.badgeStyle === "red") badgeColor = "background-color: var(--accent-red); color: white;";
    else if (slide.badgeStyle === "blue") badgeColor = "background-color: #00acc1; color: white;";

    let illustrationLabel = "";
    if (slide.illustration === "baby-playing") illustrationLabel = "Baby Clothing Portrait";
    else if (slide.illustration === "mother-holding") illustrationLabel = "Mother Cradling Portrait";
    else if (slide.illustration === "baby-crawling") illustrationLabel = "Baby Feeding Cup Portrait";
    else if (slide.illustration === "custom") illustrationLabel = `Custom: ${slide.imageUrl}`;

    return `
      <tr style="border-bottom: 1px solid rgba(93, 64, 55, 0.05);">
        <td style="padding: 12px;">
          <span class="slide-badge" style="font-size: 0.75rem; padding: 4px 8px; border-radius: 12px; font-weight: 700; ${badgeColor}">
            ${slide.badgeText}
          </span>
        </td>
        <td style="padding: 12px; max-width: 300px;">
          <div style="font-weight: 600; color: var(--dark-brown); font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${slide.title}
          </div>
          <div style="font-size: 0.75rem; color: var(--light-brown); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${slide.subtitle}
          </div>
        </td>
        <td style="padding: 12px; font-size: 0.85rem; color: var(--light-brown);">
          ${illustrationLabel}
        </td>
        <td style="padding: 12px; font-size: 0.85rem; text-transform: capitalize; color: var(--light-brown);">
          ${slide.bgStyle} theme
        </td>
        <td style="padding: 12px; text-align: center; white-space: nowrap;">
          <button class="admin-action-btn admin-btn-edit" onclick="editSlide(${slide.id})" title="Edit Slide">
            <svg viewBox="0 0 24 24"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.07,6.19L3,17.25Z"/></svg>
          </button>
          <button class="admin-action-btn admin-btn-delete" onclick="deleteSlide(${slide.id})" title="Delete Slide">
            <svg viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// Edit existing slide banner
function editSlide(id) {
  const slide = SLIDES.find(s => s.id === id);
  if (!slide) return;

  elements.slideFormPanel.style.display = "block";
  elements.addNewSlideBtn.style.display = "none";
  elements.slideFormPanelTitle.textContent = "Edit Slide Banner Details";

  elements.editSlideId.value = slide.id;
  elements.slideTitleInput.value = slide.title;
  elements.slideBadgeTextInput.value = slide.badgeText;
  elements.slideBadgeStyleInput.value = slide.badgeStyle;
  elements.slideBgStyleInput.value = slide.bgStyle;
  elements.slideIllustrationInput.value = slide.illustration;
  elements.slideImageUrlInput.value = slide.imageUrl || "";
  elements.slideCtaTextInput.value = slide.ctaText;
  elements.slideCtaCategoryInput.value = slide.ctaCategory;
  elements.slideSubtitleInput.value = slide.subtitle;

  if (slide.illustration === "custom") {
    elements.slideImageUrlGroup.style.display = "flex";
  } else {
    elements.slideImageUrlGroup.style.display = "none";
  }

  elements.slideFormPanel.scrollIntoView({ behavior: 'smooth' });
}

// Delete slide banner
function deleteSlide(id) {
  const slide = SLIDES.find(s => s.id === id);
  if (!slide) return;

  if (confirm(`Are you sure you want to remove the slide banner "${slide.title}"?`)) {
    SLIDES = SLIDES.filter(s => s.id !== id);
    saveSlidesToStorage();
    showToast("Slide banner deleted.", "error");

    renderHeroSlideshow();
    initHeroSlideshow();
    renderAdminSlidesTable();
  }
}

// Render orders table in Owner Dashboard — MongoDB only
async function renderAdminOrdersTable() {
  elements.adminOrdersTableBody.innerHTML = `
    <tr>
      <td colspan="8" style="text-align: center; padding: 24px; color: var(--light-brown);">
        Loading orders...
      </td>
    </tr>
  `;

  try {
    const mongoResult = await apiGetAllOrders();
    const orders = (mongoResult.orders || []).map(o => ({
      orderId: o._id,
      createdAt: o.createdAt,
      customerName: o.user?.name || "Customer",
      customerEmail: o.user?.email || "-",
      customerPhone: o.shippingAddress?.phone || "-",
      items: o.items || [],
      totalAmount: o.totalAmount || 0,
      paymentStatus: o.paymentStatus === "paid" ? "Paid" : (o.paymentStatus || "Pending"),
      status: o.status || "pending"
    }));

    if (orders.length === 0) {
      elements.adminOrdersTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 24px; color: var(--light-brown);">
            No orders have been placed yet.
          </td>
        </tr>
      `;
      return;
    }

    elements.adminOrdersTableBody.innerHTML = orders.map(order => {
      const date = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
      const itemsHtml = order.items.map(item => `${item.name} (x${item.quantity})`).join("<br>");
      const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];
      const displayStatus = (order.status || "pending").toLowerCase();
      const dropdownOptions = statusOptions.map(opt =>
        `<option value="${opt}" ${displayStatus === opt ? "selected" : ""}>${opt.charAt(0).toUpperCase() + opt.slice(1)}</option>`
      ).join("");

      return `
        <tr style="border-bottom: 1px solid rgba(93, 64, 55, 0.05);">
          <td style="padding: 12px; font-weight: 700; color: var(--dark-brown); font-size: 0.8rem; word-break: break-all;">${order.orderId}</td>
          <td style="padding: 12px; font-size: 0.85rem; color: var(--light-brown); white-space: nowrap;">${date}</td>
          <td style="padding: 12px; font-size: 0.85rem; color: var(--light-brown);">
            <strong>Name:</strong> ${order.customerName}<br>
            <strong>Email:</strong> ${order.customerEmail}<br>
            <strong>Phone:</strong> ${order.customerPhone}
          </td>
          <td style="padding: 12px; font-size: 0.85rem; color: var(--dark-brown); max-width: 250px;">${itemsHtml}</td>
          <td style="padding: 12px; font-weight: 700; color: var(--dark-brown);">₹${order.totalAmount.toLocaleString('en-IN')}</td>
          <td style="padding: 12px; font-size: 0.85rem; color: ${order.paymentStatus === 'Paid' ? 'green' : 'var(--dark-brown)'}; font-weight: 700;">${order.paymentStatus}</td>
          <td style="padding: 12px; font-size: 0.85rem; color: var(--light-brown);">TBD</td>
          <td style="padding: 12px; text-align: center;">
            <select class="admin-stock-badge" style="height: auto; padding: 6px 12px; border-radius: var(--border-radius-sm); font-family: var(--font-body); font-size: 0.85rem; cursor: pointer; outline: none; border: 1.5px solid var(--cream);"
                    onchange="changeOrderStatus('${order.orderId}', this.value)">
              ${dropdownOptions}
            </select>
          </td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    elements.adminOrdersTableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 24px; color: var(--accent-red); font-weight: 700;">
          Failed to load orders: ${err.message}
        </td>
      </tr>
    `;
  }
}

// Global order status change handler — MongoDB only
async function changeOrderStatus(orderId, newStatus) {
  try {
    await apiUpdateOrderStatus(orderId, newStatus);
    showToast(`Order updated to: ${newStatus}`, "success");
  } catch (err) {
    showToast("Failed to update status: " + err.message, "error");
  }
}

// Render customer order history — MongoDB only
async function renderCustomerOrders() {
  if (!getJwt()) {
    showToast("Please log in to view your orders.", "error");
    return;
  }

  elements.customerOrdersTableBody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; padding: 24px; color: var(--light-brown);">
        Loading your order history...
      </td>
    </tr>
  `;

  try {
    const mongoResult = await apiGetMyOrders();
    const orders = (mongoResult.orders || []).map(o => ({
      orderId: o._id,
      createdAt: o.createdAt,
      items: o.items || [],
      totalAmount: o.totalAmount || 0,
      paymentStatus: o.paymentStatus === "paid" ? "Paid" : (o.paymentStatus || "Pending"),
      status: o.status || "pending",
      shippingAddress: o.shippingAddress || null
    }));

    if (orders.length === 0) {
      elements.customerOrdersTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 24px; color: var(--light-brown);">
            You haven't placed any orders yet. Start shopping! 🛍️
          </td>
        </tr>
      `;
      return;
    }

    elements.customerOrdersTableBody.innerHTML = orders.map(order => {
      const date = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : order.createdDate?.seconds ? new Date(order.createdDate.seconds * 1000).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
      const itemsHtml = (order.items || []).map(item => `${item.name} (x${item.quantity})`).join("<br>");
      
      const addressHtml = order.shippingAddress 
        ? `${order.shippingAddress.fullName || '-'}<br>${order.shippingAddress.phone || '-'}<br>${order.shippingAddress.addressLine1 || '-'}`
        : "-";
        
      const displayStatus = (order.status || "pending");
      let statusColor = "var(--light-brown)";
      if (["shipped", "Shipped"].includes(displayStatus)) statusColor = "orange";
      if (["delivered", "Delivered"].includes(displayStatus)) statusColor = "green";
      if (["cancelled", "Cancelled"].includes(displayStatus)) statusColor = "var(--accent-red)";

      return `
        <tr style="border-bottom: 1px solid rgba(93, 64, 55, 0.05);">
          <td style="padding: 12px; font-weight: 700; color: var(--dark-brown); font-size: 0.8rem; word-break: break-all;">
            ${order.orderId}
          </td>
          <td style="padding: 12px; font-size: 0.85rem; color: var(--light-brown); white-space: nowrap;">
            ${date}
          </td>
          <td style="padding: 12px; font-size: 0.85rem; color: var(--dark-brown); max-width: 250px;">
            ${itemsHtml}
          </td>
          <td style="padding: 12px; font-size: 0.85rem; color: var(--light-brown); max-width: 200px;">
            ${addressHtml}
          </td>
          <td style="padding: 12px; font-weight: 700; color: var(--dark-brown);">
            ₹${(order.totalAmount || 0).toLocaleString('en-IN')}
          </td>
          <td style="padding: 12px; font-size: 0.85rem; color: ${order.paymentStatus === 'Paid' ? 'green' : 'var(--dark-brown)'}; font-weight: 700;">
            ${order.paymentStatus || 'Pending'}
          </td>
          <td style="padding: 12px; font-size: 0.85rem; color: var(--light-brown); white-space: nowrap;">
            TBD
          </td>
          <td style="padding: 12px; text-align: center; font-weight: 700; color: ${statusColor}; font-size: 0.85rem; text-transform: capitalize;">
            ${displayStatus}
          </td>
        </tr>
      `;
    }).join("");
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    elements.customerOrdersTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 24px; color: var(--accent-red); font-weight: 700;">
          Failed to load orders: ${error.message}
        </td>
      </tr>
    `;
  }
}

// ==========================================
// ADMIN CATEGORIES MANAGEMENT
// ==========================================

let adminCategories = [];
let editingCategoryId = null;
let editingSubcategoryId = null;

async function renderAdminCategoriesTable() {
  if (!getJwt()) return;
  
  elements.adminCategoriesList.innerHTML = `<div style="padding: 20px; text-align: center;">Loading categories...</div>`;
  
  try {
    const res = await apiGetAllCategoriesAdmin();
    adminCategories = res.data || [];
    
    if (adminCategories.length === 0) {
      elements.adminCategoriesList.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--light-brown);">No categories found. Click 'Add Category' to create one.</div>`;
      return;
    }
    
    let html = '';
    
    adminCategories.forEach(cat => {
      // Category Header Card
      html += `
        <div class="admin-category-card" draggable="true" data-id="${cat._id}" style="cursor: grab; background: white; border-radius: var(--border-radius-md); border: 2px solid ${cat.isActive ? 'var(--soft-yellow)' : '#ddd'}; box-shadow: var(--shadow-sm); overflow: hidden; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background-color: ${cat.isActive ? '#fffdf7' : '#f5f5f5'}; border-bottom: 1px solid rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 8px; background-color: var(--cream); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                ${cat.icon || '📁'}
              </div>
              <div>
                <h4 style="margin: 0; font-size: 1.1rem; color: ${cat.isActive ? 'var(--dark-brown)' : '#999'};">${cat.name} ${cat.featured ? '⭐' : ''} ${cat.showOnHome ? '🏠' : ''}</h4>
                <p style="margin: 2px 0 0; font-size: 0.8rem; color: var(--light-brown);">${cat.slug} | Order: ${cat.order} | Products: ${cat.productCount || 0}</p>
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-add-subcat" data-id="${cat._id}" style="padding: 6px 12px; font-size: 0.8rem;">+ Subcategory</button>
              <button class="btn btn-secondary btn-edit-cat" data-id="${cat._id}" style="padding: 6px 12px; font-size: 0.8rem;">Edit</button>
              <button class="btn btn-secondary btn-delete-cat" data-id="${cat._id}" style="padding: 6px 12px; font-size: 0.8rem; background-color: #ffebee; color: var(--accent-red); border-color: #ffcdd2;">Delete</button>
            </div>
          </div>
          
          <!-- Subcategories List -->
          <div style="padding: 12px 20px 12px 40px; background-color: white;">
            ${(!cat.subcategories || cat.subcategories.length === 0) ? 
              `<div style="font-size: 0.85rem; color: #999; font-style: italic;">No subcategories added yet.</div>` : 
              `<table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                <tbody>
                  ${cat.subcategories.map(sub => `
                    <tr class="admin-subcategory-row" draggable="true" data-id="${sub._id}" data-catid="${cat._id}" style="border-bottom: 1px solid #f0f0f0; cursor: grab;">
                      <td style="padding: 8px; width: 40px; color: #ccc;">↳</td>
                      <td style="padding: 8px; font-weight: 600; color: ${sub.isActive ? 'var(--dark-brown)' : '#aaa'};">${sub.name}</td>
                      <td style="padding: 8px; font-size: 0.8rem; color: var(--light-brown);">Order: ${sub.order}</td>
                      <td style="padding: 8px; font-size: 0.8rem; color: var(--light-brown);">Products: ${sub.productCount || 0}</td>
                      <td style="padding: 8px; text-align: right;">
                        <button class="btn-icon btn-edit-subcat" data-id="${sub._id}" data-catid="${cat._id}" style="border: none; background: none; cursor: pointer; color: var(--primary);">✏️</button>
                        <button class="btn-icon btn-delete-subcat" data-id="${sub._id}" data-catid="${cat._id}" style="border: none; background: none; cursor: pointer; color: var(--accent-red);">🗑️</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>`
            }
          </div>
        </div>
      `;
    });
    
    elements.adminCategoriesList.innerHTML = html;
    
    // Attach event listeners
    document.querySelectorAll('.btn-edit-cat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openEditCategoryForm(id);
      });
    });
    
    document.querySelectorAll('.btn-delete-cat').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm("Are you sure you want to delete this category? This will also delete all its subcategories.")) {
          try {
            await apiDeleteCategory(id);
            showToast("Category deleted successfully", "success");
            renderAdminCategoriesTable();
            populateCategoryDropdowns();
          } catch (err) {
            showToast(err.message, "error");
          }
        }
      });
    });
    
    document.querySelectorAll('.btn-add-subcat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const catId = e.target.getAttribute('data-id');
        openAddSubcategoryForm(catId);
      });
    });
    
    document.querySelectorAll('.btn-edit-subcat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const catId = e.target.getAttribute('data-catid');
        openEditSubcategoryForm(id, catId);
      });
    });
    
    document.querySelectorAll('.btn-delete-subcat').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm("Are you sure you want to delete this subcategory?")) {
          try {
            await apiDeleteSubcategory(id);
            showToast("Subcategory deleted successfully", "success");
            renderAdminCategoriesTable();
          } catch (err) {
            showToast(err.message, "error");
          }
        }
      });
    });
    
    // Setup Drag and Drop for Categories
    setupCategoryDragAndDrop();
    // Setup Drag and Drop for Subcategories
    setupSubcategoryDragAndDrop();
    
  } catch (error) {
    console.error("Error fetching categories:", error);
    elements.adminCategoriesList.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--accent-red);">Failed to load categories.</div>`;
  }
}

// Drag & Drop for category cards
function setupCategoryDragAndDrop() {
  let draggedCard = null;
  const cards = document.querySelectorAll('.admin-category-card');
  cards.forEach(card => {
    card.addEventListener('dragstart', function(e) {
      draggedCard = this;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
      setTimeout(() => this.style.opacity = '0.4', 0);
    });
    card.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.style.borderTop = '3px solid var(--primary)';
    });
    card.addEventListener('dragleave', function() {
      this.style.borderTop = '';
    });
    card.addEventListener('drop', async function(e) {
      e.stopPropagation();
      this.style.borderTop = '';
      if (draggedCard && draggedCard !== this) {
        const parent = this.parentNode;
        const allCards = Array.from(parent.querySelectorAll('.admin-category-card'));
        const di = allCards.indexOf(draggedCard);
        const ti = allCards.indexOf(this);
        if (di < ti) parent.insertBefore(draggedCard, this.nextSibling);
        else parent.insertBefore(draggedCard, this);
        const ids = Array.from(parent.querySelectorAll('.admin-category-card')).map(c => c.getAttribute('data-id'));
        try {
          await apiReorderCategories(ids);
          showToast('Categories reordered', 'success');
        } catch(err) {
          showToast('Failed to reorder', 'error');
          renderAdminCategoriesTable();
        }
      }
    });
    card.addEventListener('dragend', function() {
      this.style.opacity = '1';
      cards.forEach(c => c.style.borderTop = '');
    });
  });
}

// Drag & Drop for subcategory rows
function setupSubcategoryDragAndDrop() {
  let draggedRow = null;
  const rows = document.querySelectorAll('.admin-subcategory-row');
  rows.forEach(row => {
    row.addEventListener('dragstart', function(e) {
      draggedRow = this;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
      setTimeout(() => this.style.opacity = '0.4', 0);
    });
    row.addEventListener('dragover', function(e) {
      e.preventDefault();
      if (draggedRow && draggedRow.getAttribute('data-catid') === this.getAttribute('data-catid')) {
        this.style.borderTop = '2px solid var(--primary)';
      }
    });
    row.addEventListener('dragleave', function() {
      this.style.borderTop = '';
    });
    row.addEventListener('drop', async function(e) {
      e.stopPropagation();
      this.style.borderTop = '';
      if (draggedRow && draggedRow !== this && draggedRow.getAttribute('data-catid') === this.getAttribute('data-catid')) {
        const tbody = this.parentNode;
        const allRows = Array.from(tbody.querySelectorAll('.admin-subcategory-row'));
        const di = allRows.indexOf(draggedRow);
        const ti = allRows.indexOf(this);
        if (di < ti) tbody.insertBefore(draggedRow, this.nextSibling);
        else tbody.insertBefore(draggedRow, this);
        const ids = Array.from(tbody.querySelectorAll('.admin-subcategory-row')).map(r => r.getAttribute('data-id'));
        try {
          await apiReorderSubcategories(ids);
          showToast('Subcategories reordered', 'success');
        } catch(err) {
          showToast('Failed to reorder', 'error');
          renderAdminCategoriesTable();
        }
      }
    });
    row.addEventListener('dragend', function() {
      this.style.opacity = '1';
      rows.forEach(r => r.style.borderTop = '');
    });
  });
}

// Category Form Handling
elements.addNewCategoryBtn.addEventListener('click', () => {
  elements.categoryManageForm.reset();
  elements.editCategoryId.value = "";
  elements.categoryFormPanel.style.display = "block";
  elements.subcategoryFormPanel.style.display = "none";
  elements.addNewCategoryBtn.style.display = "none";
  document.getElementById("catFormPanelTitle").textContent = "Add New Category";
  
  // Set default checkbox values
  document.getElementById("catShowOnHome").checked = true;
  document.getElementById("catIsActive").checked = true;
  document.getElementById("catFeatured").checked = false;
});

elements.cancelCatFormBtn.addEventListener('click', () => {
  elements.categoryFormPanel.style.display = "none";
  elements.addNewCategoryBtn.style.display = "block";
});

function openEditCategoryForm(id) {
  const cat = adminCategories.find(c => c._id === id);
  if (!cat) return;
  
  elements.categoryManageForm.reset();
  elements.editCategoryId.value = cat._id;
  document.getElementById("catName").value = cat.name || "";
  document.getElementById("catIcon").value = cat.icon || "";
  document.getElementById("catImage").value = cat.image || "";
  document.getElementById("catBannerImage").value = cat.bannerImage || "";
  document.getElementById("catDescription").value = cat.description || "";
  document.getElementById("catMetaTitle").value = cat.metaTitle || "";
  document.getElementById("catMetaDescription").value = cat.metaDescription || "";
  
  document.getElementById("catFeatured").checked = cat.featured || false;
  document.getElementById("catShowOnHome").checked = cat.showOnHome !== false;
  document.getElementById("catIsActive").checked = cat.isActive !== false;
  
  elements.categoryFormPanel.style.display = "block";
  elements.subcategoryFormPanel.style.display = "none";
  elements.addNewCategoryBtn.style.display = "none";
  document.getElementById("catFormPanelTitle").textContent = "Edit Category";
}

elements.categoryManageForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = elements.editCategoryId.value;
  const data = {
    name: document.getElementById("catName").value,
    icon: document.getElementById("catIcon").value,
    image: document.getElementById("catImage").value,
    bannerImage: document.getElementById("catBannerImage").value,
    description: document.getElementById("catDescription").value,
    metaTitle: document.getElementById("catMetaTitle").value,
    metaDescription: document.getElementById("catMetaDescription").value,
    featured: document.getElementById("catFeatured").checked,
    showOnHome: document.getElementById("catShowOnHome").checked,
    isActive: document.getElementById("catIsActive").checked,
  };
  
  try {
    if (id) {
      await apiUpdateCategory(id, data);
      showToast("Category updated successfully", "success");
    } else {
      await apiCreateCategory(data);
      showToast("Category created successfully", "success");
    }
    elements.categoryFormPanel.style.display = "none";
    elements.addNewCategoryBtn.style.display = "block";
    renderAdminCategoriesTable();
    populateCategoryDropdowns();
  } catch (err) {
    showToast(err.message, "error");
  }
});

// Subcategory Form Handling
function openAddSubcategoryForm(categoryId) {
  elements.subcategoryManageForm.reset();
  elements.editSubcategoryId.value = "";
  elements.subcatParentId.value = categoryId;
  
  elements.subcategoryFormPanel.style.display = "block";
  elements.categoryFormPanel.style.display = "none";
  elements.addNewCategoryBtn.style.display = "none";
  document.getElementById("subcatFormPanelTitle").textContent = "Add New Subcategory";
  
  document.getElementById("subcatIsActive").checked = true;
}

function openEditSubcategoryForm(subId, catId) {
  const cat = adminCategories.find(c => c._id === catId);
  if (!cat) return;
  const sub = cat.subcategories.find(s => s._id === subId);
  if (!sub) return;
  
  elements.subcategoryManageForm.reset();
  elements.editSubcategoryId.value = sub._id;
  elements.subcatParentId.value = catId;
  
  document.getElementById("subcatName").value = sub.name || "";
  document.getElementById("subcatImage").value = sub.image || "";
  document.getElementById("subcatDescription").value = sub.description || "";
  document.getElementById("subcatIsActive").checked = sub.isActive !== false;
  
  elements.subcategoryFormPanel.style.display = "block";
  elements.categoryFormPanel.style.display = "none";
  elements.addNewCategoryBtn.style.display = "none";
  document.getElementById("subcatFormPanelTitle").textContent = "Edit Subcategory";
}

elements.cancelSubcatFormBtn.addEventListener('click', () => {
  elements.subcategoryFormPanel.style.display = "none";
  elements.addNewCategoryBtn.style.display = "block";
});

elements.subcategoryManageForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = elements.editSubcategoryId.value;
  const data = {
    categoryId: elements.subcatParentId.value,
    name: document.getElementById("subcatName").value,
    image: document.getElementById("subcatImage").value,
    description: document.getElementById("subcatDescription").value,
    isActive: document.getElementById("subcatIsActive").checked,
  };
  
  try {
    if (id) {
      await apiUpdateSubcategory(id, data);
      showToast("Subcategory updated successfully", "success");
    } else {
      await apiCreateSubcategory(data);
      showToast("Subcategory created successfully", "success");
    }
    elements.subcategoryFormPanel.style.display = "none";
    elements.addNewCategoryBtn.style.display = "block";
    renderAdminCategoriesTable();
  } catch (err) {
    showToast(err.message, "error");
  }
});

// Update product form to use new categories
async function populateCategoryDropdowns() {
  try {
    const res = await apiGetCategories();
    const categories = res.data || [];
    
    // Update Add/Edit Product Dropdown
    const prodCatSelect = document.getElementById("prodCategory");
    if (prodCatSelect) {
      let optionsHtml = '<option value="" disabled selected>Select Category</option>';
      categories.forEach(cat => {
        optionsHtml += `<optgroup label="${cat.name}">`;
        if (cat.subcategories && cat.subcategories.length > 0) {
          cat.subcategories.forEach(sub => {
            optionsHtml += `<option value="${cat._id}|${sub._id}">${cat.name} > ${sub.name}</option>`;
          });
        } else {
          optionsHtml += `<option value="${cat._id}|">-- ${cat.name} (No subcategories) --</option>`;
        }
        optionsHtml += `</optgroup>`;
      });
      prodCatSelect.innerHTML = optionsHtml;
    }
    
  } catch (err) {
    console.error("Failed to load categories for dropdown", err);
  }
}

// Override openOwnerDashboard to load categories table too
const _originalOpenOwnerDashboard = openOwnerDashboard;
openOwnerDashboard = function() {
  _originalOpenOwnerDashboard();
  renderAdminCategoriesTable();
  populateCategoryDropdowns();
};
