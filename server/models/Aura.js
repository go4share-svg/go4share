// models/Aura.js
import mongoose from "mongoose";

const auraSchema = new mongoose.Schema({
  key: { type: String, unique: true }, // "gold_glow"
  name: String, // "Golden Aura"
  price: Number, // v tokenech
  cosmetic: { type: Boolean, default: true },

  effects: {
    nameGlow: Boolean,
    profileRing: Boolean,
    badge: String, // "⭐"
  },

  feedWeight: { type: Number, default: 0 }, 
  // max 0.02 – jemné, obhajitelné

})

export default mongoose.model("Aura", auraSchema);