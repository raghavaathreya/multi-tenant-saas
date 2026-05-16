const mongoose = require('mongoose');

const connectMongo = async () => {
  const uri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=admin`;

  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');
};

module.exports = { connectMongo };