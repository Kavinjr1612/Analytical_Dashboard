import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';

const prisma = new PrismaClient();

const CATEGORIES = ['Electronics', 'Clothing', 'Grocery', 'Furniture', 'Beauty'];
const REGIONS = ['North', 'South', 'East', 'West'];
const STATUSES = ['Completed', 'Pending', 'Cancelled'];

const PRODUCTS: Record<string, string[]> = {
  Electronics: [
    'Laptop Pro', 'Wireless Headphones', 'Smart Watch', 'Noise Cancelling Earbuds',
    'Mechanical Keyboard', '4K Monitor', 'Smartphone X', 'Bluetooth Speaker',
    'Gaming Mouse', 'USB-C Dock'
  ],
  Clothing: [
    'Classic Denim Jacket', 'Organic Cotton T-Shirt', 'Slim Fit Chinos', 'Running Shoes',
    'Hooded Sweatshirt', 'Leather Belt', 'Wool Scarf', 'Summer Sundress',
    'Athletic Socks', 'Puffer Vest'
  ],
  Grocery: [
    'Organic Olive Oil', 'Whole Grain Bread', 'Premium Coffee Beans', 'Almond Milk',
    'Granola Bars', 'Dark Chocolate Bar', 'Himalayan Pink Salt', 'Avocado Oil',
    'Green Tea Bags', 'Mixed Nuts Pack'
  ],
  Furniture: [
    'Ergonomic Office Chair', 'Solid Oak Dining Table', 'Minimalist Coffee Table', 'Velvet Sofa',
    'Standing Desk', 'Bookshelf Unit', 'Nightstand with Drawer', 'Floor Lamp',
    'Accent Armchair', 'Dining Chair Set'
  ],
  Beauty: [
    'Hydrating Face Cream', 'Vitamin C Serum', 'Matte Lipstick', 'Sandalwood Body Wash',
    'Mineral Sunscreen', 'Exfoliating Scrub', 'Hair Nourishing Oil', 'Clay Face Mask',
    'Rosewater Facial Toner', 'Eyeliner Pencil'
  ]
};

// Generates a realistic price based on category
function getRandomAmount(category: string): number {
  let min = 10;
  let max = 100;
  
  switch(category) {
    case 'Electronics':
      min = 99;
      max = 1499;
      break;
    case 'Clothing':
      min = 19;
      max = 199;
      break;
    case 'Grocery':
      min = 4;
      max = 79;
      break;
    case 'Furniture':
      min = 79;
      max = 1199;
      break;
    case 'Beauty':
      min = 9;
      max = 89;
      break;
  }
  
  // Format to two decimal places
  const val = faker.number.float({ min, max, fractionDigits: 2 });
  return val;
}

async function main() {
  console.log('Clearing existing transactions...');
  await prisma.transaction.deleteMany({});
  
  console.log('Generating 10,000 transaction records...');
  
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  const timeRange = now.getTime() - oneYearAgo.getTime();
  const step = timeRange / 10000;
  
  const BATCH_SIZE = 2000;
  let currentBatch: any[] = [];
  
  for (let i = 0; i < 10000; i++) {
    const category = faker.helpers.arrayElement(CATEGORIES);
    const productList = PRODUCTS[category];
    const productName = faker.helpers.arrayElement(productList);
    
    // Status distribution: 75% Completed, 15% Pending, 10% Cancelled
    const randStatus = Math.random();
    const status = randStatus < 0.75 ? 'Completed' : randStatus < 0.90 ? 'Pending' : 'Cancelled';
    
    const region = faker.helpers.arrayElement(REGIONS);
    const amount = getRandomAmount(category);
    
    // Uniform date distribution over the last 12 months
    const transactionDate = new Date(oneYearAgo.getTime() + i * step + Math.random() * step);
    
    currentBatch.push({
      id: crypto.randomUUID(),
      customerName: faker.person.fullName(),
      productName,
      category,
      region,
      amount,
      status,
      transactionDate
    });
    
    if (currentBatch.length === BATCH_SIZE || i === 9999) {
      console.log(`Inserting batch of size ${currentBatch.length} (up to record ${i + 1})...`);
      await prisma.transaction.createMany({
        data: currentBatch
      });
      currentBatch = [];
    }
  }
  
  const count = await prisma.transaction.count();
  console.log(`Seeding complete! Successfully seeded ${count} transactions.`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
