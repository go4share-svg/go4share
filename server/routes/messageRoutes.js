import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

/* ===============================
   🔔 UNREAD – KDO MI PSAL
================================ */
router.get("/unread/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const unread = await Message.find({
      receiverId: username,
      read: false,
    }).select("senderId");

    const senders = [...new Set(unread.map(m => m.senderId))];
    res.json(senders);
  } catch (err) {
    res.status(500).json({ error: "Failed to load unread messages" });
  }
});

/* ===============================
   ✅ MARK AS READ
================================ */
router.post("/read", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    await Message.updateMany(
      { senderId, receiverId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

/* ===============================
   📬 HISTORIE KONVERZACE
================================ */
router.get("/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   📨 SEND MESSAGE + 🔔 REALTIME + 🔔 NOTIFICATION
================================ */
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    const msg = new Message({
      senderId,
      receiverId,
      text,
      read: false,
    });

    await msg.save();

    const io = req.app.get("io");

    // 🔔 REALTIME ZPRÁVA (pro chat okno)
    io.emit("messageNew", msg);

    // 🔔 NOTIFIKACE (pro ikonku / badge)
    io.emit("messageNotification", {
      from: senderId,
      to: receiverId,
      text: text.slice(0, 40), // krátký náhled
      createdAt: msg.createdAt,
    });

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   😎 EMOJI REAKCE NA ZPRÁVU
================================ */
router.post("/react", async (req, res) => {
  try {
    const { messageId, emoji, userId } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // 👉 pokud už stejný user reagoval stejným emoji → toggle (odebrat)
    const existing = message.reactions.find(
      (r) => r.emoji === emoji && r.userId === userId
    );

    if (existing) {
      message.reactions = message.reactions.filter(
        (r) => !(r.emoji === emoji && r.userId === userId)
      );
    } else {
      message.reactions.push({ emoji, userId });
    }

    await message.save();

    const io = req.app.get("io");

    // 🔔 REALTIME UPDATE REAKCE
    io.emit("messageReaction", {
      messageId,
      reactions: message.reactions,
    });

    res.json(message.reactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTER DELETE MESSAGES //
router.delete("/between/:user1/:user2", async (req,res) => { 
try { 
const { user1, user2 }= req.params;
await Message.deleteMany({$or: [
{ sender: user1, receiver: user2 }, { sender: user2, receiver:user1 }]
});
res.status(200).json({ message: "Messages between users deleted" });
} catch (err) {
console.error("DELETE BETWEEN ERROR:", err);
res.status(500).json({ error:
"Failed to delete messages" });
}
});

export default router;
