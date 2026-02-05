// routes/admin.js
import express from "express";
import { computeCreatorOfMonth } from "../utils/computeCreatorOfMonth.js";

const router = express.Router();

app.use("/api/admin", adminRoutes);

router.post("/creator-of-month", async (req, res) => {
  try {
    const winner = await computeCreatorOfMonth();
    res.json({ success: true, winner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

export default router;