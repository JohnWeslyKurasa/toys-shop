const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Product = require('../models/Product');

const SAMPLE_PRODUCTS = [
  {
    name: "Newborn Organic Cotton Onesie Set",
    price: 599,
    originalPrice: 899,
    categoryName: "New Born",
    subcategoryName: "Clothing",
    image: "https://i.ibb.co/pjQcWFFP/134037078121048557.jpg",
    images: [
      "https://i.ibb.co/pjQcWFFP/134037078121048557.jpg",
      "https://i.ibb.co/pjQcWFFP/134037078121048557.jpg"
    ],
    brand: "Mother & Toddler",
    description: "Ultra-soft organic cotton onesies designed for newborn comfort. Hypoallergenic, breathable fabric with easy snap-button closure.",
    ageGroup: "0-1",
    rating: 4.8,
    stock: 15,
    inStock: true,
    isNewProduct: true,
    reviews: [
      { name: "Aria Sharma", rating: 5, comment: "Super soft fabric, perfect for my newborn baby. Love the colors!", verified: true },
      { name: "Rahul Verma", rating: 4, comment: "Great fit and quality. Snap buttons make diaper changes easy.", verified: true }
    ]
  },
  {
    name: "Baby Knit Sweater & Cap Set",
    price: 899,
    originalPrice: 1299,
    categoryName: "New Born",
    subcategoryName: "Clothing",
    image: "https://i.ibb.co/pjQcWFFP/134037078121048557.jpg",
    brand: "Mother & Toddler",
    description: "Warm and cozy hand-knit sweater set including a matching cap. Keep your little newborn warm during cold months.",
    ageGroup: "0-1",
    rating: 5.0,
    stock: 12,
    inStock: true,
    isNewProduct: true,
    reviews: [
      { name: "Sneha Patel", rating: 5, comment: "So beautiful and warm! Highly recommend.", verified: true }
    ]
  },
  {
    name: "Wooden Alphabet Sorting Block",
    price: 499,
    originalPrice: 799,
    categoryName: "Toys",
    subcategoryName: "Educational Toys",
    image: "https://i.ibb.co/pjQcWFFP/134037078121048557.jpg",
    brand: "Mother & Toddler",
    description: "Non-toxic wooden blocks featuring alphabet letters and shapes. Promotes motor skill development and early letter recognition.",
    ageGroup: "1-3",
    rating: 4.5,
    stock: 20,
    inStock: true,
    isNewProduct: false,
    reviews: [
      { name: "Amit Joshi", rating: 4, comment: "Kids love it, very educational and sturdy.", verified: true }
    ]
  },
  {
    name: "Multi-Functional Activity Cube",
    price: 1299,
    originalPrice: 1999,
    categoryName: "Toys",
    subcategoryName: "Educational Toys",
    image: "https://i.ibb.co/pjQcWFFP/134037078121048557.jpg",
    brand: "Mother & Toddler",
    description: "5-in-1 interactive activity cube with shape sorting, bead mazes, and gears. Perfect developmental toy for toddlers.",
    ageGroup: "1-3",
    rating: 4.9,
    stock: 8,
    inStock: true,
    isNewProduct: true,
    reviews: []
  },
  {
    name: "Smart Kids Tricycle with Push Handle",
    price: 2499,
    originalPrice: 3999,
    categoryName: "Sports",
    subcategoryName: "Tricycles",
    image: "https://i.ibb.co/pjQcWFFP/134037078121048557.jpg",
    brand: "Mother & Toddler",
    description: "Sturdy tricycle equipped with parental control steering handle, safety guard, and folding footrests. Perfect for growing kids.",
    ageGroup: "1-3",
    rating: 4.7,
    stock: 10,
    inStock: true,
    isNewProduct: true,
    reviews: [
      { name: "Vikram Malhotra", rating: 5, comment: "Best tricycle. Steering control is super smooth.", verified: true }
    ]
  },
  {
    name: "Jumbo Kids Colouring Book Set",
    price: 199,
    originalPrice: 299,
    categoryName: "Stationery",
    subcategoryName: "Colouring Books",
    image: "https://i.ibb.co/pjQcWFFP/134037078121048557.jpg",
    brand: "Mother & Toddler",
    description: "Includes two coloring books with thick, high-quality pages. Fun drawings of animals, vehicles, and landscapes.",
    ageGroup: "3-6",
    rating: 4.2,
    stock: 30,
    inStock: true,
    isNewProduct: false,
    reviews: []
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    const dummyUserId = new mongoose.Types.ObjectId();

    for (const pData of SAMPLE_PRODUCTS) {
      // Find category
      const categoryObj = await Category.findOne({ name: pData.categoryName });
      if (!categoryObj) {
        console.log(`Category not found: ${pData.categoryName}`);
        continue;
      }

      // Find subcategory
      const subcatObj = await Subcategory.findOne({ 
        categoryId: categoryObj._id,
        name: pData.subcategoryName 
      });
      
      const fullCategoryName = subcatObj 
        ? `${categoryObj.name} > ${subcatObj.name}`
        : categoryObj.name;

      const reviews = (pData.reviews || []).map(r => ({
        ...r,
        userId: dummyUserId
      }));

      const product = await Product.create({
        name: pData.name,
        price: pData.price,
        originalPrice: pData.originalPrice,
        category: fullCategoryName,
        categoryId: categoryObj._id,
        subcategoryId: subcatObj ? subcatObj._id : undefined,
        image: pData.image,
        images: pData.images || [],
        brand: pData.brand,
        description: pData.description,
        ageGroup: pData.ageGroup,
        rating: pData.rating,
        stock: pData.stock,
        inStock: pData.inStock,
        isNewProduct: pData.isNewProduct,
        reviews: reviews
      });

      console.log(`Created product: ${product.name} under ${product.category}`);
    }

    console.log('✅ Seeding products completed!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed products:', error);
    process.exit(1);
  }
}

seed();
