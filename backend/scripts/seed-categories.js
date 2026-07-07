const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

const SEED_DATA = [
  {
    name: 'New Born',
    description: 'Everything your newborn needs — from clothing to care essentials.',
    icon: '👶',
    order: 0,
    featured: true,
    showOnHome: true,
    isActive: true,
    status: 'active',
    subcategories: ['Clothing', 'Feeding', 'Baby Care', 'Accessories', 'Dresses']
  },
  {
    name: 'Mother Care / Maternity',
    description: 'Comfortable and stylish maternity essentials for every mom.',
    icon: '🤱',
    order: 1,
    featured: true,
    showOnHome: true,
    isActive: true,
    status: 'active',
    subcategories: ['Clothing', 'Innerwear', 'Accessories']
  },
  {
    name: 'Toys',
    description: 'Fun, educational, and safe toys for every age group.',
    icon: '🧸',
    order: 2,
    featured: true,
    showOnHome: true,
    isActive: true,
    status: 'active',
    subcategories: ['Educational Toys', 'Board Games', 'Remote Control Toys', 'Ride-On Cars']
  },
  {
    name: 'Sports',
    description: 'Active play equipment — tricycles, bicycles, balls, and more.',
    icon: '⚽',
    order: 3,
    featured: true,
    showOnHome: true,
    isActive: true,
    status: 'active',
    subcategories: ['Tricycles', 'Bicycles', 'Football', 'Volleyball', 'Basketball', 'Carrom Board']
  },
  {
    name: 'Stationery',
    description: 'Books, colours, and creative accessories for young learners.',
    icon: '📚',
    order: 4,
    featured: true,
    showOnHome: true,
    isActive: true,
    status: 'active',
    subcategories: ['Colouring Books', 'Story Books', 'Activity Books', 'Colouring Accessories', 'Colours', 'Crayons', 'Pencils', 'Brushes']
  },
  {
    name: 'Gifts & Novelties',
    description: 'Perfect gifts and novelty items for babies and kids.',
    icon: '🎁',
    order: 5,
    featured: true,
    showOnHome: true,
    isActive: true,
    status: 'active',
    subcategories: ['Idols', 'Photo Frames']
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories and subcategories
    await Category.deleteMany({});
    await Subcategory.deleteMany({});
    console.log('Cleared existing categories and subcategories');

    for (const catData of SEED_DATA) {
      const { subcategories, ...categoryFields } = catData;
      const category = await Category.create(categoryFields);
      console.log(`Created category: ${category.name} (${category.slug})`);

      for (let i = 0; i < subcategories.length; i++) {
        const sub = await Subcategory.create({
          categoryId: category._id,
          name: subcategories[i],
          order: i,
          isActive: true
        });
        console.log(`  └── Subcategory: ${sub.name} (${sub.slug})`);
      }
    }

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
