require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB, isConnected } = require('./config/db');
const { User, News } = require('./models');

async function seed() {
  await connectDB();
  if (!isConnected()) {
    console.error('✗ Cannot seed — MongoDB is not running. Start MongoDB and retry.');
    process.exit(1);
  }

  const email = 'admin@ksaskilled.sa';
  const exists = await User.findOne({ email });
  if (!exists) {
    await User.create({
      firstName: 'System', lastName: 'Administrator', email,
      phone: '+966500000000', role: 'admin',
      password: await bcrypt.hash('Admin@123456', 10), kycStatus: 'approved',
    });
    console.log('✓ Admin created:', email, '/ Admin@123456');
  } else {
    console.log('· Admin already exists');
  }

  const newsCount = await News.countDocuments();
  if (newsCount === 0) {
    await News.insertMany([
      { title: { en: 'KSA Skilled Development Launches New Training Program', ar: 'إطلاق برنامج تدريبي جديد' }, slug: 'new-training-program', excerpt: { en: 'A comprehensive initiative to empower the Saudi workforce.' }, content: { en: 'A landmark training program aligned with Vision 2030.' }, image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=70', category: 'Training', author: 'KSA Editorial' },
      { title: { en: 'Strategic Partnership Strengthens Workforce Pipeline' }, slug: 'partnership-announcement', excerpt: { en: 'New agreements expand our reach.' }, content: { en: 'Partnerships across key sectors.' }, image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=70', category: 'Corporate', author: 'KSA Editorial' },
    ]);
    console.log('✓ Sample news seeded');
  }

  await mongoose.disconnect();
  console.log('✓ Seed complete');
  process.exit(0);
}

seed();
