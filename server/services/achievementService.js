import User from "../models/User.js";

export const syncViewAchievements = async (user) => {
  if (!user) {
    console.log("❌ ACHIEVEMENT: no user");
    return;
  }

  console.log("🧠 ACHIEVEMENT CHECK:", {
    username: user.username,
    totalViews: user.totalViews,
    achievements: user.achievements,
  });

  const updates = {};

  if (user.totalViews >= 10000 && !user.achievements?.upload_10) {
    updates["achievements.upload_10"] = true;
  }

  if (user.totalViews >= 50000 && !user.achievements?.upload_50) {
    updates["achievements.upload_50"] = true;
  }

  if (Object.keys(updates).length === 0) {
    console.log("ℹ️ ACHIEVEMENT: nothing to unlock");
    return;
  }

  await User.updateOne(
    { _id: user._id },
    { $set: updates }
  );

  console.log("🏆 ACHIEVEMENT UNLOCKED:", updates);
}