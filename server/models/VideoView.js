import mongoose from "mongoose";

const videoViewSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    username: {
      type: String,
      default: null, // anonymní view
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ⚡ index pro rychlé dotazy
videoViewSchema.index({ videoId: 1, username: 1 });

export default mongoose.model("VideoView", videoViewSchema);