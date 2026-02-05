import express from "express";
import Video from "../models/Video.js";
import User from "../models/User.js";

const router = express.Router();


/**
 * GET /api/feed
 */
router.get("/", async (req, res) => {
  try {
    const { viewer } = req.query;

    const videos = await Video.find().lean();

    // 🔁 seber unikátní autory
    const authors = [...new Set(videos.map(v => v.author))];

    // 👤 načti uživatele
    const users = await User.find(
      { username: { $in: authors } },
      { username: 1, avatar: 1, activeAura: 1 }
    ).lean();

    const userMap = {};
    users.forEach(u => {
      userMap[u.username] = u;
    });

    const normalized = videos.map((v) => {
      const likedArray = Array.isArray(v.likedBy) ? v.likedBy : [];

      return {
        ...v,
        likesCount: likedArray.length,
        likedByMe: viewer ? likedArray.includes(viewer) : false,

        // 🧠 AUTHOR META
        authorAvatar: userMap[v.author]?.avatar || null,
        authorAura: userMap[v.author]?.activeAura || "none",
      };
    });

    res.json(normalized);
  } catch (err) {
    console.error("❌ FEED ERROR:", err);
    res.status(500).json({ message: "Feed load failed" });
  }
});

export default router;
