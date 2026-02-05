import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user: { type: String, required: true }, // kdo lajknul
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
  },
  { timestamps: true }
);

// ❗ zabrání duplicitě (1 user = 1 like)
likeSchema.index({ user: 1, videoId: 1 }, { unique: true });

export default mongoose.model("Like", likeSchema);