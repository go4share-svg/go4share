// models/Video.js
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: String,
  author: String,
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  watchTime: { type: Number, default: 0 }, // v sekundách

  // 🚀 BOOST
  boostTokens: { type: Number, default: 0 },
  boostExpiresAt: { type: Date, default: null },

  // ❄️ COOLING ENGINE (DŮLEŽITÉ)
  feedImpressions: { 
    type: Number, 
    default: 0 
  },

  createdAt: { type: Date, default: Date.now }
});

const Video = mongoose.model("Video", videoSchema);
export default Video;