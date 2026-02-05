import express from "express";
import User from "../models/User.js";
import TokenLog from "../models/TokenLog.js";
import Notification from "../models/Notification.js";

const router = express.Router();


/* =========================
   💸 USER → REQUEST PAYOUT
   ========================= */
router.post("/request", async (req, res) => {
    console.log("🔥 PAYOUT REQUEST BODY:", JSON.stringify(req.body, null, 2));
  try {
    const { username, amount, payout } = req.body;

    if (!username || !amount || amount < 1000) {
      return res.status(400).json({ success: false });
    }

    const user = await User.findOne({ username });
    if (!user || user.tokens < amount) {
      return res.status(400).json({ success: false });
    }

    const log = await TokenLog.create({
      userId: user._id,
      amount: -amount,
      type: "admin",
      reason: "payout request",
      status: "pending",
      payout: payout || {},   // 🔥 TADY
      balanceAfter: null,
    });

    res.json({
      success: true,
      requestId: log._id,
    });
  } catch (err) {
    console.error("❌ payout request error:", err);
    res.status(500).json({ success: false });
  }
});

router.post("/decision", async (req, res) => {
  try {
    const { requestId, action } = req.body; // approve | reject

    if (!requestId || !["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false });
    }

    const log = await TokenLog.findById(requestId);
    if (!log || log.status !== "pending") {
      return res.status(404).json({ success: false });
    }

    const user = await User.findById(log.userId);
    if (!user) {
      return res.status(404).json({ success: false });
    }

    const io = req.app.get("io"); // 🔥 DŮLEŽITÉ

    // ❌ REJECT
    if (action === "reject") {
      log.status = "rejected";
      await log.save();

      if (io) {
        io.emit("notification", {
          to: user.username,
          message: "❌ Payout request was rejected.",
          type: "warning",
          date: new Date(),
        });
      }

      return res.json({ success: true, status: "rejected" });
    }

    // ✅ APPROVE
    if (user.tokens < Math.abs(log.amount)) {
      return res.status(400).json({ success: false });
    }

    user.tokens += log.amount; // log.amount je záporný
    await user.save();

    log.status = "approved";
    log.balanceAfter = user.tokens;
    await log.save();

    if (io) {
      io.emit("notification", {
        to: user.username,
        message: "✅ Payout approved. Funds will be transferred shortly.",
        type: "success",
        date: new Date(),
      });

      console.log("🔔 payout notification sent to", user.username);
    }

    return res.json({
      success: true,
      status: "approved",
      balance: user.tokens,
    });
  } catch (err) {
    console.error("❌ Payout decision error:", err);
    res.status(500).json({ success: false });
  }
});
/* =========================
   👤 USER → HAS PENDING?
   ========================= */
router.get("/pending/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.json({ pending: false });

    const pending = await TokenLog.exists({
      userId: user._id,
      status: "pending",
    });

    return res.json({ pending: Boolean(pending) });
  } catch {
    return res.json({ pending: false });
  }
});



/* =========================
   👑 ADMIN → LIST PENDING
   ========================= */
router.get("/admin/pending", async (req, res) => {
  try {
    const logs = await TokenLog.find({ status: "pending" })
      .populate("userId", "username")
      .sort({ createdAt: -1 });

    return res.json(logs);
  } catch (err) {
    console.error("❌ Admin pending payouts error:", err);
    return res.status(500).json([]);
  }
});

//CSV Export//

// routes/tokenPayoutRoutes.js
router.get("/admin/export/csv", async (req, res) => {
  try {
    const logs = await TokenLog.find({
      status: { $in: ["pending", "approved"] },
    })
      .populate("userId", "username email")
      .lean();

    const header = [
      "username",
      "email",
      "fullName",
      "iban",
      "swift",
      "country",
      "tokens",
      "amountFiat",
      "currency",
      "status",
      "requestedAt",
    ];

    const rows = logs.map((l) => [
      l.userId?.username || "",
      l.userId?.email || "",
      l.payout?.fullName || "",
      l.payout?.iban || "",
      l.payout?.swift || "",
      l.payout?.country || "",
      Math.abs(l.amount),
      l.payout?.amountFiat || "",
      l.payout?.currency || "EUR",
      l.status,
      new Date(l.createdAt).toISOString(),
    ]);

    const csv =
      header.join(",") +
      "\n" +
      rows.map((r) => r.map(v => `"${v}"`).join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=payouts.csv");
    res.send(csv);
  } catch (err) {
    console.error("❌ CSV export error", err);
    res.status(500).send("CSV export failed");
  }
});


// 👑 ADMIN – MARK PAYOUT AS PAID
router.post("/mark-paid", async (req, res) => {
  try {
    const { payoutId, adminId } = req.body;

    const log = await TokenLog.findById(payoutId);
    if (!log || log.status !== "approved") {
      return res.status(400).json({ success: false });
    }

    log.status = "paid";
    log.paidAt = new Date();
    log.paidBy = adminId;
    await log.save();

    res.json({ success: true });
  } catch (err) {
    console.error("❌ mark-paid error", err);
    res.status(500).json({ success: false });
  }
});



export default router;