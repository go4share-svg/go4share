import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import API_BASE from "../api";

const socket = io(API_BASE);

const levels = [
  { name: "Explorer", min: 0, color: "#06b6d4" },
  { name: "Creator", min: 100, color: "#3b82f6" },
  { name: "Innovator", min: 300, color: "#8b5cf6" },
  { name: "Legend", min: 600, color: "#d946ef" },
  { name: "Warp Master", min: 1000, color: "#facc15" },
];

const getLevel = (tokens) => {
  const current = [...levels].reverse().find((lvl) => tokens >= lvl.min) || levels[0];
  const currentIndex = levels.findIndex((lvl) => lvl.name === current.name);
  const next = levels[currentIndex + 1];
  const progress = next
    ? ((tokens - current.min) / (next.min - current.min)) * 100
    : 100;
  return { ...current, progress: Math.min(progress, 100) };
};

const TokenDisplay = () => {
  const [tokens, setTokens] = useState(Number(localStorage.getItem("userTokens")) || 0);
  const [level, setLevel] = useState(getLevel(tokens));
  const [connected, setConnected] = useState(false);

  // 🔌 socket status
  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  // 🔁 sync tokenů z localStorage
  useEffect(() => {
    const syncTokens = () => {
      const total = Number(localStorage.getItem("userTokens")) || 0;
      setTokens(total);
      setLevel(getLevel(total));
    };
    window.addEventListener("tokensUpdated", syncTokens);
    return () => window.removeEventListener("tokensUpdated", syncTokens);
  }, []);

  return (
    <div className="fixed top-2 right-4 z-[99999]">
      <div className="bg-[#0b0b12]/80 backdrop-blur-md border border-cyan-500/20 px-4 py-2 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
        {/* Indikátor připojení */}
        <div
          className={`w-3 h-3 rounded-full ${
            connected ? "bg-green-400 animate-pulse" : "bg-red-500"
          }`}
          title={connected ? "Online" : "Offline"}
        />

        {/* Token info */}
        <div>
          <div className="text-sm font-semibold text-yellow-400">
            🪙 {tokens.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 -mt-0.5">
            {level.name}
          </div>
          <div className="w-20 h-1 bg-[#141420] rounded-full overflow-hidden mt-1">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${level.progress}%`,
                background: `linear-gradient(to right, ${level.color}, #d946ef)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDisplay;



