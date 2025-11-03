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
      { name: 'Birthday — Floral Burst', description: 'Bright floral design for birthdays', price: 5.0, images: [], category: 'birthday' },
      { name: 'Birthday — Confetti Pop', description: 'Fun confetti design to celebrate', price: 5.5, images: [], category: 'birthday' },
      { name: 'Birthday — Minimal Script', description: 'Simple script message on clean background', price: 4.0, images: [], category: 'birthday' },
      { name: 'Birthday — Cute Animals', description: 'Adorable animal illustrations', price: 6.0, images: [], category: 'birthday' },
      { name: 'Birthday — Retro Neon', description: 'Vibrant neon retro style', price: 6.5, images: [], category: 'birthday' },

      { name: 'Anniversary — Classic Roses', description: 'Timeless roses for anniversaries', price: 9.0, images: [], category: 'anniversary' },
      { name: 'Anniversary — Gold Foil', description: 'Luxurious gold-foil look', price: 10.0, images: [], category: 'anniversary' },
      { name: 'Anniversary — Photo Frame', description: 'Include a special photo frame layout', price: 12.0, images: [], category: 'anniversary' },
      { name: 'Anniversary — Modern Geometric', description: 'Stylish geometric shapes', price: 8.5, images: [], category: 'anniversary' },
      { name: 'Anniversary — Handwritten Note', description: 'Warm handwritten note style', price: 7.0, images: [], category: 'anniversary' },

      { name: 'Thank You — Simple Thanks', description: 'Minimal thank you card', price: 3.5, images: [], category: 'thankyou' },
      { name: 'Thank You — Bouquet', description: 'Thank you with bouquet illustration', price: 4.5, images: [], category: 'thankyou' },
      { name: 'Thank You — Modern Typography', description: 'Bold typographic thank you', price: 4.0, images: [], category: 'thankyou' },
      { name: 'Thank You — Pastel Watercolor', description: 'Soft watercolor palette', price: 5.0, images: [], category: 'thankyou' },
      { name: 'Thank You — Eco Theme', description: 'Nature inspired thank-you', price: 4.25, images: [], category: 'thankyou' },

      { name: 'Holiday — Winter Wishes', description: 'Cozy winter holiday card', price: 6.0, images: [], category: 'holiday' },
      { name: 'Holiday — Festive Lights', description: 'Bright lights and celebration', price: 6.5, images: [], category: 'holiday' },
      { name: 'Holiday — New Year Sparkle', description: 'Sparkly New Year design', price: 7.0, images: [], category: 'holiday' },
      { name: 'Holiday — Hanukkah Blessings', description: 'Warm Hanukkah card design', price: 6.0, images: [], category: 'holiday' },
      { name: 'Holiday — Kwanzaa Greetings', description: 'Kwanzaa inspired card', price: 6.0, images: [], category: 'holiday' },

      { name: 'Love — Rose Heart', description: 'Classic heart with roses', price: 8.0, images: [], category: 'love' },
      { name: 'Love — Minimal Couple', description: 'Modern couple silhouette', price: 7.5, images: [], category: 'love' },
      { name: 'Love — Love You More', description: 'Playful message for partners', price: 6.5, images: [], category: 'love' },
      { name: 'Love — Anniversary Love', description: 'Romantic anniversary love card', price: 9.0, images: [], category: 'love' },
      { name: 'Love — Long Distance', description: 'For couples far apart', price: 6.0, images: [], category: 'love' },

      { name: 'General — Hello Friend', description: 'Friendly hello card', price: 3.0, images: [], category: 'general' },
      { name: 'General — Congratulations', description: 'Celebrate achievements', price: 5.0, images: [], category: 'general' },
      { name: 'General — Get Well Soon', description: 'Warm get well wishes', price: 4.5, images: [], category: 'general' },
      { name: 'General — Sympathy', description: 'Condolence and sympathy card', price: 4.75, images: [], category: 'general' },
      { name: 'General — Thinking of You', description: 'Let someone know you care', price: 3.75, images: [], category: 'general' },

      { name: 'Birthday — Tropical Vibes', description: 'Tropical themed birthday greetings', price: 6.25, images: [], category: 'birthday' },
      { name: 'Birthday — Cake Illustration', description: 'Cute cake art', price: 5.0, images: [], category: 'birthday' },
      { name: 'Birthday — Age Milestone', description: 'Celebrate milestone ages', price: 7.5, images: [], category: 'birthday' },
      { name: 'Birthday — Kids Cartoon', description: 'Bright cartoon for kids', price: 5.25, images: [], category: 'birthday' },
      { name: 'Birthday — Elegant Monogram', description: 'Personal monogram birthday card', price: 8.0, images: [], category: 'birthday' },

      { name: 'Anniversary — Vintage Postcard', description: 'Nostalgic vintage feel', price: 8.5, images: [], category: 'anniversary' },
      { name: 'Anniversary — Adventure Together', description: 'For adventurous couples', price: 7.0, images: [], category: 'anniversary' },
      { name: 'Anniversary — Personalized Map', description: 'Map of meaningful place', price: 12.0, images: [], category: 'anniversary' },
      { name: 'Anniversary — Forever Us', description: 'Simple and bold statement', price: 6.5, images: [], category: 'anniversary' },
      { name: 'Anniversary — Two Hearts', description: 'Interlocking hearts motif', price: 7.25, images: [], category: 'anniversary' },

      { name: 'Thank You — Teacher Appreciation', description: 'Special thanks for teachers', price: 5.0, images: [], category: 'thankyou' },
      { name: 'Thank You — Healthcare Heroes', description: 'Thanks for healthcare workers', price: 5.5, images: [], category: 'thankyou' },
      { name: 'Thank You — Small Business Support', description: 'Support local business thank you', price: 4.5, images: [], category: 'thankyou' },
      { name: 'Thank You — Volunteers', description: 'Thank volunteers with gratitude', price: 4.75, images: [], category: 'thankyou' },
      { name: 'Thank You — Family Help', description: 'Thanks for family support', price: 4.25, images: [], category: 'thankyou' },

      { name: 'Holiday — Autumn Harvest', description: 'Warm autumn harvest design', price: 5.75, images: [], category: 'holiday' },
      { name: 'Holiday — Spring Bloom', description: 'Floral spring holiday card', price: 5.5, images: [], category: 'holiday' },
      { name: 'Holiday — Summer Sunshine', description: 'Bright summer greetings', price: 5.25, images: [], category: 'holiday' },
      { name: 'Holiday — Costume Party', description: 'Fun costume party invite style', price: 6.0, images: [], category: 'holiday' }
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
