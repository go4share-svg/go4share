import express from "express";
import multer from "multer";
import path from "path";
import Video from "../models/Video.js";
import User from "../models/User.js";

const router = express.Router();

// ===============================
// 📦 MULTER NASTAVENÍ
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, name);
  },
});

const upload = multer({ storage });

// ===============================
// 🎥 UPLOAD VIDEA
// ===============================
router.post("/", upload.single("video"), async (req, res) => {
  try {
    console.log("📩 Upload route aktivována!");
    console.log("📦 Soubor:", req.file);
    console.log("🧾 Body:", req.body);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { title, author } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: "Missing title or author" });
    }

    const filePath = `uploads/videos/${req.file.filename}`;

    const video = new Video({
      title,
      description: "",
      author,
      filePath,
      views: 0,
      likedBy: [],
      likesCount: 0,
      boostTokens: 0,
      boostExpiresAt: null,
    });

    await video.save();

    // 🧑‍💻 přidání videa uživateli
    const user = await User.findOne({ username: author });
    if (user) {
      user.videos.push(video._id);
      await user.save();
    }

    console.log("✅ Uloženo do MongoDB:", video);

    // 🔔 REALTIME: nové video pro všechny
    const io = req.app.get("io");
    if (io) {
      io.emit("videoUploaded", video);
      console.log("📡 Realtime videoUploaded:", video._id);
    } else {
      console.log("⚠️ io instance not found");
    }

    res.status(201).json(video);
  } catch (err) {
    console.error("❌ Video upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

export default router;