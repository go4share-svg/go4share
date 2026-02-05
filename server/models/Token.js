import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  total: { type: Number, default: 0 },
  history: [
    {
      change: { type: Number, required: true },
      type: { type: String, default: "manualAdd" },
      date: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("Token", tokenSchema);

