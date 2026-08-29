const mongoose = require('mongoose');

let connected = false;

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ksa_skilled';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    connected = true;
    console.log('✓ MongoDB connected');
  } catch (err) {
    connected = false;
    console.warn('⚠ MongoDB not available — using local file user store for OTP.');
    console.warn('  (' + err.message + ')');
  }
}

const isConnected = () => connected && mongoose.connection.readyState === 1;

module.exports = { connectDB, isConnected };
