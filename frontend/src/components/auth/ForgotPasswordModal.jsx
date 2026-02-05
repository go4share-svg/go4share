console.log("🔥 THIS RESET COMPONENT IS RENDERED");

import React, { useState } from "react";
import API_BASE from "../../api";

const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
        console.log("📤 Sending forgot-password for:", email);
      await fetch(`${API_BASE}/api/auth/forgot-password`, {
        
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // ⚠️ vždy success – kvůli security
      setSent(true);
    } catch (err) {
      setSent(true);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[360px] p-6 rounded-2xl text-white
                   bg-[#0b0b12] border border-cyan-500/20
                   shadow-[0_0_40px_rgba(34,211,238,0.2)]"
      >
        <h2 className="text-xl font-bold text-center mb-2 text-cyan-400">
          Reset hesla
        </h2>

        {!sent ? (
          <>
            <p className="text-sm text-gray-400 mb-4 text-center">
              Zadej email k účtu. Pokud existuje, pošleme instrukce.
            </p>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              required
              className="w-full mb-4 p-3 rounded-xl
                         bg-[#0f0f1a] border border-cyan-500/20
                         text-white placeholder-gray-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-xl font-semibold
                         bg-gradient-to-r from-cyan-500 to-fuchsia-500
                         hover:opacity-90 transition"
            >
              {loading ? "Odesílám..." : "Odeslat email"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-300 text-center mb-6">
              Pokud účet existuje, poslali jsme ti email s instrukcemi.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-xl
                         bg-cyan-600 hover:bg-cyan-500 transition"
            >
              Zavřít
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default ForgotPasswordModal;