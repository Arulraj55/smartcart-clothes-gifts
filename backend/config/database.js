const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartcart-clothes-gifts', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ SmartCart: Clothes & Gifts - MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ SmartCart Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
