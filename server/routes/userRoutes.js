import express from "express";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { syncViewAchievements } from "../services/achievementService.js";


const router = express.Router();

console.log("🔥 userRoutes loaded");


// =========================
// 👤 GET PROFILE
// =========================
router.get("/profile/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { viewer } = req.query;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🏆 sync achievements
    await syncViewAchievements(user);

    // 🔁 znovu načti po syncu
    const freshUser = await User.findOne({ username });

    let isFollowing = false;
    if (viewer) {
      const viewerUser = await User.findOne({ username: viewer });
      if (viewerUser && viewerUser.following.includes(freshUser._id)) {
        isFollowing = true;
      }
    }

    res.json({
      username: freshUser.username,
      bio: freshUser.bio,
      avatar: freshUser.avatar,
      tokens: freshUser.tokens,
      level: freshUser.level,
      role: freshUser.role,
      achievements: freshUser.achievements, // ⭐ KRITICKÉ
      isTopCreator: freshUser.isTopCreator,
      followersCount: freshUser.followers?.length || 0,
      followingCount: freshUser.following?.length || 0,
      videosCount: freshUser.videos?.length || 0,
      isFollowing,
      createdAt: freshUser.createdAt,
    });
  } catch (err) {
    console.error("❌ Profile load error:", err);
    res.status(500).json({ message: "Profile load failed" });
  }
});

// =========================
// 👥 USER LIST (MESSAGES)
// =========================
router.get("/list", async (req, res) => {
  try {
    const users = await User.find().select("_id username avatar aura");
    res.json(users);
  } catch (err) {
    console.error("❌ Users list error:", err);
    res.status(500).json({ message: "Failed to load users" });
  }
});

// =========================
// ➕ FOLLOW
// =========================
router.post("/follow", async (req, res) => {
  try {
    const { fromUsername, toUsername } = req.body;

    if (!fromUsername || !toUsername) {
      return res.status(400).json({ message: "Missing data" });
    }

    if (fromUsername === toUsername) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const fromUser = await User.findOne({ username: fromUsername });
    const toUser = await User.findOne({ username: toUsername });

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ už sleduje
    if (fromUser.following.includes(toUser._id)) {
      return res.status(400).json({ message: "Already following" });
    }

    // ✅ FOLLOW
    fromUser.following.push(toUser._id);
    toUser.followers.push(fromUser._id);

    await fromUser.save();
    await toUser.save();

    // 🔔 NOTIFIKACE (BEZ DUPLIKACE)
    const exists = await Notification.findOne({
      to: toUsername,
      from: fromUsername,
      type: "follow",
    });

    if (!exists) {
      const notif = await Notification.create({
        to: toUsername,
        from: fromUsername,
        type: "follow",
        text: `${fromUsername} started following you🚀`,
        emoji: "👤",
        read: false,
      });

      // ⚡ REALTIME NOTIFIKACE
      const io = req.app.get("io");
      if (io) {
        io.emit("notification", notif);
        console.log("📡 REALTIME FOLLOW SENT");
      }

      console.log("🔔 FOLLOW NOTIFICATION CREATED:", notif);
    } else {
      console.log("ℹ️ Follow notification already exists");
    }

    // ✅ DŮLEŽITÉ: odpověď klientovi
    return res.json({ success: true });

  } catch (err) {
    console.error("❌ Follow error:", err);
    return res.status(500).json({ message: "Follow failed" });
  }
});


// =========================
// ➖ UNFOLLOW
// =========================
router.post("/unfollow", async (req, res) => {
  try {
    const { fromUsername, toUsername } = req.body;

    const fromUser = await User.findOne({ username: fromUsername });
    const toUser = await User.findOne({ username: toUsername });

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    fromUser.following = fromUser.following.filter(
      (id) => id.toString() !== toUser._id.toString()
    );

    toUser.followers = toUser.followers.filter(
      (id) => id.toString() !== fromUser._id.toString()
    );

    await fromUser.save();
    await toUser.save();

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Unfollow error:", err);
    res.status(500).json({ message: "Unfollow failed" });
  }
});

// =========================
// ✏️ UPDATE PROFILE (BEZ UPLOADU)
// =========================
router.post("/profile/update", async (req, res) => {
  try {
    const { username, bio } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      success: true,
      user: {
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        aura: user.aura,
        level: user.level,
        tokens: user.tokens,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
      },
    });
  } catch (err) {
    console.error("❌ Profile update error:", err);
    res.status(500).json({ success: false, message: "Profile update failed" });
  }
});

router.get("/:username/stats", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).populate("videos");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🟢 EASY MODE STATS
    const videosCount = user.videos?.length || 0;
    const followersCount = user.followers?.length || 0;

    let totalViews = 0;
    let totalLikes = 0;
    let bestVideo = null;

    user.videos.forEach((v) => {
      totalViews += v.views || 0;
      totalLikes += v.likesCount || 0;

      if (!bestVideo || (v.likesCount || 0) > (bestVideo.likesCount || 0)) {
        bestVideo = {
          title: v.title,
          likesCount: v.likesCount || 0,
        };
      }
    });

    const avgLikes =
      videosCount > 0 ? Math.round(totalLikes / videosCount) : 0;

    res.json({
      username: user.username,
      videosCount,
      followersCount,
      totalViews,
      totalLikes,
      avgLikes,
      bestVideo,
      joinedAt: user.createdAt,
    });
  } catch (err) {
    console.error("❌ USER STATS ERROR:", err);
    res.status(500).json({ message: "Stats failed" });
  }
});



export default router;
