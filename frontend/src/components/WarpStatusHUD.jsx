

// src/components/WarpStatusHUD.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../context/UserContext";


const levels = [
  { name: "Explorer", min: 0, color: "#06b6d4" },
  { name: "Creator", min: 500, color: "#3b82f6" },
  { name: "Innovator", min: 5000, color: "#8b5cf6" },
  { name: "Legend", min: 100000, color: "#d946ef" },
  { name: "Warp Master", min: 500000, color: "#facc15" },
];

export default function WarpStatusHUD() {
  const { user } = useUser();
  const [levelName, setLevelName] = useState("Explorer");
  const [warpEffect, setWarpEffect] = useState(false);
  const tokens = user?.tokens ?? 0;

  const getLevel = (t) => [...levels].reverse().find((l) => t >= l.min) || levels[0];

    const currentLevel = getLevel(tokens);
  const nextLevel = levels.find((l) => l.min > currentLevel.min);
  const progress = nextLevel
    ? Math.min(((tokens - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100, 100)
    : 100;
  const tokensToNext = nextLevel ? Math.max(nextLevel.min - tokens, 0) : 0;

  useEffect(() => {
  setWarpEffect(true);
  const t = setTimeout(() => setWarpEffect(false), 1500);
  return () => clearTimeout(t);
}, [currentLevel.name]);




  return (
    <>
      {/* 🛰️ HUD panel */}
      <div className="fixed top-[5rem] left-0 right-0 z-[9999] px-4 md:ml-[17rem] md:mr-[20rem] pointer-events-none">
        {/* ← TADY můžeš jemně ladit polohu:
             top-[5rem] → výška od horního okraje
             md:ml-56 / md:mr-72 → zarovnání se sidebary
        */}
        <motion.div
  className="pointer-events-auto w-full px-6 py-2 flex justify-between items-center 
             rounded-2xl bg-[#0a0a18]/80 border backdrop-blur-md shadow-lg"
          style={{
            borderColor: `${currentLevel.color}33`,
            boxShadow: warpEffect
              ? `0 0 22px ${currentLevel.color}88`
              : `0 0 10px ${currentLevel.color}33`,
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Level info */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Level: <span style={{ color: currentLevel.color }}>{levelName}</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {nextLevel ? (
                <>
                  Next: <span style={{ color: nextLevel.color }}>{nextLevel.name}</span>{" "}
                  (+{tokensToNext.toLocaleString()} tokens)
                </>
              ) : (
                "Max level reached 🚀"
              )}
            </p>
          </div>

          {/* Tokens */}
          <div className="text-right w-1/2">
            <div className="text-sm text-gray-300 mb-1">
              💎 {tokens.toLocaleString()} Tokens
            </div>
            <div className="w-full h-2 bg-[#111629] rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-2 rounded-full"
                style={{ background: currentLevel.color }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.8 }}
              />
            </div>
          </div>
        </motion.div>
      </div>

{/* ⚡ Warp Energy Bar – permanentní vizuální režim */}
<div
  key="warp-bar"
  className="fixed top-[calc(5rem+4.5rem)] left-0 right-0 z-[9998] px-4 md:ml-[17rem] md:mr-[20rem] pointer-events-none"
  style={{
    position: "fixed",
    top: "calc(5rem + 4.5rem)",
    left: 0,
    right: 0,
    zIndex: 9998,
    paddingLeft: "1rem",
    paddingRight: "1rem",
  }}
>
  <div
    className="h-[6px] rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-400 
               shadow-[0_0_25px_rgba(217,70,239,0.7)] opacity-90 blur-[1px] transition-all duration-500"
  />
</div>
    </>
  );
}