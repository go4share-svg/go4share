import mongoose from "mongoose";

const tokenLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },


  type: {
  type: String,
  enum: [
    "earn",
    "spend",
    "admin",
    "purchase",
    "refund",
    "admin_adjust",
    "upload_bonus",
    "boost",
    "view_reward"
  ],
  required: true,

    refunded: {
    type: Boolean,
    default: false,
  },

  refundSourceId: String, // Stripe refund ID

},



fiatAmount: {
  type: Number,
  default: null,
},

fiatCurrency: {
  type: String,
  default: "EUR",
},

  reason: {
    type: String,
    default: "unspecified",
  },

  sourceId: {
    type: String,
    default: null,
  },

  externalSourceId: {
  type: String,
  unique: true,
  sparse: true, // jen pro purchase
},

  fromUser: {
    type: String,
    default: "system",
  },

  payment: {
  provider: {
    type: String,
    enum: ["manual", "stripe"],
    default: "manual",
  },
  providerSessionId: String, // později Stripe session id
  providerStatus: {
    type: String,
    enum: ["none", "created", "paid", "failed"],
    default: "none",
  },
},



  /** 🆕 PRO STATISTIKY A AUDIT */
  category: {
    type: String,
    enum: [
      "video",
      "reward",
      "purchase",
      "admin_adjustment",
      "bonus",
      "penalty",
      "other",
    ],
    default: "other",
  },

  /** 🆕 snapshot stavu po transakci (NEPOVINNÉ, ALE GOLD) */
  balanceAfter: {
    type: Number,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
 
status: {
  type: String,
  enum: ["pending", "approved", "rejected" ,"paid"],
  default: "approved",
paidAt: {type:Date}

},



// 💸 PAYOUT INFO (jen pro payout logy)
payout: {
  fullName: { type: String },
  country: { type: String },

  iban: { type: String },
  swift: { type: String },

  address: {
    street: { type: String },
    city: { type: String },
    zip: { type: String },
  },

  currency: {
    type: String,
    enum: ["EUR", "USD", "CZK"],
    default: "EUR",
  },

  amountFiat: {
    type: Number,
    default: null,
  },

  rateSnapshot: {
    czkPerToken: { type: Number, default: null },
    eurRate: { type: Number, default: null },
    usdRate: { type: Number, default: null },
  },
},


});

export default mongoose.model("TokenLog", tokenLogSchema);