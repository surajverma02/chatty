const mongoose = require("mongoose");
const logger = require("../lib/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.fatal(`MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
