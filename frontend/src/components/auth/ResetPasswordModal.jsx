console.log("🔥 THIS RESET COMPONENT IS RENDERED");

import React, { useState } from "react";
import API_BASE from "../../api";

const ResetPasswordModal = ({ token, onClose }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Hesla se neshodují");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Reset selhal");
        setLoading(false);
        return;
      }

      setDone(true);
    } catch (err) {
      alert("Chyba serveru");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[360px] p-6 rounded-2xl text-white
                   bg-[#0b0b12] border border-cyan-500/20
                   shadow-[0_0_40px_rgba(34,211,238,0.25)]"
      >
        <h2 className="text-xl font-bold text-center mb-4 text-cyan-400">
          Reset password
        </h2>

        {!done ? (
          <>
            <input
              type="password"
              placeholder="Nové heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-3 p-3 rounded-xl bg-[#0f0f1a]
                         border border-cyan-500/20"
              required
            />

            <input
              type="password"
              placeholder="Potvrdit heslo"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full mb-4 p-3 rounded-xl bg-[#0f0f1a]
                         border border-cyan-500/20"
              required
            />


            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-xl font-semibold
                         bg-gradient-to-r from-cyan-500 to-fuchsia-500
                         hover:opacity-90 transition"
            >
              {loading ? "Ukládám..." : "Změnit heslo"}
            </button>


          </>
        ) : (
          <>
            <p className="text-sm text-gray-300 text-center mb-6">
              Heslo bylo změněno ✅
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-xl
                         bg-cyan-600 hover:bg-cyan-500 transition"
            >
              Přihlásit se
            </button>
          </>
        )}


      </form>
    </div>
  );
};

export default ResetPasswordModal;