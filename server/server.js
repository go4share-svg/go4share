import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";


import authRoutes from "./routes/authRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";      
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import tokenRoutes from "./routes/tokenRoutes.js";
import videoUploadRoutes from "./routes/videoUploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import boostRoutes from "./routes/boostRoutes.js";
import feedRoutes from "./routes/feedRoutes.js";
import auraRoutes from "./routes/auraRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import avatarUploadRoutes from "./routes/avatarUploadRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import tokenPayoutRoutes from "./routes/tokenPayoutRoutes.js";
import stripeRoutes, { stripeWebhookHandler } from "./routes/stripeRoutes.js";



console.log("🔥 server.js: userRoutes import =", userRoutes);

// ✅ Inicializace Express app
const app = express();
const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("📁 SERVER DIR:", __dirname);


export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://10.63.125.124:5173/"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // 🔥 důležité
  
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);
});

app.set("io", io);

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);

app.use(express.json());

app.get("/", (req, res) => {  res.json({ status: "OK", service: "go4share-api" });});
// ✅ Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://10.63.125.124:5173", "http://10.224.62.124:5173"],
  credentials: true,
}));
app.use("/api/stripe", stripeRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ ROUTES (správné pořadí)
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/upload", videoUploadRoutes);
app.use("/api/users", userRoutes);    // upload
app.use("/api/videos", videoRoutes);         // video list, like apod.
app.use("/api/admin", adminRoutes);
app.use("/api/boost", boostRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/auras", auraRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users/avatar", avatarUploadRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/payout", tokenPayoutRoutes);



// ✅ MongoDB připojení
mongoose
  .connect("mongodb+srv://go4share:elohim144@cluster0.p7ldhzd.mongodb.net/go4share")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ Mongo error:", err));

// ✅ Socket.IO logika
io.on("connection", (socket) => {
  console.log("🔌 Připojeno:", socket.id);

  socket.on("sendMessage", (msg) => io.emit("receiveMessage", msg));
  socket.on("sendNotification", (notif) => io.emit("receiveNotification", notif));
  socket.on("disconnect", () => console.log("❌ Odpojeno:", socket.id));
});

// ✅ Spuštění serveru

const PORT = 5000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🌍 Server běží na portu ${PORT}`)
);


