const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');
const Subcategory = require('./models/Subcategory');

const CATEGORY_DETAILS = {
  'New Born': [
    { name: 'Clothing', icon: '', color: '#FFF3E0' },
    { name: 'Feeding', icon: '', color: '#E0F2F1' },
    { name: 'Baby Care', icon: '', color: '#F3E5F5' },
    { name: 'Accessories', icon: '', color: '#E8F5E9' },
    { name: 'Dresses', icon: '', color: '#E1F5FE' }
  ],
  'Mother Care or Maternity': [
    { name: 'Clothing', icon: '', color: '#FFFDE7' },
    { name: 'Inners', icon: '', color: '#E0F7FA' },
    { name: 'Accessories', icon: '', color: '#FFEBEE' }
  ],
  'Toys': [
    { name: 'Educational', icon: '', color: '#FFF8E1' },
    { name: 'Board Games', icon: '', color: '#E0F2F1' },
    { name: 'Remote Control', icon: '', color: '#E8F5E9' },
    { name: 'Ride On Cars', icon: '', color: '#F3E5F5' }
  ],
  'Sports': [
    { name: 'Tricycles', icon: '', color: '#E1F5FE' },
    { name: 'Bicycles', icon: '', color: '#FFF3E0' },
    { name: 'Foot Balls', icon: '', color: '#FFF8E1' },
    { name: 'Volley Balls', icon: '', color: '#E0F7FA' },
    { name: 'Basket Balls', icon: '', color: '#E8F5E9' },
    { name: 'Carrom Board', icon: '', color: '#F3E5F5' }
  ],
  'Stationary': [
    { name: 'Colouring Books', icon: '', color: '#FFFDE7' },
    { name: 'Story Books', icon: '', color: '#E0F2F1' },
    { name: 'Activity Books', icon: '', color: '#FFEBEE' },
    { name: 'Colouring Accessories', icon: '', color: '#E8F5E9' },
    { name: 'Colors', icon: '', color: '#FFF3E0' },
    { name: 'Crayons', icon: '', color: '#E1F5FE' },
    { name: 'Pencil', icon: '', color: '#F3E5F5' },
    { name: 'Brushs', icon: '', color: '#E0F7FA' }
  ],
  'Gifts & Novelties': [
    { name: 'Idols', icon: '', color: '#FFEBEE' },
    { name: 'Photo Frames', icon: '', color: '#FFF8E1' }
  ]
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mother_toddler');
  console.log('Connected to DB');
  await Category.deleteMany({});
  await Subcategory.deleteMany({});
  
  let order = 0;
  for (const [catName, subcats] of Object.entries(CATEGORY_DETAILS)) {
    const cat = await Category.create({
      name: catName,
      order: order++,
      isActive: true,
      showOnHome: true,
      description: 'Curated collection for ' + catName
    });
    
    let subOrder = 0;
    for (const sub of subcats) {
      await Subcategory.create({
        categoryId: cat._id,
        name: sub.name,
        order: subOrder++,
        isActive: true
      });
    }
  }
  
  console.log('Seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
