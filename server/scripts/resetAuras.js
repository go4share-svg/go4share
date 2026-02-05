import mongoose from "mongoose";
import dotenv from "dotenv";
import Aura from "../models/Aura.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

await Aura.deleteMany({});
console.log("🧹 Aury smazány");

process.exit(0);
