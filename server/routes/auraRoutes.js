import express from "express";
import Aura from "../models/Aura.js";
import User from "../models/User.js";
import TokenLog from "../models/TokenLog.js";

const router = express.Router();

const ACHIEVEMENT_AURAS = ["upload_10", "upload_50", "top_creator"];

// 🛍️ LIST AUR (USER-AWARE)
router.get("/", async (req, res) => {
  console.log("🟢 GET /api/auras START");

  try {
    const { username } = req.query;
    console.log("👤 username:", username);

    const auras = await Aura.find().sort({ price: 1 });
    console.log("✨ auras loaded:", auras.length);

    let user = null;
    if (username) {
      user = await User.findOne({ username });
      console.log("👤 user loaded:", user);
    }

    const ownedAuras = Array.isArray(user?.ownedAuras)
  ? user.ownedAuras
  : [];

const activeAura =
  typeof user?.activeAura === "string"
    ? user.activeAura
    : "none";

    console.log("🎒 ownedAuras:", ownedAuras);
    console.log("🔥 activeAura:", activeAura);

   const result = auras.map((aura) => ({
  _id: aura._id,
  key: aura.key,
  name: aura.name,
  price: aura.price,
  cosmetic: aura.cosmetic,
  feedWeight: aura.feedWeight,

  // ⬇️ JEDINÁ PRAVDA
  owned: ownedAuras.includes(aura.key),
  active: activeAura === aura.key,
}));

    console.log("✅ result ready");

    res.json(result);
  } catch (err) {
    console.error("❌ GET /api/auras REAL ERROR:", err);
    res.status(500).json({ message: "Aura list failed" });
  }
});


// POST /api/auras/activate
router.post("/activate", async (req, res) => {
  try {
    const { username, auraKey } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🔓 Achievement aury – backend NEBLOKUJE
if (!ACHIEVEMENT_AURAS.includes(auraKey)) {
  if (auraKey === "innovator" && user.tokens < 5000) {
    return res.status(403).json({ success: false, message: "Not unlocked yet" });
  }

  if (auraKey === "legend" && user.tokens < 6000) {
    return res.status(403).json({ success: false, message: "Not unlocked yet" });
  }

  if (auraKey === "warp_master" && user.tokens < 6000) {
    return res.status(403).json({ success: false, message: "Not unlocked yet" });
  }
}

    // 🎯 Aktivace
    user.activeAura = auraKey;
await user.save();
    

    res.json({ success: true, aura: user.aura });
  } catch (err) {
    console.error("❌ Aura activate error:", err);
    res.status(500).json({ success: false });
  }
});

// 💳 BUY AURA (PERMANENTNÍ)
router.post("/buy", async (req, res) => {
  try {
    const { username, auraKey } = req.body;

    const user = await User.findOne({ username });
    const aura = await Aura.findOne({ key: auraKey });

    if (!user || !aura) {
      return res.status(404).json({ message: "User or aura not found" });
    }

    if (user.tokens < aura.price) {
      return res.status(400).json({ message: "Not enough tokens" });
    }

    // ✅ ATOMICKÝ UPDATE (bez validace password/email)
   const updatedUser = await User.findOneAndUpdate(
  { _id: user._id },
  {
    $inc: { tokens: -aura.price },
    $set: { activeAura: aura.key },
    $addToSet: { ownedAuras: aura.key },
  },
  { new: true }
);

    await TokenLog.create({
      userId: user._id,
      amount: -aura.price,
      type: "spend",
      reason: "aura_purchase",
      category: "purchase",
      sourceId: aura._id,
      fromUser: username,
      balanceAfter: updatedUser.tokens,
    });

    res.json({
      success: true,
      aura: aura.key,
      tokensLeft: updatedUser.tokens,
    });
  } catch (err) {
    console.error("❌ Aura buy error:", err);
    res.status(500).json({ message: "Aura purchase failed" });
  }
});
export default router;

