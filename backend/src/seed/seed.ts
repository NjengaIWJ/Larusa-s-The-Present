import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { MONGODB_URI } from '../config';
import User from '../models/User';
import Product from '../models/Product';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB for seeding');

  const adminEmail = 'admin@thepresent.test';
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const hashed = await bcrypt.hash('adminpass', 10);
    const admin = new User({ name: 'Admin', email: adminEmail, password: hashed, role: 'admin' });
    await admin.save();
    console.log('Created admin user =>', adminEmail);
  } else {
    console.log('Admin already exists');
  }

  const sampleProducts = [
    { name: 'Birthday Gift Card', description: 'A cheerful birthday digital card', price: 5.0, images: [], category: 'birthday' },
    { name: 'Anniversary Card', description: 'Elegant anniversary design', price: 7.5, images: [], category: 'anniversary' }
  ];

  for (const p of sampleProducts) {
    const found = await Product.findOne({ name: p.name });
    if (!found) {
      await new Product(p).save();
      console.log('Created product', p.name);
    }
  }

  console.log('Seeding completed');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
