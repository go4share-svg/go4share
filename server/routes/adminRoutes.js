import express from "express";
import User from "../models/User.js";
import TokenLog from "../models/TokenLog.js";
import Video from "../models/Video.js";
import fs from "fs";
import path from "path";
import auth from "../middleware/auth.js";

const router = express.Router();

/* =========================
   👥 ADMIN – USERS LIST
========================= */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("username email tokens level role createdAt")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("❌ ADMIN USERS ERROR:", err);
    res.status(500).json({ message: "Failed to load users" });
  }
});

/* =========================
   💳 ADMIN – TOKEN PURCHASES
   ========================= */
router.get("/token-purchases", auth, async (req, res) => {
  try {
    const logs = await TokenLog.find({ type: "purchase" })
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json(logs);
  } catch (err) {
    console.error("❌ Admin purchases error:", err);
    res.status(500).json([]);
  }
});

/* =========================
   🧾 ADMIN – TOKEN LOG (LATEST)
========================= */
router.get("/token-log/latest", async (req, res) => {
  try {
    const logs = await TokenLog.find()
      .populate("userId", "username")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(logs);
  } catch (err) {
    console.error("❌ TOKEN LOG ERROR:", err);
    res.status(500).json({ message: "Failed to load token log" });
  }
});



/* =========================
   🧹 CLEANUP VIDEÍ (TVŮJ KÓD)
========================= */
router.get("/cleanup-videos", async (req, res) => {
  try {
    const videos = await Video.find();
    let removed = 0;

    for (const v of videos) {
      try {
        const isGodson = v.author === "Jay Godson";
        const noFilePath = !v.filePath;

        let fileMissing = false;
        if (v.filePath) {
          const fullPath = path.resolve(v.filePath);
          fileMissing = !fs.existsSync(fullPath);
        }

        if (isGodson || noFilePath || fileMissing) {
          await Video.deleteOne({ _id: v._id });
          removed++;
        }
      } catch (innerErr) {
        console.error("⚠️ Skipping broken video:", v._id, innerErr.message);
      }
    }

    res.json({ success: true, removed });
  } catch (err) {
    console.error("❌ CLEANUP ERROR:", err);
    res.status(500).json({ message: "Cleanup failed" });
  }
});

export default router;
