import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

/* 📥 GET NOTIFICATIONS */
router.get("/:username", async (req, res) => {
  try {
    const notes = await Notification.find({ to: req.params.username })
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ✅ MARK AS READ */
router.post("/read", async (req, res) => {
  try {
    const { id } = req.body;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;




