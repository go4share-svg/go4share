import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import { resend } from "../utils/resend.js";
import { resetPasswordEmail } from "../emails/resetPasswordEmail.js";


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretwarpcode";


/* ==========================
   🧩 REGISTRACE
========================== */
router.post("/register", async (req, res) => {
  try {
    let { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "❌ Vyplň všechna pole",

      });
    }

       if (password.length < 6) {
  return res.status(400).json({
    message: "Heslo musí mít alespoň 6 znaků",
  });
}

    // 🔒 normalizace
    username = username.trim();
    email = email.trim().toLowerCase();

    if (username.includes(" ")) {
      return res.status(400).json({
        success: false,
        message: "❌ Uživatelské jméno nesmí obsahovat mezery",
      });
    }


    // 🔍 kontrola duplicity
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "❌ Uživatel s tímto e-mailem nebo jménem už existuje",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      tokens: 0,
      aura: "none",
      level: 1,
      bio: "",
    });

    await user.save();

   
    console.log("🌟 Nový uživatel registrován:", username);

    return res.status(201).json({
      success: true,
      message: "✅ Registrace úspěšná",
    });
  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "❌ Uživatel s tímto e-mailem nebo jménem už existuje",
      });
    }

    return res.status(500).json({
      success: false,
      message: "❌ Chyba serveru při registraci",
    });
  }
});

// POST /api/auth/forgot-password

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

      console.log("🟡 FORGOT PASSWORD HIT:", email);

    const user = await User.findOne({ email });
      console.log("🟡 USER FOUND:", !!user);
    if (!user) {
      // SECURITY: vždy vrací success
      return res.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");

    console.log("🟡 RESET TOKEN GENERATED");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    /*await resend.emails.send({
      from: "Go4Share <no-reply@go4share.app>",
      to: email,
      subject: "Reset hesla – Go4Share",
      html: resetPasswordEmail(resetUrl),
    });*/
 console.log("🟡 RESET URL:", resetUrl);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ success: false });
  }
});

// POST /api/auth/reset-password

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Missing token or password" });
    }

        if (password.length < 6) {
  return res.status(400).json({
    message: "Heslo musí mít alespoň 6 znaků",
  });
}


    const hashed = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token neplatný nebo expirovaný" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Heslo změněno" });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
/* ==========================
   🔐 LOGIN
========================== */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Vyplň e-mail a heslo",
      });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Uživatel nenalezen",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Nesprávné heslo",
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        tokens: user.tokens,
        aura: user.aura || "none",
        level: user.level || 1,
        bio: user.bio || "",
      },
    });
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    return res.status(500).json({
      message: "Chyba při přihlášení",
    });
  }
});

router.post("/updateLevel", async (req, res) => {
  try {
    const { username, level } = req.body;

    if (!username || typeof level !== "number") {
      return res.status(400).json({ message: "Invalid input" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.level = level;
    await user.save(); // 🔥 TOHLE CHYBĚLO / JE KLÍČ

    console.log("🆙 LEVEL UPDATED:", user.username, user.level);

    res.json({
      success: true,
      level: user.level,
    });
  } catch (err) {
    console.error("❌ UPDATE LEVEL ERROR:", err);
    res.status(500).json({ message: "Level update failed" });
  }
});

export default router;



