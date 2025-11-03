import axios from 'axios';
import { config } from 'dotenv';
config(); // Load env vars

const API_URL = `http://localhost:${process.env.PORT || 4000}/api`;
const api = axios.create({ baseURL: API_URL });

// Store admin token after login/register
let adminToken: string;

// Helper to set auth header
function setAuthHeader(token: string) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

async function run() {
  try {
    console.log('Starting seed process...');

    // 1. Create or login admin
    const adminData = {
      name: 'Admin',
      email: 'admin@thepresent.test',
      password: 'adminpass',
      role: 'admin'
    };

    try {
      // Try to register first
      console.log('Attempting to register admin...');
      const registerRes = await api.post('/auth/register', adminData);
      adminToken = registerRes.data.token;
      console.log('Created new admin user');
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message === 'Email already in use') {
        // If admin exists, login instead
        console.log('Admin exists, logging in...');
        const loginRes = await api.post('/auth/login', {
          email: adminData.email,
          password: adminData.password
        });
        adminToken = loginRes.data.token;
        console.log('Logged in as admin');
      } else {
        throw err;
      }
    }

    // Set auth token for subsequent requests
    setAuthHeader(adminToken);

    // 2. Create sample users
    const usersToSeed = [
      { name: 'User One', email: 'user1@thepresent.test', password: 'user1pass', role: 'user' },
      { name: 'User Two', email: 'user2@thepresent.test', password: 'user2pass', role: 'user' }
    ];

    for (const userData of usersToSeed) {
      try {
        await api.post('/auth/register', userData);
        console.log('Created user:', userData.email);
      } catch (err: any) {
        if (err.response?.status === 400 && err.response?.data?.message === 'Email already in use') {
          console.log('User already exists:', userData.email);
        } else {
          console.error(`Failed to create user ${userData.email}:`, err.response?.data?.message || err.message);
        }
      }
    }

    // 3. Create sample products
    const sampleProducts = [
      { name: 'Birthday Gift Card', description: 'A cheerful birthday digital card', price: 5.0, images: [], category: 'birthday' },
      { name: 'Anniversary Card', description: 'Elegant anniversary design', price: 7.5, images: [], category: 'anniversary' },
      { name: 'Thank You Card', description: 'Express gratitude with this card', price: 4.0, images: [], category: 'thankyou' },
      { name: 'Holiday Card', description: 'Seasonal greetings holiday card', price: 6.0, images: [], category: 'holiday' },
      { name: 'Love Card', description: 'Romantic love card', price: 8.0, images: [], category: 'love' }
    ];

    // Get existing products to check duplicates
    const existingProducts = await api.get('/products');
    const existingNames = new Set(existingProducts.data.map((p: any) => p.name));

    for (const product of sampleProducts) {
      if (!existingNames.has(product.name)) {
        try {
          await api.post('/products', product);
          console.log('Created product:', product.name);
        } catch (err: any) {
          console.error(`Failed to create product ${product.name}:`, err.response?.data?.message || err.message);
        }
      } else {
        console.log('Product already exists:', product.name);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
