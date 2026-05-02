import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const importData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Missing MONGO_URI in backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const { data } = await axios.get(
      "https://fakestoreapi.com/products"
    );

    // OPTIONAL: clear old data
    await Product.deleteMany();

    const products = data.map((item) => ({
      name: item.title,
      price: item.price,
      image: item.image,
      description: item.description,
    }));

    await Product.insertMany(products);

    console.log("🔥 Fake products imported successfully");

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

importData();
