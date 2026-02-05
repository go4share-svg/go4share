// src/utils/logout.js
export const logout = () => {
  console.log("👋 Warp logout initiated...");
  localStorage.removeItem("warpToken");
  localStorage.removeItem("warpUser");

  // můžeš přidat i další mazání
  localStorage.removeItem("userTokens");

  window.location.href = "/"; // nebo "/login"
};