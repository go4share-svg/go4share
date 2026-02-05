import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    text: { type: String, required: true },

    likedBy: { type: [String], default: [] },
    likesCount: { type: Number, default: 0 },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // 😀 REAKCE
    reactions: [
  {
    emoji: String,
    user: String,
  },
],
  },
  { timestamps: true }
);
export default mongoose.model("Comment", commentSchema);
