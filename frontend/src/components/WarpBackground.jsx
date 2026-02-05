import React from "react";

const WarpBackground = ({ active }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      {/* 🌌 Fialovo-modrý gradient – hluboký prostor */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080818] via-[#0a0018] to-[#050505] opacity-90"></div>

      {/* ✨ Hvězdný prach */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.25)_1px,_transparent_1px)] 
      bg-[length:2px_2px] opacity-30 animate-twinkle"></div>

      {/* 🌠 Dýchající warp energie */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.2),_transparent_70%)] 
      animate-pulse"></div>
    </div>
  );
};

export default WarpBackground;
