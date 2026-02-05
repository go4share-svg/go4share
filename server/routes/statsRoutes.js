import express from "express";
import Video from "../models/Video.js";

const router = express.Router();

/* =========================
   📊 RIGHT SIDEBAR VIDEOS
   =========================
   type:
   - new    → nejnovější
   - views  → nejsledovanější
   - likes  → nejhodnocenější
*/
router.get("/sidebar", async (req, res) => {
  try {
    const { type } = req.query;

    let sortStage = { createdAt: -1 };

    if (type === "views") sortStage = { views: -1 };
    if (type === "likes") sortStage = { likesCount: -1 };

    const videos = await Video.aggregate([
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likedBy", []] } },
        },
      },
      { $sort: sortStage },
      { $limit: 4 },
      {
        $project: {
          _id: 1,
          title: 1,
          filePath: 1,
          views: 1,
          likesCount: 1,
          author: 1,
          createdAt: 1,
        },
      },
    ]);

    res.json(videos);
  } catch (err) {
    console.error("❌ Sidebar stats error:", err);
    res.status(500).json([]);
  }
});

export default router;