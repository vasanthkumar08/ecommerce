import mongoose from "mongoose";
import "./env.js";

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

export const getDatabaseStatus = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    connected: isDatabaseConnected(),
    state: states[mongoose.connection.readyState] || "unknown",
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri || !mongoUri.startsWith("mongodb+srv://")) {
      throw new Error("MONGO_URI must be a MongoDB Atlas connection string");
    }

    await mongoose.connect(mongoUri, {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 50),
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 5),
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
      autoIndex: process.env.NODE_ENV !== "production",
    });

    console.log("✅ MongoDB Connected");
  } catch {
    console.log("❌ MongoDB Connection Failed");
    process.exit(1);
  }
};

export default connectDB;
