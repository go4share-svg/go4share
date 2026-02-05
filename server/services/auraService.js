export const getAuraMultiplier = (user) => {
  if (!user) return 1;

  if (user.aura === "elite") return 1.6;
  if (user.aura === "hot") return 1.4;
  if (user.aura === "warm") return 1.2;
  if (user.aura === "cold") return 0.9;

  return 1;
};