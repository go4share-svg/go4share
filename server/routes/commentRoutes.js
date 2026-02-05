// server/routes/commentRoutes.js
import express from "express";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import Video from "../models/Video.js";
import { io } from "../server.js";

const router = express.Router();

// ➕ ADD COMMENT / REPLY
router.post("/", async (req, res) => {
  try {
    const { user, videoId, text, parentId = null } = req.body;

    const comment = await Comment.create({
      user,
      videoId,
      text,
      parentId,
      likedBy: [],
      likesCount: 0,
      reactions: {},
    });

    // =========================
    // 🔔 NOTIFIKACE
    // =========================

    // 🔑 VIDEO
    const video = await Video.findById(videoId).lean();

    // 1️⃣ NOTIFIKACE PRO AUTORA VIDEA
    if (video && video.author && video.author !== user) {
      const note = await Notification.create({
        to: video.author,
        from: user,
        type: "comment",
        text: `${user} commented on your video 💬`,
        emoji: "💬",
        entityId: videoId,
        read: false,
      });

      io.emit("notification", note);
      console.log("🔔 COMMENT → VIDEO AUTHOR (realtime)");
    }

    // 2️⃣ NOTIFIKACE PRO AUTORA KOMENTÁŘE (REPLY)
    if (parentId) {
      const parentComment = await Comment.findById(parentId).lean();

      if (parentComment && parentComment.user && parentComment.user !== user) {
        const note = await Notification.create({
          to: parentComment.user,
          from: user,
          type: "comment",
          text: `${user} replied to your comment 🔊`,
          emoji: "🔊",
          entityId: videoId,
          read: false,
        });

        io.emit("notification", note);
        console.log("🔔 REPLY → COMMENT AUTHOR (realtime)");
      }
    }

    // 🔔 REALTIME – NOVÝ KOMENTÁŘ
    io.emit("commentAdded", comment);
    console.log("💬 Comment added (realtime):", comment._id);

    return res.status(201).json(comment);
  } catch (err) {
    console.error("❌ Comment error:", err);
    return res.status(500).json({ message: "Comment failed" });
  }
});


// 😀 REACT NA KOMENTÁŘ
router.post("/:id/react", async (req, res) => {
  try {
    const { emoji, username } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false });
    }

    if (!comment.reactions) comment.reactions = [];

    // zjistíme, jestli už tenhle user reagoval tímto emoji
    const existing = comment.reactions.find(
      (r) => r.emoji === emoji && r.user === username
    );

    if (existing) {
      // ❌ ODEBRAT REAKCI
      comment.reactions = comment.reactions.filter(
        (r) => !(r.emoji === emoji && r.user === username)
      );
    } else {
      // ➕ PŘIDAT REAKCI
      comment.reactions.push({ emoji, user: username });
    }

    await comment.save();

   

   // 🔔 realtime
    const io = req.app.get("io");
    io.emit("commentReacted", {
      commentId: comment._id,
      reactions: comment.reactions,
    });

    res.json({
      success: true,
      reactions: comment.reactions,
    });
  } catch (err) {
    console.error("❌ React comment error:", err);
    res.status(500).json({ success: false });
  }
});

// ❤️ LIKE / UNLIKE COMMENT
router.post("/like", async (req, res) => {
  try {
    const { commentId, username } = req.body;

    if (!commentId || !username) {
      return res.status(400).json({ message: "Missing data" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.likedBy = comment.likedBy || [];

    const alreadyLiked = comment.likedBy.includes(username);

    if (alreadyLiked) {
      comment.likedBy = comment.likedBy.filter((u) => u !== username);
    } else {
      comment.likedBy.push(username);
    }

    comment.likesCount = comment.likedBy.length;
    await comment.save();

    io.emit("commentLiked", {
      commentId: comment._id,
      likesCount: comment.likesCount,
    });

    return res.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: comment.likesCount,
    });
  } catch (err) {
    console.error("❌ Like comment error:", err);
    return res.status(500).json({ message: "Like failed" });
  }
});


/* =========================
   📥 GET COMMENTS
========================= */
router.get("/:videoId", async (req, res) => {
  try {
    const comments = await Comment.find({ videoId: req.params.videoId }).sort({
      createdAt: -1,
    });

    return res.json(comments);
  } catch (err) {
    console.error("❌ Load comments error:", err);
    return res.status(500).json({ message: "Failed to load comments" });
  }
});


// 🗑️ DELETE COMMENT
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByIdAndDelete(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    io.emit("commentDeleted", { commentId: id });

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete comment error:", err);
    return res.status(500).json({ message: "Delete failed" });
  }
});

export default router;