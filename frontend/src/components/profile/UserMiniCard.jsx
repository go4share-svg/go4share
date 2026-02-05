import React, { useEffect, useState } from "react";
import API_BASE from "../api";

const UserMiniCard = ({ username }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  if (!username) return;

  const loadUser = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/users/${encodeURIComponent(username)}`
      );

      if (!res.ok) throw new Error("User load failed");

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("❌ MiniCard user load error:", err);
    } finally {
      setLoading(false);
    }
  }; 

  loadUser();
}, [username]);
  if (loading)
    return (
      <div className="p-4 rounded-xl bg-[#0e0e20] border border-cyan-500/20 text-gray-400">
        Načítám profil…
      </div>
    );

  if (!user)
    return (
      <div className="p-4 rounded-xl bg-[#0e0e20] border border-red-500/30 text-red-400">
        Uživatel nenalezen
      </div>
    );

  return (
    <div className="p-5 rounded-2xl bg-[#0b0b19]/90 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <img
          src={user.avatar}
          alt={user.username}
          className="w-16 h-16 rounded-full border border-cyan-500/40 object-cover"
        />

        {/* Základ */}
        <div>
          <h3 className="text-lg font-semibold text-cyan-300">
            {user.username}
          </h3>
          <p className="text-sm text-gray-400">
            Level {user.level}
          </p>
        </div>
      </div>

      {/* Bio (READ ONLY) */}
      <p className="mt-4 text-sm text-gray-300 leading-relaxed">
        {user.bio}
      </p>

      {/* Aura */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-400">Aura</span>
        <span className="font-semibold text-fuchsia-400">
          {user.aura || "none"}
        </span>
      </div>

      {/* Tokeny */}
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-gray-400">Tokeny</span>
        <span className="font-semibold text-yellow-400">
          {Number(user.tokens).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default UserMiniCard;