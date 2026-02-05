

import React from "react";
import { useUser } from "../context/UserContext";
import API_BASE from "../api";

const AVATARS = [
  "/avatars/avatar-faded.png",
  "/avatars/avatar-explorer.png",
  "/avatars/avatar-cosmic.png",
  "/avatars/avatar-neon.png",
  "/avatars/avatar-warp.png",
  "/avatars/avatar-grind.png",
];

const AvatarPickerModal = ({ onClose, onAvatarUpdated }) => {
  const { user, setUser } = useUser();

  const selectAvatar = async (avatar) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/avatar/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          avatar,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setUser((prev) => ({ ...prev, avatar: data.avatar }));
        onAvatarUpdated?.(data.avatar);
        onClose();
      }
    } catch (e) {
      console.error("Avatar update failed", e);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("username", user.username);

      const res = await fetch(`${API_BASE}/api/users/avatar/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error();

      setUser((prev) => ({ ...prev, avatar: data.avatar }));
      onAvatarUpdated?.(data.avatar);
      onClose();
    } catch (err) {
      console.error("Avatar upload failed", err);
      alert("Avatar upload selhal 😿");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0b0b12] border border-cyan-500/20 rounded-2xl p-6 w-[420px]">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">🧑‍🚀 Vyber avatar</h2>

        <div className="grid grid-cols-3 gap-4">
          {AVATARS.map((src) => (
            <img
              key={src} // 🔑 FIX
              src={src}
              alt="avatar"
              onClick={() => selectAvatar(src)}
              className="w-24 h-24 rounded-full cursor-pointer
                         border-2 border-transparent
                         hover:border-cyan-400 hover:scale-105 transition"
            />
          ))}

          <label
            key="upload" // 🔑 FIX
            className="w-24 h-24 flex items-center justify-center cursor-pointer
                       border-2 border-dashed border-cyan-500/40
                       text-cyan-400 rounded-full
                       hover:border-cyan-400 hover:scale-105 transition"
          >
            ➕ upload
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default AvatarPickerModal;


