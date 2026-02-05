import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
      

    // 🪪 Profil
    bio: { type: String, default: "Nový člen galaxie Go4Share 🌌" },
    avatar: {
      type: String,
      default: "https://api.dicebear.com/9.x/avataaars/svg?seed=Go4ShareUser",
    },

    role: {
  type: String,
  enum: ["user", "admin"],
  default: "user",
},



 resetPasswordToken: String,
resetPasswordExpires: Date,

    // 💎 Herní / social
    level: { type: Number, default: 1 },
    tokens: { type: Number, default: 100 },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 🎥 Videa
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],

   totalViews: {
      type: Number,
      default: 0,
    },

    achievements: {
  upload_10: { type: Boolean, default: false },
  upload_50: { type: Boolean, default: false },
},

    viewRewardBalance: {
  type: Number,
  default: 0,
},

viewSpendBalance: {
  type: Number,
  default: 0,
},



    // ✨ AURY – SPRÁVNĚ
    ownedAuras: {
      type: [String],
      default: [],
    },
    activeAura: {
      type: String,
      default: "none",
    },

    // ❗️legacy – můžeš zatím nechat, ale už nepoužívat
    aura: {
      type: String,
      default: "none",
    },

  },

  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;


