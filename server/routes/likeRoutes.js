import express from "express";
import Like from "../models/Like.js";
import Notification from "../models/Notification.js";
import Video from "../models/Video.js";

const router = express.Router();

// =========================
// 👍 LIKE VIDEO
// POST /api/likes
// =========================
router.post("/", async (req, res) => {
  try {
    const { user, videoId } = req.body;

    if (!user || !videoId) {
      return res.status(400).json({ message: "Missing data" });
    }

    // zabrání duplicitě (index to hlídá taky)
    const exists = await Like.findOne({ user, videoId });
    if (exists) {
      return res.status(400).json({ message: "Already liked" });
    }

    await Like.create({ user, videoId });

    // 🔔 NOTIFIKACE (bez realtime)
    const video = await Video.findById(videoId);
    if (video && video.user !== user) {
      await Notification.create({
        to: video.user,
        from: user,
        type: "like",
        text: `${user} liked your video`,
        entityId: videoId,
        read: false,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Like error:", err);
    res.status(500).json({ message: "Like failed" });
  }
});

// =========================
// 👎 UNLIKE VIDEO
// DELETE /api/likes
// =========================
router.delete("/", async (req, res) => {
  try {
    const { user, videoId } = req.body;

    await Like.deleteOne({ user, videoId });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Unlike error:", err);
    res.status(500).json({ message: "Unlike failed" });
  }
});

// =========================
// 🔢 COUNT LIKES
// GET /api/likes/count/:videoId
// =========================
router.get("/count/:videoId", async (req, res) => {
  const count = await Like.countDocuments({ videoId: req.params.videoId });
  res.json({ count });
});

// =========================
// ❓ DID I LIKE?
// GET /api/likes/me/:videoId/:user
// =========================
router.get("/me/:videoId/:user", async (req, res) => {
  const exists = await Like.findOne({
    videoId: req.params.videoId,
    user: req.params.user,
  });

  res.json({ liked: !!exists });
});

export default router;