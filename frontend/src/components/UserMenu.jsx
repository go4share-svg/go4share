import React, { useState } from "react";
import ReactDOM from "react-dom";
import TokenDashboard from "./TokenDashboard";
import { useUser } from "../context/UserContext";
import API_BASE from "../api";

const UserMenu = () => {
  const { user, setUser, logout } = useUser();

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState(user?.bio || "");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  // 💾 Uložit BIO
  const handleSaveBio = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/users/profile/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: user.username,
            bio: bioDraft,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setUser((prev) => ({ ...prev, bio: bioDraft }));
        setEditing(false);
      }
    } catch (err) {
      console.error("BIO update error", err);
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      {/* Avatar */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-fuchsia-600 text-white font-semibold"
      >
        {user.username?.[0] || "U"}
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div
            className="fixed top-[90px] right-[40px] w-72 bg-[#0a0a0d]
                       border border-cyan-500/20 rounded-xl p-4 z-[9999]"
          >
            <h3 className="text-lg font-semibold text-cyan-400">
              {user.username}
            </h3>

            {/* BIO */}
            {editing ? (
              <textarea
                className="w-full mt-2 p-2 text-sm bg-[#12121a] border border-cyan-500/20 rounded"
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
              />
            ) : (
              <p className="text-gray-400 text-sm mt-2">
                {user.bio || "— žádné bio —"}
              </p>
            )}

            <div className="flex justify-between mt-3">
              {editing ? (
                <button
                  onClick={handleSaveBio}
                  disabled={loading}
                  className="text-cyan-400 text-sm"
                >
                  {loading ? "⏳ Ukládám..." : "💾 Uložit"}
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="text-cyan-400 text-sm"
                >
                  ✏️ Upravit bio
                </button>
              )}

              <button
                onClick={logout}
                className="text-fuchsia-400 text-sm"
              >
                Odhlásit
              </button>
              
          </div>

            {/* TOKENY */}
            <div className="mt-3 text-yellow-400 font-semibold">
              🪙 Tokeny: {user.tokens}
            </div>

            {/* TOKEN DASHBOARD */}
            <div className="mt-3">
              <TokenDashboard compact />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default UserMenu;