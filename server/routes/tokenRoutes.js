import express from "express";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import TokenLog from "../models/TokenLog.js";

const router = express.Router();
/*const io = globalThis.io; */

console.log("🧠 TokenRoutes načteny");


// ===============================
// 🔧 ADMIN / TEST / KOREKCE TOKENŮ
// ===============================
router.post("/update", async (req, res) => {
 
  try {
    const {
      username,
      change,
      type = "admin",
      fromUser = "system",
    } = req.body;

    if (!username || typeof change !== "number") {
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { username },
      { $inc: { tokens: change } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

   /* await TokenLog.create({
      userId: updatedUser._id,
      amount: change,
      type,
      reason: "manual adjustment",
      fromUser,
      balanceAfter: updatedUser.tokens,
    });*/

    try {
      await Notification.create({
        username,
        message: `${change > 0 ? "+" : ""}${change} tokenů (${type})`,
        type: change > 0 ? "success" : "warning",
        date: new Date(),
      });
      //test
      console.log("✅ TOKEN UPDATE DONE");
    } catch {}

    /*if (io) {
      io.emit("tokenUpdated", {
        username,
        total: updatedUser.tokens,
        change,
        type,
      });
    }
      */

    res.json({
      success: true,
      total: updatedUser.tokens,
    });
  } catch (err) {
    console.error("❌ Token update error:", err);
    res.status(500).json({ success: false });
  }
});


// =========================
// 💳 BUY TOKENS (FAKE / DEV)
// POST /api/tokens/purchase
// =========================
router.post("/purchase", async (req, res) => {
  try {
    const { username, tokens, packId, amountFiat, currency } = req.body;

    if (!username || !tokens || tokens <= 0) {
      return res.status(400).json({ success: false });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false });
    }

    // ➕ přičíst tokeny
    user.tokens += tokens;
    await user.save();

    // 🧾 LOG
    await TokenLog.create({
      userId: user._id,
      amount: tokens,
      type: "spend", // nebo "purchase" – klidně změň
      category: "purchase",
      reason: `Token pack: ${packId}`,
      balanceAfter: user.tokens,
      payout: {
        currency: currency || "EUR",
        amountFiat: amountFiat || null,
      },
    });

    res.json({
      success: true,
      total: user.tokens,
    });
  } catch (err) {
    console.error("❌ Token purchase error:", err);
    res.status(500).json({ success: false });
  }
});



// ===============================
// 📊 ZÍSKÁNÍ STAVU TOKENŮ
// ===============================
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: "Uživatel nenalezen" });
    }

    res.json({
      total: user.tokens,
      level: user.level,
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
    });
  } catch (err) {
    console.error("💥 TokenRoutes chyba:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;