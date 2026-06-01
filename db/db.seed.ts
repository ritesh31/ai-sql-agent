import { db } from "./db";

import {
  productsTable,
  salesTable,
} from "./schema";

const products = [{
    name: "MacBook Pro M4",
    category: "Laptop",
    price: 2200,
    stock: 15,
  }, {
    name: "Dell XPS 15",
    category: "Laptop",
    price: 1800,
    stock: 10,
  }, {
    name: "iPhone 17",
    category: "Mobile",
    price: 1200,
    stock: 30,
  }, {
    name: "Samsung S26",
    category: "Mobile",
    price: 1100,
    stock: 25,
  }, {
    name: "Sony WH-1000XM6",
    category: "Accessories",
    price: 400,
    stock: 40,
  },
];

const sales = [{
    product_id: 1,
    quantity: 2,
    total_amount: 4400,
    customer_name: "John Doe",
    region: 'North'
  }, {
    product_id: 1,
    quantity: 1,
    total_amount: 1800,
    customer_name: "Sarah Smith",
    region: 'South'
  }, {
    product_id: 1,
    quantity: 3,
    total_amount: 3600,
    customer_name: "Mike Johnson",
    region: 'West'
  }, {
    product_id: 1,
    quantity: 5,
    total_amount: 2000,
    customer_name: "Alex Brown",
    region: 'East'
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  await db.insert(productsTable).values(products);

  await db.insert(salesTable).values(sales);

  console.log("✅ Database seeded");
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });