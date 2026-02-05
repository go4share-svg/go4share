import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Video from "../models/Video.js";
import TokenLog from "../models/TokenLog.js";

const router = express.Router();

// Nastavení v1
const BOOST_MULTIPLIER = 2.5; // laditelné
const MIN_BOOST_TOKENS = 20; // minimální nákup
const MINUTES_PER_TOKEN = 5; // tokens * 5 minut

// POST /api/boost/buy
// body: { username, videoId, tokens }
router.post("/buy", async (req, res) => {
  try {
    const { username, videoId, tokens } = req.body;

      const io = req.app.get("io");

    if (!username || !videoId || typeof tokens !== "number") {
      return res.status(400).json({ message: "Invalid input" });
    }
    if (tokens < MIN_BOOST_TOKENS) {
      return res.status(400).json({ message: `Min boost je ${MIN_BOOST_TOKENS} tokenů` });
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid videoId" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

      if (user.tokens < tokens) {
      return res.status(400).json({ message: "Not enough tokens" });
    }

    // odečti tokeny userovi
    user.tokens -= tokens;
    await user.save();

    // přičti boostTokens videu a posuň expiraci
    const addMs = tokens * MINUTES_PER_TOKEN * 60 * 1000;
    const now = Date.now();

    const currentExpiry = video.boostExpiresAt ? video.boostExpiresAt.getTime() : 0;
    const base = Math.max(now, currentExpiry);
    const newExpiry = new Date(base + addMs);

    video.boostTokens = (video.boostTokens || 0) + tokens;
    video.boostExpiresAt = newExpiry;
    await video.save();

    // token log (SPEND)
    await TokenLog.create({
      userId: user._id,
      amount: -tokens,
      type: "spend",
      reason: "boost_visibility",
      sourceId: video._id,
      fromUser: username,
    });

    // po úspěšném uložení boostu
if (io) {
  io.emit("videoBoosted", {
    videoId: video._id,
    boostExpiresAt: video.boostExpiresAt,
  });
}

    return res.json({
      success: true,
      userTokens: user.tokens,
      video: {
        id: video._id,
        boostTokens: video.boostTokens,
        boostExpiresAt: video.boostExpiresAt,
      },
    });

  } catch (err) {
    console.error("❌ boost buy error:", err);
    res.status(500).json({ message: "Boost buy failed" });
  }
});

export default router;