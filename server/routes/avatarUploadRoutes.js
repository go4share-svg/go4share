import express from "express";
import multer from "multer";
import path from "path";
import User from "../models/User.js";
import sharp from "sharp";
import fs from "fs";

const router = express.Router();

// ===============================
// 📦 MULTER NASTAVENÍ
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

const upload = multer({ storage });


// ===============================
// 🖼️ VÝBĚR EXISTUJÍCÍHO AVATARA
// POST /api/avatar/select
// ===============================
router.post("/select", async (req, res) => {
  try {
    const { username, avatar } = req.body;

    if (!username || !avatar) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // uložíme cestu na public avatar
    user.avatar = avatar;
    await user.save();

    res.json({ success: true, avatar });
  } catch (err) {
    console.error("❌ Avatar select error:", err);
    res.status(500).json({ success: false });
  }
});


// ===============================
// 📤 UPLOAD VLASTNÍHO AVATARA
// POST /api/avatar/upload
// ===============================
router.post("/upload", upload.single("avatar"), async (req, res) => {
  try {
    const { username } = req.body;

    if (!req.file || !username) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const inputPath = req.file.path;
    const outputFilename = `avatar-${Date.now()}.jpg`;
    const outputPath = path.join("uploads/avatars", outputFilename);

    // 🧠 ZPRACOVÁNÍ OBRÁZKU
    await sharp(inputPath)
      .resize(256, 256, { fit: "cover" }) // 👉 crop do čtverce
      .jpeg({ quality: 80 }) // 👉 komprese
      .toFile(outputPath);

    // ❌ smažeme původní soubor
    fs.unlinkSync(inputPath);

    const avatarPath = `/uploads/avatars/${outputFilename}`;

    user.avatar = avatarPath;
    await user.save();

    res.json({ success: true, avatar: avatarPath });
  } catch (err) {
    console.error("❌ Avatar upload error:", err);
    res.status(500).json({ success: false });
  }
});

export default router;