const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
  {
    name: "Jive Active Earbuds",
    price: 149999,
    description: "Express Your Taste - Earbuds TWS dengan kualitas suara premium dan Ultra Bass Technology",
    displayImage: "/images/jive-active.jpg",
    colors: [
      { colorName: "Black", image: "/images/jive-active-black.jpg" },
      { colorName: "White", image: "/images/jive-active-white.jpg" }
    ],
    status: "READY"
  },
  // ... tambahkan produk lain
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log('✅ Products seeded successfully!');
  process.exit(0);
}

seed();