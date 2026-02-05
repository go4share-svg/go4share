
import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import TokenLog from "../models/TokenLog.js";
import auth from "../middleware/auth.js";
import tokenPacks from "../config/tokenPacks.js";


const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhookHandler = async (req, res) => {
  console.log("🧪 STRIPE WEBHOOK HIT");
  const sig = req.headers["stripe-signature"];

  let event;

 
  try {
    event = stripe.webhooks.constructEvent(
      
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("🧪 Stripe event type:", event.type);
    } catch (err) {
    console.error("❌ Webhook signature failed:", err.message);
    return res.status(400).send("Webhook Error");
  }

  if (event.type === "checkout.session.completed") {
  const session = event.data.object;

  const existing = await TokenLog.findOne({
    externalSourceId: session.id,
  });

  if (existing) {
    console.log("⚠️ Duplicate webhook ignored:", session.id);
    return res.json({ received: true });
  }

  const userId = session.metadata.userId;
  const tokens = Number(session.metadata.tokens);
  const amountEur = session.amount_total / 100; // ✅ 1, 2, 9, 37
  const currency = session.currency.toUpperCase(); // EUR

  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.tokens += tokens;
    await user.save();

    await TokenLog.create({
      userId: user._id,
      amount: tokens,
      type: "purchase",
      category: "purchase",
      balanceAfter: user.tokens,
      externalSourceId: session.id,

      fiatAmount: amountEur,
      fiatCurrency: currency,
    });

    console.log("✅ Tokens added:", tokens, "to", user.username);
  } catch (err) {
    console.error("❌ Token credit failed:", err);
  }
}

  res.json({ received: true });
};

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);



router.post("/create-session", auth, async (req, res) => {
     console.log("🧪 BODY:", req.body);
  console.log("🧪 USER:", req.user);
  try {
    const { packId } = req.body;
    const userId = req.user.id;

    const pack = tokenPacks[packId];
    if (!pack) {
      return res.status(400).json({ error: "Invalid pack" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${pack.tokens} Tokens`,
            },
            unit_amount: pack.priceCents, // ⚠️ CENY V CENTECH
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        packId,
        tokens: pack.tokens,
      },
      success_url: `${process.env.FRONTEND_URL}/stripe-success`,
      cancel_url: `${process.env.FRONTEND_URL}/stripe-cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe create session error:", err);
    res.status(500).json({ error: "Stripe session failed" });
  }
});

router.post("/refund/:logId", auth, async (req, res) => {
  const log = await TokenLog.findById(req.params.logId).populate("userId");
  if (!log || log.type !== "purchase") {
    return res.status(404).json({ error: "Purchase not found" });
  }

  // anti-duplicate
  if (log.refunded) {
    return res.json({ ok: true, ignored: true });
  }

  // Stripe refund
  await stripe.refunds.create({
    payment_intent: log.externalSourceId, // nebo ulož paymentIntent zvlášť
  });

  // odebrání tokenů
  log.userId.tokens -= log.amount;
  await log.userId.save();

  // log refundu
  await TokenLog.create({
    userId: log.userId._id,
    amount: -log.amount,
    type: "refund",
    category: "refund",
    balanceAfter: log.userId.tokens,
    externalSourceId: log.externalSourceId,
    fiatAmount: log.fiatAmount,
    fiatCurrency: log.fiatCurrency,
  });

  log.refunded = true;
  await log.save();

  res.json({ success: true });
});




/*router.post("/create-intent", async (req, res) => {
  const { username, packId } = req.body;

  // TODO Stripe later
  // const session = await stripe.checkout.sessions.create(...)

  res.json({
    success: true,
    provider: "manual",
    clientSecret: null,
    message: "Payments are in test mode",
  });
});*/

export default router;