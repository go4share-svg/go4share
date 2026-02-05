import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: String,
    description: String,

    author: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    views: { type: Number, default: 0 },

    // ❤️ LIKE SYSTEM (JEDINÁ PRAVDA)
    likedBy: {
      type: [String], // usernames
      default: [],
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    // 🚀 BOOST
    boostTokens: { type: Number, default: 0 },
    boostExpiresAt: { type: Date, default: null },

    feedImpressions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Video", videoSchema);