export const getLevelMeta = (level) => {
  const map = {
    Explorer: { label: "Explorer", color: "text-gray-300", icon: "🧭" },
    Creator: { label: "Creator", color: "text-cyan-400", icon: "🎨" },
    Innovator: { label: "Innovator", color: "text-fuchsia-400", icon: "⚡" },
    Legend: { label: "Legend", color: "text-yellow-400", icon: "👑" },
    "Warp Master": { label: "Warp Master", color: "text-red-400", icon: "🌀" },
  };

  return map[level] || map.Explorer;
};