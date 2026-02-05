import React, { useState } from "react";
import API_BASE from "../api";

const ProfileEditModal = ({ user, onClose, onSave }) => {
  const [username] = useState(user.username); // username neměníme
  const [bio, setBio] = useState(user.bio || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/users/profile/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            bio,
            avatar,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Save failed");
      }

      console.log("✅ Profil uložen:", data.user);

      onSave(data.user); // aktualizuje ProfilePage
      onClose();
    } catch (err) {
      console.error("❌ Chyba při ukládání profilu:", err);
      alert("Uložení profilu selhalo 😿");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0d0d18] border border-cyan-500/20 rounded-2xl p-6 w-[450px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl text-cyan-300 mb-2 text-center">
          🪪 Edit profile
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <img
            src={avatar}
            className="w-24 h-24 mx-auto rounded-full border-2 border-cyan-400"
          />

          <input
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="URL avatara"
            className="bg-[#1b1b2a] p-1 rounded text-sm"
          />

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Napiš něco o sobě…"
            className="bg-[#1b1b2a] p-1 rounded text-sm"
          />

          <button
            type="submit"
            disabled={saving}
            className="mt-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 py-2 rounded font-semibold disabled:opacity-50"
          >
            {saving ? "Ukládám…" : "💾 Uložit změny"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
