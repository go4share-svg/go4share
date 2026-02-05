// utils/computeCreatorOfMonth.js
import User from "../models/User.js";

export const computeCreatorOfMonth = async () => {
  // 1️⃣ reset všem
  await User.updateMany({}, { isTopCreator: false });

  // 2️⃣ najdi top uživatele podle počtu videí
  const topUser = await User.findOne()
    .sort({ videosCount: -1 })
    .limit(1);

  if (!topUser) {
    console.log("⚠️ No users found");
    return null;
  }

  // 3️⃣ nastav flag
  topUser.isTopCreator = true;
  await topUser.save();

  console.log("👑 Creator of the Month:", topUser.username);

  return topUser.username;
};