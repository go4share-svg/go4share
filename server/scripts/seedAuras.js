// server/scripts/seedAuras.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Aura from "../models/Aura.js";

// 🧭 správné určení cesty (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔑 načtení .env ze složky /server
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

async function seedAuras() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI není definované v .env");
    }

    // 🔌 připojení k DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected (seed)");

    // 🧹 smažeme staré aury (volitelné, ale doporučeno)
    await Aura.deleteMany({});
    console.log("🧹 Staré aury smazány");

    // ✨ základní aury (kosmetika / status)
   const auras = [
  {
    key: "flash-glow",
    name: "Flash Glow",
    price: 100,
  },
  {
    key: "cyan-glow",
    name: "Cyan Glow",
    price: 250,
  },
  {
    key: "fuchsia-pulse",
    name: "Fuchsia Pulse",
    price: 500,
  },
  {
    key: "golden-warp",
    name: "Golden Warp",
    price: 2000,
  },
  {
    key: "void-shadow",
    name: "Void Shadow",
    price: 1000,
  },
];
    // 💾 uložení
    await Aura.insertMany(auras);

    console.log(`✨ Aury úspěšně nasazeny (${auras.length})`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Aura seed error:", err.message);
    process.exit(1);
  }
}

seedAuras();
