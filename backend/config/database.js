const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartcart-clothes-gifts';
    const dbName = process.env.DB_NAME || 'smartcart-ecommerce';
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName,
    });

    const host = conn.connection.host;
    const name = conn.connection.name;
    console.log(`✅ SmartCart: MongoDB Connected • host=${host} • db=${name}`);
  } catch (error) {
    console.error('❌ SmartCart Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
