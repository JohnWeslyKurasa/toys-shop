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
} from "./api.js";

// Default product database in Indian Rupees (₹) with ageGroup properties
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Premium Stacking Wooden Toy Blocks",
    price: 1299,
    originalPrice: 1999,
    category: "Baby Toys",
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
    image: "https://images.unsplash.com/photo-1522850959076-58d7c04db972?q=80&w=400",
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
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=400",
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
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400",
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
    image: "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=400",
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
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=400",
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
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=400",
    description: "Playful wooden block clock with sorted numeric shape pieces. Helps kids learn geometric shapes, colors, and telling time.",
    rating: 4.7,
    inStock: true,
    isNew: false,
    isSale: false,
    ageGroup: "3-6"
  },
  {
    id: 10,
    name: "First Steps Activity Baby Walker",
    price: 2999,
    originalPrice: 3999,
    category: "Baby Walkers",
    image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=400",
    description: "Stable wooden walker equipped with speed-control wheels, play gears, xylophone, and bead sliders. Encourages balance and motor skills.",
    rating: 4.9,
    inStock: true,
    isNew: true,
    isSale: true,
    ageGroup: "1-3"
  },
  {
    id: 11,
    name: "Interactive Baby Board Story Book Set",
    price: 699,
    originalPrice: 999,
    category: "Baby Story Books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400",
    description: "Includes three sensory lift-the-flap books with textures and high-contrast illustrations. Perfect for cuddling and early visual learning.",
    rating: 4.8,
    inStock: true,
    isNew: false,
    isSale: false,
    ageGroup: "0-1"
  },
  {
    id: 12,
    name: "Multi-Pocket Diaper Bag & Handbag",
    price: 1999,
    originalPrice: 2499,
    category: "Handbags",
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=400",
    description: "Stylish, premium multi-pocket canvas handbag. Includes insulated bottle slots, a waterproof diaper changing mat, and stroller hooks.",
    rating: 4.8,
    inStock: true,
    isNew: true,
    isSale: false,
    ageGroup: "All"
  },
  {
    id: 13,
    name: "Flowy Floral Maternity Maxi Dress",
    price: 1899,
    originalPrice: 2299,
    category: "Maternity Wear",
    image: "https://images.unsplash.com/photo-1572436224559-c143d229f394?q=80&w=400",
    description: "Elastic waist maternity dress made of light floral chiffon. Perfect for baby showers, maternal photo shoots, or casual summer walks.",
    rating: 4.6,
    inStock: true,
    isNew: false,
    isSale: false,
    ageGroup: "All"
  },
  {
    id: 14,
    name: "Pastel Balloon Birthday Decoration Kit",
    price: 599,
    originalPrice: 899,
    category: "Birthday Decorations",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=400",
    description: "A complete party kit containing 60 pastel biodegradable latex balloons, ribbon garland strings, 'Happy Birthday' banner, and a balloon pump.",
    rating: 4.5,
    inStock: true,
    isNew: false,
    isSale: true,
    ageGroup: "All"
  },
  {
    id: 15,
    name: "Duckling Yellow Kids Safety Umbrella",
    price: 499,
    originalPrice: 699,
    category: "Umbrella",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400",
    description: "Lightweight kid-sized umbrella with soft rounded safety tips and a cute duck beak handle. Easy pinch-free manual open mechanism.",
    rating: 4.7,
    inStock: true,
    isNew: false,
    isSale: false,
    ageGroup: "3-6"
  },
  {
    id: 16,
    name: "Natural Beechwood Animal Teething Toy",
    price: 399,
    originalPrice: 599,
    category: "Baby Toys",
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
    category: "Bags & Backpacks",
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

// Load products from LocalStorage or fallback to default list
let PRODUCTS = JSON.parse(localStorage.getItem("mt_products")) || DEFAULT_PRODUCTS;
if (PRODUCTS.length < DEFAULT_PRODUCTS.length) {
  PRODUCTS = DEFAULT_PRODUCTS;
  localStorage.setItem("mt_products", JSON.stringify(PRODUCTS));
}

const saveProductsToStorage = () => {
  localStorage.setItem("mt_products", JSON.stringify(PRODUCTS));
};

// Default slideshow banners database with animations matching content
const DEFAULT_SLIDES = [
  {
    id: 1,
    badgeText: "SPECIAL FESTIVAL OFFER",
    badgeStyle: "yellow",
    title: "Toxin-Free Wooden Toys starting at ₹499",
    subtitle: "Foster tactile learning, logic, and early motor skills with certified organic wooden stacking blocks and clocks.",
    bgStyle: "yellow",
    illustration: "baby-playing",
    imageUrl: "",
    ctaText: "Shop Toys Now",
    ctaCategory: "Baby Toys"
  },
  {
    id: 2,
    badgeText: "SEASONAL CLEARANCE",
    badgeStyle: "red",
    title: "Soft Organic Cotton Wear — Flat 30% Off",
    subtitle: "Keep your little one cozy and cool in hypoallergenic, breathable ruffle dresses and swaddle basics.",
    bgStyle: "pink",
    illustration: "mother-holding",
    imageUrl: "",
    ctaText: "Explore Outfits",
    ctaCategory: "Baby Dresses"
  },
  {
    id: 3,
    badgeText: "NEW ARRIVALS",
    badgeStyle: "blue",
    title: "Safe BPA-Free Trainer Feeding Cups",
    subtitle: "Leak-proof, easy-to-hold silicone straw trainer cups designed for your baby's comfortable transition.",
    bgStyle: "blue",
    illustration: "baby-crawling",
    imageUrl: "",
    ctaText: "Shop Feeding Care",
    ctaCategory: "Feeding Accessories"
  }
];

// Load slides from LocalStorage or fallback to default
let SLIDES = JSON.parse(localStorage.getItem("mt_slides")) || DEFAULT_SLIDES;

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
function renderLoggedInUI(displayName) {
  setNotificationAuthToken(getJwt());
  const section = document.getElementById("userAuthSection");
  if (!section) return;
  section.innerHTML = `
    <span style="color: var(--dark-brown); margin-right: 8px;">Hi, ${displayName}!</span>
    <a href="#" id="myOrdersBtn" style="color: var(--light-brown); text-decoration: none; font-weight: 700; margin-right: 12px; border-right: 1.5px solid rgba(93, 64, 55, 0.15); padding-right: 12px;">My Orders</a>
    <a href="#" id="userLogoutBtn" style="color: var(--accent-red); text-decoration: none;">Logout</a>
  `;
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
  addNewSlideBtn: document.getElementById("addNewSlideBtn"),
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
  prodStock: document.getElementById("prodStock"),
  prodDesc: document.getElementById("prodDesc"),
  prodIsNew: document.getElementById("prodIsNew"),
  prodIsSale: document.getElementById("prodIsSale"),
  cancelFormBtn: document.getElementById("cancelFormBtn"),
  adminProductsTableBody: document.getElementById("adminProductsTableBody"),
  
  // Dashboard Tabs & sections
  tabManageProducts: document.getElementById("tabManageProducts"),
  tabManageSlides: document.getElementById("tabManageSlides"),
  productsDashboardSection: document.getElementById("productsDashboardSection"),
  slidesDashboardSection: document.getElementById("slidesDashboardSection"),
  slideFormPanel: document.getElementById("slideFormPanel"),
  slideFormPanelTitle: document.getElementById("slideFormPanelTitle"),
  slideManageForm: document.getElementById("slideManageForm"),
  editSlideId: document.getElementById("editSlideId"),
  slideTitleInput: document.getElementById("slideTitleInput"),
  slideBadgeTextInput: document.getElementById("slideBadgeTextInput"),
  slideBadgeStyleInput: document.getElementById("slideBadgeStyleInput"),
  slideBgStyleInput: document.getElementById("slideBgStyleInput"),
  slideIllustrationInput: document.getElementById("slideIllustrationInput"),
  slideImageUrlGroup: document.getElementById("slideImageUrlGroup"),
  slideImageUrlInput: document.getElementById("slideImageUrlInput"),
  slideCtaTextInput: document.getElementById("slideCtaTextInput"),
  slideCtaCategoryInput: document.getElementById("slideCtaCategoryInput"),
  slideSubtitleInput: document.getElementById("slideSubtitleInput"),
  cancelSlideFormBtn: document.getElementById("cancelSlideFormBtn"),
  adminSlidesTableBody: document.getElementById("adminSlidesTableBody"),

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
  payMethodCard: document.getElementById("payMethodCard"),
  payMethodUpi: document.getElementById("payMethodUpi"),
  payMethodCod: document.getElementById("payMethodCod"),
  cardInputs: document.getElementById("cardInputs"),
  upiInputs: document.getElementById("upiInputs"),
  codInfo: document.getElementById("codInfo"),
  checkoutSummaryItems: document.getElementById("checkoutSummaryItems"),
  checkoutSubtotalSection: document.getElementById("checkoutSubtotal"),
  checkoutShippingSection: document.getElementById("checkoutShipping"),
  checkoutTaxSection: document.getElementById("checkoutTax"),
  checkoutGrandTotalSection: document.getElementById("checkoutGrandTotal"),
  checkoutPayBtn: document.getElementById("checkoutPayBtn"),
  cardNumber: document.getElementById("cardNumber"),
  cardExpiry: document.getElementById("cardExpiry"),
  cardCvv: document.getElementById("cardCvv"),
  upiId: document.getElementById("upiId")
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
  "Baby Essentials", "Baby Dresses", "Baby Basics", "Newborn Baby Kits", "Baby Footwear", "Baby Cosmetics", "Baby Grooming Products",
  "Feeding & Care", "Feeding Accessories", "Feeding Pillows", "Feeding Bras",
  "Toys & Entertainment", "Baby Toys", "Educational Toys", "Remote Control Cars", "Age-wise Games (0–10 Years)",
  "Mobility", "Baby Walkers", "Baby Scooters",
  "Books & Learning", "Baby Story Books", "Children's Comics", "Diary Notes",
  "Women's Section", "Handbags", "Maternity Wear", "Feeding Nightwear", "Shapewear",
  "Special Products", "Birthday Decorations", "Baby Height Meter", "Umbrella"
];

// Category Details structure with icons & background colors for styling
const CATEGORY_DETAILS = {
  "Baby Essentials": [
    { name: "Baby Dresses", icon: "", color: "#FFF3E0" },
    { name: "Baby Basics", icon: "", color: "#E0F2F1" },
    { name: "Newborn Baby Kits", icon: "", color: "#F3E5F5" },
    { name: "Baby Footwear", icon: "", color: "#E8F5E9" },
    { name: "Baby Cosmetics", icon: "", color: "#E1F5FE" },
    { name: "Baby Grooming Products", icon: "", color: "#FFFDE7" }
  ],
  "Feeding & Care": [
    { name: "Feeding Accessories", icon: "", color: "#E0F7FA" },
    { name: "Feeding Pillows", icon: "", color: "#FFF8E1" },
    { name: "Feeding Bras", icon: "", color: "#FFEBEE" }
  ],
  "Toys & Entertainment": [
    { name: "Baby Toys", icon: "", color: "#FFFDE7" },
    { name: "Educational Toys", icon: "", color: "#E0F2F1" },
    { name: "Remote Control Cars", icon: "", color: "#E8F5E9" },
    { name: "Age-wise Games (0–10 Years)", icon: "", color: "#F3E5F5" }
  ],
  "Mobility & Books": [
    { name: "Baby Walkers", icon: "", color: "#E1F5FE" },
    { name: "Baby Scooters", icon: "", color: "#FFF3E0" },
    { name: "Baby Story Books", icon: "", color: "#FFF8E1" },
    { name: "Children's Comics", icon: "", color: "#E0F7FA" },
    { name: "Diary Notes", icon: "", color: "#E8F5E9" }
  ],
  "Moms & Special Collections": [
    { name: "Handbags", icon: "", color: "#F3E5F5" },
    { name: "Maternity Wear", icon: "", color: "#FFEBEE" },
    { name: "Feeding Nightwear", icon: "", color: "#FFFDE7" },
    { name: "Shapewear", icon: "", color: "#E0F2F1" },
    { name: "Birthday Decorations", icon: "", color: "#FFF3E0" },
    { name: "Baby Height Meter", icon: "", color: "#E1F5FE" },
    { name: "Umbrella", icon: "", color: "#E8F5E9" }
  ]
};

// Initialize Application
window.addEventListener("DOMContentLoaded", () => {
  // 1. Hide Loader
  setTimeout(() => {
    elements.loader.style.opacity = "0";
    elements.loader.style.visibility = "hidden";
  }, 600);

  // Initialize Notifications
  initNotifications();

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
    renderLoggedInUI(mongoUser.name || mongoUser.email || "Parent");
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

  // 8. Initialize interactive cursor sparkle trail
  initCursorTrail();

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

// Interactive Cursor Sparkle Trail Manager
function initCursorTrail() {
  let lastMousePos = { x: 0, y: 0 };

  // Mousemove sparkle generation disabled as requested
  // window.addEventListener("mousemove", (e) => { ... });

  window.addEventListener("click", (e) => {
    // Generate burst of sparkles on click
    for (let i = 0; i < 12; i++) {
      createSparkle(e.pageX, e.pageY, true);
    }
  });
}

function createSparkle(x, y, isBurst) {
  const particle = document.createElement("div");
  particle.className = "sparkle-particle";
  
  if (Math.random() > 0.5) {
    particle.classList.add("star-particle");
  }
  if (isBurst) {
    particle.classList.add("click-burst");
  }

  // Soft warm theme accents (yellow, orange, pink, cyan, green)
  const colors = ["#FFEB3B", "#FF9100", "#FF4081", "#00E5FF", "#00E676"];
  particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

  const size = isBurst ? Math.random() * 12 + 6 : Math.random() * 8 + 4;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;

  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;

  if (isBurst) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 80 + 35;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    particle.animate([
      { transform: `translate(-50%, -50%) translate(0px, 0px) scale(1)`, opacity: 1 },
      { transform: `translate(-50%, -50%) translate(${vx}px, ${vy}px) scale(0.1)`, opacity: 0 }
    ], {
      duration: 600,
      easing: "cubic-bezier(0.1, 0.8, 0.3, 1)",
      fill: "forwards"
    });
  }

  document.body.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, isBurst ? 600 : 800);
}

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

  // Payment Method Pill Switcher
  const selectPaymentMethod = (method) => {
    selectedPaymentMethod = method;
    
    // Toggle active classes on pills
    elements.payMethodCard.classList.toggle("active", method === "card");
    elements.payMethodUpi.classList.toggle("active", method === "upi");
    elements.payMethodCod.classList.toggle("active", method === "cod");
    
    // Set active styles (borders & opacity)
    elements.payMethodCard.style.borderColor = method === "card" ? "var(--dark-brown)" : "transparent";
    elements.payMethodCard.style.opacity = method === "card" ? "1" : "0.6";
    
    elements.payMethodUpi.style.borderColor = method === "upi" ? "var(--dark-brown)" : "transparent";
    elements.payMethodUpi.style.opacity = method === "upi" ? "1" : "0.6";
    
    elements.payMethodCod.style.borderColor = method === "cod" ? "var(--dark-brown)" : "transparent";
    elements.payMethodCod.style.opacity = method === "cod" ? "1" : "0.6";
    
    // Toggle inputs visibility
    elements.cardInputs.style.display = method === "card" ? "flex" : "none";
    elements.upiInputs.style.display = method === "upi" ? "flex" : "none";
    elements.codInfo.style.display = method === "cod" ? "block" : "none";
    
    // Update Pay Button text dynamically
    if (method === "cod") {
      elements.checkoutPayBtn.innerHTML = `Complete COD Order`;
    } else if (method === "upi") {
      elements.checkoutPayBtn.innerHTML = `Pay with UPI & Order`;
    } else {
      elements.checkoutPayBtn.innerHTML = `Complete Payment & Order`;
    }
  };
  
  elements.payMethodCard.addEventListener("click", () => selectPaymentMethod("card"));
  elements.payMethodUpi.addEventListener("click", () => selectPaymentMethod("upi"));
  elements.payMethodCod.addEventListener("click", () => selectPaymentMethod("cod"));

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

  // Dashboard Add/Edit Form submit handler
  elements.productManageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const id = elements.editProductId.value;
    const name = elements.prodName.value.trim();
    const category = elements.prodCategory.value;
    const price = parseFloat(elements.prodPrice.value);
    const originalPriceInput = elements.prodOriginalPrice.value;
    const originalPrice = originalPriceInput ? parseFloat(originalPriceInput) : null;
    const image = elements.prodImage.value.trim();
    const inStock = elements.prodStock.value === "true";
    const desc = elements.prodDesc.value.trim();
    const isNew = elements.prodIsNew.checked;
    const isSale = elements.prodIsSale.checked;

    // Deduce age group based on category or default to all
    let ageGroup = "All";
    if (category === "Baby Toys" || category === "Baby Basics" || category === "Baby Story Books" || category === "Newborn Baby Kits") {
      ageGroup = "0-1";
    } else if (category === "Baby Walkers" || category === "Baby Dresses") {
      ageGroup = "1-3";
    } else if (category === "Educational Toys" || category === "Umbrella") {
      ageGroup = "3-6";
    } else if (category === "Remote Control Cars" || category === "Diary Notes" || category === "Age-wise Games (0–10 Years)") {
      ageGroup = "6-10";
    }

    if (id) {
      // Edit mode
      const idx = PRODUCTS.findIndex(p => p.id === parseInt(id));
      if (idx > -1) {
        PRODUCTS[idx] = {
          ...PRODUCTS[idx],
          name, category, price, originalPrice, image, inStock, description: desc, isNew, isSale, ageGroup
        };
        showToast("Product updated successfully!", "success");
      }
    } else {
      // Create mode
      const newId = PRODUCTS.length > 0 ? Math.max(...PRODUCTS.map(p => p.id)) + 1 : 1;
      const newProduct = {
        id: newId,
        name, category, price, originalPrice, image, inStock, description: desc, rating: 5.0, isNew, isSale, ageGroup
      };
      PRODUCTS.unshift(newProduct);
      showToast("New product created successfully!", "success");
    }

    saveProductsToStorage();
    elements.productFormPanel.style.display = "none";
    elements.addNewProductBtn.style.display = "block";
    elements.productManageForm.reset();
    
    // Refresh views
    renderProducts();
    renderAdminProductsTable();
    renderCategoryGroups();
  });

  // Dashboard Tab Switching
  elements.tabManageProducts.addEventListener("click", () => {
    elements.tabManageProducts.classList.add("active");
    elements.tabManageSlides.classList.remove("active");
    elements.tabManageOrders.classList.remove("active");
    if(document.getElementById('tabManageNotifications')) document.getElementById('tabManageNotifications').classList.remove("active");
    elements.productsDashboardSection.style.display = "flex";
    elements.slidesDashboardSection.style.display = "none";
    elements.ordersDashboardSection.style.display = "none";
    if(document.getElementById('notificationsDashboardSection')) document.getElementById('notificationsDashboardSection').style.display = "none";
    elements.addNewProductBtn.style.display = "block";
    elements.addNewSlideBtn.style.display = "none";
    elements.slideFormPanel.style.display = "none";
  });

  elements.tabManageSlides.addEventListener("click", () => {
    elements.tabManageSlides.classList.add("active");
    elements.tabManageProducts.classList.remove("active");
    elements.tabManageOrders.classList.remove("active");
    if(document.getElementById('tabManageNotifications')) document.getElementById('tabManageNotifications').classList.remove("active");
    elements.slidesDashboardSection.style.display = "flex";
    elements.productsDashboardSection.style.display = "none";
    elements.ordersDashboardSection.style.display = "none";
    if(document.getElementById('notificationsDashboardSection')) document.getElementById('notificationsDashboardSection').style.display = "none";
    elements.addNewSlideBtn.style.display = "block";
    elements.addNewProductBtn.style.display = "none";
    elements.productFormPanel.style.display = "none";
    renderAdminSlidesTable();
  });

  elements.tabManageOrders.addEventListener("click", () => {
    elements.tabManageOrders.classList.add("active");
    elements.tabManageProducts.classList.remove("active");
    elements.tabManageSlides.classList.remove("active");
    if(document.getElementById('tabManageNotifications')) document.getElementById('tabManageNotifications').classList.remove("active");
    elements.ordersDashboardSection.style.display = "flex";
    elements.productsDashboardSection.style.display = "none";
    elements.slidesDashboardSection.style.display = "none";
    if(document.getElementById('notificationsDashboardSection')) document.getElementById('notificationsDashboardSection').style.display = "none";
    elements.addNewProductBtn.style.display = "none";
    elements.addNewSlideBtn.style.display = "none";
    elements.productFormPanel.style.display = "none";
    elements.slideFormPanel.style.display = "none";
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

  // Show/hide custom image url field depending on selection
  elements.slideIllustrationInput.addEventListener("change", (e) => {
    if (e.target.value === "custom") {
      elements.slideImageUrlGroup.style.display = "flex";
    } else {
      elements.slideImageUrlGroup.style.display = "none";
    }
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
      imageUrl: elements.slideImageUrlInput.value.trim(),
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

      renderLoggedInUI(user.name || user.email);

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
      renderLoggedInUI(user.name || user.email);
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
        <div class="search-suggestion-item" data-id="${prod.id}">
          <img src="${prod.image}" alt="${prod.name}" class="search-suggest-img">
          <div class="search-suggest-info">
            <span class="search-suggest-title">${prod.name}</span>
            <span class="search-suggest-price">₹${prod.price.toLocaleString('en-IN')}</span>
          </div>
        </div>
      `).join("");
      
      elements.searchSuggestions.querySelectorAll(".search-suggestion-item").forEach(item => {
        item.addEventListener("click", () => {
          const id = parseInt(item.getAttribute("data-id"));
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
      
      // Reset payment method to card default
      selectedPaymentMethod = "card";
      elements.payMethodCard.click(); // Trigger layout update

      // Render Order Summary
      const subtotal = cart.reduce((sum, item) => {
        const prod = PRODUCTS.find(p => p.id === item.productId || p.id === Number(item.productId));
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
        const prod = PRODUCTS.find(p => p.id === item.productId || p.id === Number(item.productId));
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

  // Payment Submission flow
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

    // Helper to reset fields & button state on failure/cancel
    const resetPayBtnState = () => {
      elements.checkoutPayBtn.disabled = false;
      elements.checkoutName.disabled = false;
      elements.checkoutPhone.disabled = false;
      elements.checkoutAddress.disabled = false;
      elements.cardNumber.disabled = false;
      elements.cardExpiry.disabled = false;
      elements.cardCvv.disabled = false;
      elements.upiId.disabled = false;
      elements.payMethodCard.style.pointerEvents = "auto";
      elements.payMethodUpi.style.pointerEvents = "auto";
      elements.payMethodCod.style.pointerEvents = "auto";
      
      if (selectedPaymentMethod === "cod") {
        elements.checkoutPayBtn.innerHTML = `Complete COD Order`;
      } else if (selectedPaymentMethod === "upi") {
        elements.checkoutPayBtn.innerHTML = `Pay with UPI & Order`;
      } else {
        elements.checkoutPayBtn.innerHTML = `Complete Payment & Order`;
      }
    };

    // 3. Calculate total amounts
    const subtotal = cart.reduce((sum, item) => {
      const prod = PRODUCTS.find(p => p.id === item.productId || p.id === Number(item.productId));
      return sum + (prod ? prod.price * item.quantity : 0);
    }, 0);
    const shipping = subtotal > 1500 ? 0 : 99;
    const tax = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + shipping + tax;
    const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // 4. Disable all fields during processing
    elements.checkoutPayBtn.disabled = true;
    elements.checkoutName.disabled = true;
    elements.checkoutPhone.disabled = true;
    elements.checkoutAddress.disabled = true;
    elements.cardNumber.disabled = true;
    elements.cardExpiry.disabled = true;
    elements.cardCvv.disabled = true;
    elements.upiId.disabled = true;
    elements.payMethodCard.style.pointerEvents = "none";
    elements.payMethodUpi.style.pointerEvents = "none";
    elements.payMethodCod.style.pointerEvents = "none";

    if (selectedPaymentMethod === "cod") {
      // Cash on Delivery — save to MongoDB
      try {
        elements.checkoutPayBtn.innerHTML = `Placing Order...`;

        const mappedItems = cart.map(item => {
          const prod = PRODUCTS.find(p => p.id === item.productId || p.id === Number(item.productId));
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
        showToast(`🎉 Order placed! Invoice: ${orderId}`, "success");

        cart = [];
        localStorage.setItem("mt_cart", JSON.stringify(cart));
        renderCart();
        updateBadges();
        closeModal();
      } catch (err) {
        showToast("Order placement failed: " + err.message, "error");
        resetPayBtnState();
      }
    } else {
      // Razorpay Payment flow
      try {
        elements.checkoutPayBtn.innerHTML = `Initiating Secure Payment...`;

        // Step 1: Create order on backend Express server
        const orderResult = await apiCreateRazorpayOrder(grandTotal, "INR");
        
        if (!orderResult.success) {
          throw new Error(orderResult.message || "Failed to create Razorpay order");
        }

        const razorpayOrder = orderResult;

        // Step 2: Save the "Pending" order to our MongoDB so we have a dbOrderId
        const mappedItems = cart.map(item => {
          const prod = PRODUCTS.find(p => p.id === item.productId || p.id === Number(item.productId));
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
            city: "-", state: "-", pincode: "-", phone: phone
          }
        });
        
        const dbOrderId = mongoResult.order._id;

        // Step 3: Configure Razorpay Checkout options
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_replace_me",
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Mother & Toddler Shop",
          description: "Premium Baby Products & Toys",
          order_id: razorpayOrder.orderId,
          handler: async function (paymentRes) {
            try {
              elements.checkoutPayBtn.innerHTML = `Verifying Payment Signature...`;

              // Step 4: Send payment results to backend for verification
              const verifyResult = await apiVerifyPayment({
                razorpay_order_id: paymentRes.razorpay_order_id,
                razorpay_payment_id: paymentRes.razorpay_payment_id,
                razorpay_signature: paymentRes.razorpay_signature,
                dbOrderId: dbOrderId
              });

              if (verifyResult.success) {
                showToast(`🎉 Payment successful! Invoice: ${dbOrderId}`, "success");

                // Clear Cart & Reset UI
                cart = [];
                localStorage.setItem("mt_cart", JSON.stringify(cart));
                renderCart();
                updateBadges();
                closeModal();
              } else {
                showToast("Verification failed: " + verifyResult.message, "error");
                resetPayBtnState();
              }
            } catch (verifyErr) {
              showToast("Error verifying payment: " + verifyErr.message, "error");
              resetPayBtnState();
            }
          },
          prefill: {
            name: name,
            email: getStoredUser()?.email || "",
            contact: phone
          },
          theme: { color: "#FB8C00" },
          modal: {
            ondismiss: function () {
              showToast("Payment checkout cancelled", "error");
              resetPayBtnState();
            }
          }
        };

        const rzp = new window.Razorpay(options);
        
        // Handle payment failure event
        rzp.on('payment.failed', function (paymentErr) {
          showToast(`Payment failed: ${paymentErr.error.description}`, "error");
          resetPayBtnState();
        });

        // Step 4: Open Razorpay checkout popup
        rzp.open();
      } catch (paymentInitErr) {
        showToast("Payment initialization failed: " + paymentInitErr.message, "error");
        resetPayBtnState();
      }
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
function renderSidebarCategories() {
  const mainCategoriesList = [
    "Baby Dresses", "Baby Toys", "Feeding Accessories", "Maternity Wear", "Baby Story Books", "Handbags"
  ];
  
  elements.sideNavCategoriesList.innerHTML = mainCategoriesList.map(cat => {
    return `
      <li>
        <button class="side-nav-category-item" data-side-cat="${cat}" style="width: 100%; text-align: left; background: none; border: none; font-size: 0.95rem; font-weight: 700; color: var(--dark-brown); cursor: pointer; padding: 6px 0; display: block;">
          ${cat} ➔
        </button>
      </li>
    `;
  }).join("");

  // Category item click listeners in sidebar
  elements.sideNavCategoriesList.querySelectorAll(".side-nav-category-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-side-cat");
      selectedCategory = cat;
      selectedAgeGroup = "all"; // Reset age filter
      
      // Highlight storefront category filter tab
      elements.filterTabs.querySelectorAll(".filter-tab").forEach(tab => tab.classList.remove("active"));
      let matchedTab = false;
      elements.filterTabs.querySelectorAll(".filter-tab").forEach(tab => {
        if (tab.getAttribute("data-category").toLowerCase() === cat.toLowerCase()) {
          tab.classList.add("active");
          matchedTab = true;
        }
      });

      renderProducts();
      closeAllDrawers();
      
      document.getElementById("products").scrollIntoView({ behavior: 'smooth' });
      showToast(`Showing ${cat}`, "success");
    });
  });
}

// Render category list grids dynamically
function renderCategoryGroups() {
  elements.groupBabyEssentials.innerHTML = CATEGORY_DETAILS["Baby Essentials"].map(cat => getCategoryCardHtml(cat)).join("");
  elements.groupFeedingCare.innerHTML = CATEGORY_DETAILS["Feeding & Care"].map(cat => getCategoryCardHtml(cat)).join("");
  elements.groupToys.innerHTML = CATEGORY_DETAILS["Toys & Entertainment"].map(cat => getCategoryCardHtml(cat)).join("");
  elements.groupMobilityBooks.innerHTML = CATEGORY_DETAILS["Mobility & Books"].map(cat => getCategoryCardHtml(cat)).join("");
  elements.groupMomsSpecial.innerHTML = CATEGORY_DETAILS["Moms & Special Collections"].map(cat => getCategoryCardHtml(cat)).join("");

  document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      const catName = card.getAttribute("data-cat-name");
      
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
      
      document.querySelectorAll(".category-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      document.getElementById("products").scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function getCategoryCardHtml(cat) {
  return `
    <div class="category-card" data-cat-name="${cat.name}">
      <p style="font-weight: 700; font-size: 0.95rem; margin: 0; color: var(--dark-brown); text-align: center;">${cat.name}</p>
    </div>
  `;
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
    const matchesCategory = selectedCategory === "all" || prod.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesAgeGroup = selectedAgeGroup === "all" || prod.ageGroup === selectedAgeGroup || prod.ageGroup === "All";
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery) || prod.category.toLowerCase().includes(searchQuery);
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
    const isWished = wishlist.includes(prod.id) || wishlist.includes(String(prod.id)) || wishlist.includes(Number(prod.id));
    
    // Calculate discount percentage
    let discountBadge = "";
    if (prod.originalPrice && prod.originalPrice > prod.price) {
      const discountPct = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
      if (discountPct > 0) {
        discountBadge = `<span class="badge-tag badge-discount">${discountPct}% OFF</span>`;
      }
    }

    return `
      <div class="product-card" onclick="openQuickView(${prod.id})" style="cursor: pointer; animation: fadeIn 0.5s ease forwards; ${!prod.inStock ? 'opacity: 0.7;' : ''}">
        <div class="product-badges">
          ${prod.isNew ? '<span class="badge-tag badge-new">NEW</span>' : ''}
          ${prod.isSale ? '<span class="badge-tag badge-sale">SALE</span>' : ''}
          ${discountBadge}
          ${!prod.inStock ? '<span class="badge-tag" style="background-color: #E0E0E0; color: #757575;">OUT OF STOCK</span>' : ''}
        </div>
        <button class="wishlist-toggle-btn ${isWished ? 'wished' : ''}" onclick="event.stopPropagation(); toggleWishlist(${prod.id})" title="Add to Wishlist">
          <svg viewBox="0 0 24 24">
            <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.41,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.59,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
          </svg>
        </button>
        <div class="product-img-wrapper" onclick="openQuickView(${prod.id})">
          <img src="${prod.image}" alt="${prod.name}" class="product-img" loading="lazy">
          <div class="product-actions-overlay">
            <button class="product-overlay-btn" onclick="event.stopPropagation(); openQuickView(${prod.id})">Quick View</button>
          </div>
        </div>
        <div class="product-info">
          <span class="product-category">${prod.category} ${prod.ageGroup && prod.ageGroup !== 'All' ? `• Age: ${prod.ageGroup} Yrs` : ''}</span>
          <h3 class="product-name" onclick="openQuickView(${prod.id})">${prod.name}</h3>
          <div class="product-rating">
            <span>${prod.rating.toFixed(1)}</span>
            <svg viewBox="0 0 24 24"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/></svg>
            <span class="rating-count">(${prod.id * 7 + 12})</span>
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
    const prod = PRODUCTS.find(p => p.id === item.productId);
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
            <button class="qty-btn" onclick="updateCartQuantity(${prod.id}, ${item.quantity - 1})">-</button>
            <span style="font-weight: bold; font-size: 0.95rem;">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQuantity(${prod.id}, ${item.quantity + 1})">+</button>
          </div>
        </div>
        <button class="drawer-item-remove" onclick="removeFromCart(${prod.id})" title="Remove item">
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
    const prod = PRODUCTS.find(p => p.id === id);
    if (!prod) return '';

    return `
      <div class="drawer-item">
        <img src="${prod.image}" alt="${prod.name}" class="drawer-item-img">
        <div class="drawer-item-details">
          <h4 class="drawer-item-title">${prod.name}</h4>
          <span class="drawer-item-price">₹${prod.price.toLocaleString('en-IN')}</span>
          ${prod.inStock ? `
            <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem; margin-top: 8px; border-radius: 20px;" onclick="moveWishlistToCart(${prod.id})">
              Add to Cart
            </button>
          ` : '<span style="font-size: 0.75rem; color: var(--accent-red); display:block; margin-top:6px; font-weight:700;">Sold Out</span>'}
        </div>
        <button class="drawer-item-remove" onclick="toggleWishlist(${prod.id})" title="Remove item">
          <svg viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
        </button>
      </div>
    `;
  }).join("");
}

// Add item to cart
function addToCart(productId, qty) {
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  const existing = cart.find(item => item.productId === productId);
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
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  const existing = cart.find(item => item.productId === productId);
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
  cart = cart.filter(item => item.productId !== productId);
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

  const existing = cart.find(item => item.productId === productId);
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
  const prod = PRODUCTS.find(p => p.id === productId);

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

// Open Quick View Modal with populated contents in Rupees
function openQuickView(productId) {
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  elements.modalBodyContent.innerHTML = `
    <div class="modal-img-col">
      <img src="${prod.image}" alt="${prod.name}">
    </div>
    <div class="modal-info-col">
      <span class="modal-category">${prod.category} ${prod.ageGroup && prod.ageGroup !== 'All' ? `• Age: ${prod.ageGroup} Yrs` : ''}</span>
      <h2 class="modal-title">${prod.name}</h2>
      <div class="modal-rating">
        <svg viewBox="0 0 24 24"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/></svg>
        <span style="font-weight: bold; margin-left: 4px;">${prod.rating.toFixed(1)}</span>
        <span style="color: var(--light-brown); font-size: 0.85rem; margin-left: 8px;">(45 customer reviews)</span>
      </div>
      <div class="modal-price-row">
        <span class="modal-price">₹${prod.price.toLocaleString('en-IN')}</span>
        ${prod.originalPrice ? `<span class="product-original-price" style="font-size: 1.1rem;">₹${prod.originalPrice.toLocaleString('en-IN')}</span>` : ''}
      </div>
      <p class="modal-desc">${prod.description}</p>
      
      <div class="modal-actions" style="display: flex; gap: 10px; align-items: stretch; margin-top: 15px;">
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
  `;

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
      addToCart(prod.id, quantity);
      closeModal();
    });
    const modalBuyNowBtn = document.getElementById("modalBuyNowBtn");
    if (modalBuyNowBtn) {
      modalBuyNowBtn.addEventListener("click", () => {
        const quantity = parseInt(qtyVal.value);
        buyNow(prod.id, quantity);
        closeModal();
      });
    }
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
          <button class="admin-action-btn admin-btn-edit" onclick="editProduct(${prod.id})" title="Edit Product">
            <svg viewBox="0 0 24 24"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.07,6.19L3,17.25Z"/></svg>
          </button>
          <button class="admin-action-btn admin-btn-delete" onclick="deleteProduct(${prod.id})" title="Delete Product">
            <svg viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// Edit existing product
function editProduct(id) {
  const prod = PRODUCTS.find(p => p.id === id);
  if (!prod) return;

  elements.productFormPanel.style.display = "block";
  elements.addNewProductBtn.style.display = "none";
  elements.formPanelTitle.textContent = "Edit Product Details";

  elements.editProductId.value = prod.id;
  elements.prodName.value = prod.name;
  elements.prodCategory.value = prod.category;
  elements.prodPrice.value = Math.round(prod.price);
  elements.prodOriginalPrice.value = prod.originalPrice ? Math.round(prod.originalPrice) : "";
  elements.prodImage.value = prod.image;
  elements.prodStock.value = prod.inStock ? "true" : "false";
  elements.prodDesc.value = prod.description;
  elements.prodIsNew.checked = !!prod.isNew;
  elements.prodIsSale.checked = !!prod.isSale;

  elements.productFormPanel.scrollIntoView({ behavior: 'smooth' });
}

// Delete product
function deleteProduct(id) {
  const prod = PRODUCTS.find(p => p.id === id);
  if (!prod) return;

  if (confirm(`Are you sure you want to remove "${prod.name}" from the store catalog?`)) {
    PRODUCTS = PRODUCTS.filter(p => p.id !== id);
    saveProductsToStorage();
    showToast("Product deleted successfully.", "error");
    
    renderProducts();
    renderAdminProductsTable();
    renderCategoryGroups();
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
    return `<img src="${imageUrl || 'assets/hero_banner_custom.png'}" alt="Slideshow Image" class="hero-custom-img">`;
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
  } catch (err) {
    elements.customerOrdersTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 24px; color: var(--accent-red); font-weight: 700;">
          Failed to load orders: ${err.message}
        </td>
      </tr>
    `;
  }
}

