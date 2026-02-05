
import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const email = "davidpraha1@gmail.com";

const user = await User.findOne({ email });

if (!user) {
  console.log("❌ User not found");
  process.exit();
}

user?.role = "admin";
await user.save();

console.log("✅ Admin set:", user.username);

process.exit();