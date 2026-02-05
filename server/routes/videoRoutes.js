import express from "express";
import VideoView from "../models/VideoView.js";
import Video from "../models/Video.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { io } from "../server.js"; 
import mongoose from "mongoose";

const router = express.Router();

const VIEW_COOLDOWN_MINUTES = 10;

/* =========================
   📥 LIST VIDEÍ
========================= */

router.get("/", async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 }).lean();

    const authors = [...new Set(videos.map(v => v.author))];

    const users = await User.find(
      { username: { $in: authors } },
      { username: 1, avatar: 1, activeAura: 1 }
    ).lean();

    const userMap = Object.fromEntries(
      users.map(u => [u.username, u])
    );

    const enrichedVideos = videos.map(video => ({
      ...video,
      authorData: userMap[video.author] || null,
    }));

    res.json(enrichedVideos);
  } catch (err) {
    console.error("❌ Video list error:", err);
    res.status(500).json({ message: "Video list failed" });
  }
});

router.get("/by-user/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const videos = await Video.find({ author: username })
      .sort({ createdAt: -1 })
      .lean();

    const user = await User.findOne(
      { username },
      { avatar: 1 }
    ).lean();

    const enriched = videos.map(v => ({
      ...v,
      authorAvatar: user?.avatar || null,
    }));

    res.json(enriched);
  } catch (err) {
    console.error("❌ by-user error:", err);
    res.status(500).json([]);
  }
});


/* =========================
   📤 UPLOAD VIDEA
========================= */
router.post("/", async (req, res) => {
  try {
    const { title, description, image, author, authorAvatar, filePath } = req.body;

    if (!title || !author || !filePath) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const video = new Video({
      title,
      description,
      image,
      author,
      authorAvatar,
      filePath,
      views: 0,
      likedBy: [],
      likesCount: 0,
      watchTime: 0,
      boostTokens: 0,
      boostExpiresAt: null,
    });

    await video.save();

    const user = await User.findOne({ username: author });
    if (user) {
      user.videos.push(video._id);
      await user.save();
    }

    // 🔔 REALTIME: POŠLI NOVÉ VIDEO VŠEM KLIENTŮM
    const io = req.app.get("io");
    io.emit("videoUploaded", video);

    console.log("🎥 Realtime emit: videoUploaded", video._id);

    res.status(201).json(video);
  } catch (err) {
    console.error("❌ Video upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});
// =========================
// ❤️ LIKE / UNLIKE + NOTIFIKACE
// =========================
router.post("/like", async (req, res) => {
  try {
    const { videoId, username } = req.body;

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    video.likedBy = video.likedBy || [];
    const alreadyLiked = video.likedBy.includes(username);

    if (alreadyLiked) {
      video.likedBy = video.likedBy.filter((u) => u !== username);
    } else {
      video.likedBy.push(username);
    }

    video.likesCount = video.likedBy.length;
    await video.save();

    // 🔔 REALTIME EMIT (LIKE NA VIDEO)
    io.emit("videoLiked", {
      videoId: video._id,
      likesCount: video.likesCount,
      likedBy: video.likedBy,
    });

    // 🔔 NOTIFIKACE PRO AUTORA VIDEA (JEN KDYŽ NELAJKUJE SÁM SEBE)
    if (!alreadyLiked && video.author !== username) {
  const note = await Notification.create({
    type: "like",
    from: username,
    to: video.author,
    text: `${username} liked your video ❤️`,
    emoji: "❤️",
    read: false,
  });

      // 🔌 REALTIME NOTIFIKACE
      io.emit("notification", note);
    }

    return res.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: video.likesCount,
    });
  } catch (err) {
    console.error("❌ Like video error:", err);
    return res.status(500).json({ message: "Like failed" });
  }
});

// 👁️ VIEW VIDEO + AGGREGATE CREATOR VIEWS
router.post("/:id/view", async (req, res) => {

  try {
    const { id } = req.params;
    const { username } = req.body;
    const videoObjectId = new mongoose.Types.ObjectId(id);

    const video = await Video.findById(videoObjectId).select("author");
    if (!video) {
      return res.status(404).json({ success: false });
    }

      console.log("👁 VIEW HIT:", {
  videoId: id,
  author: video.author,
});

    // ⏱️ cooldown
    const since = new Date(
      Date.now() - VIEW_COOLDOWN_MINUTES * 60 * 1000
    );

    // 🔍 anti-spam (jen přihlášený)
    if (username) {
      const recentView = await VideoView.findOne({
        videoId: videoObjectId,
        username,
        createdAt: { $gte: since },
      });

      if (recentView) {
        return res.json({ success: true, skipped: true });
      }
    }

    // 📌 uložit view log
    await VideoView.create({
      videoId: videoObjectId,
      username: username || null,
    });

    // 👁️ VIDEO +1
    await Video.findByIdAndUpdate(videoObjectId, {
      $inc: { views: 1 },
    });

    /* =========================
       👤 CREATOR – REWARD
    ========================= */
    await User.updateOne(
      { username: video.author },
      {
        $inc: {
          totalViews: 1,
          viewRewardBalance: 1,
        },
      }
    );
const creator = await User.findOne(
  { username: video.author },
  { viewRewardBalance: 1 }
);

    // 🏆 ACHIEVEMENTS by views


    if (creator.viewRewardBalance >= 20) {
      const tokensToAdd = Math.floor(
        creator.viewRewardBalance / 20
      );
      const remainder = creator.viewRewardBalance % 20;

      await User.updateOne(
        { username: video.author },
        {
          $inc: { tokens: tokensToAdd },
          $set: { viewRewardBalance: remainder },
        }
      );

      console.log(
        `💰 CREATOR REWARD +${tokensToAdd} token(s) for ${video.author}`
      );
    }

      if (
      username &&
      username !== video.author // autor neplatí za sebe
    ) {
      await User.updateOne(
        { username },
        { $inc: { viewSpendBalance: 1 } }
      );

      const viewer = await User.findOne(
        { username },
        { viewSpendBalance: 1, tokens: 1 }
      );


  console.log("💸 VIEWER STATE:", {
    viewer: viewer?.username,
    spend: viewer?.viewSpendBalance,
    tokens: viewer?.tokens,
    author: video.author,
  });

      if (viewer.viewSpendBalance >= 10 && viewer.tokens > 0) {
        const tokensToRemove = Math.floor(
          viewer.viewSpendBalance / 10
        );
        const remainder = viewer.viewSpendBalance % 10;

        await User.updateOne(
          { username },
          {
            $inc: { tokens: -tokensToRemove },
            $set: { viewSpendBalance: remainder },
          }
        );

        console.log(
          `💸 VIEW COST -${tokensToRemove} token(s) from ${username}`
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ View error:", err);
    res.status(500).json({ success: false });
  }
});
// =========================
// 🗑️ DELETE VIDEO (author OR admin)
// DELETE /api/videos/:id
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const { username, role } = req.body; // 👈 přidáme role

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // 🛡️ autor NEBO admin
    const isAuthor = video.author === username;
    const isAdmin = role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Video.findByIdAndDelete(req.params.id);

    // 🔔 realtime
    io.emit("videoDeleted", { videoId: req.params.id });

    console.log("🗑️ VIDEO DELETED:", req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete video error:", err);
    return res.status(500).json({ message: "Delete failed" });
  }
});



export default router;
