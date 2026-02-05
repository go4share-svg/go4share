console.log("🔥 THIS RESET COMPONENT IS RENDERED");

import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API_BASE from "../api";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !token) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Reset selhal");
        return;
      }

      setDone(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[360px] p-6 rounded-2xl
                   bg-[#0b0b12] border border-cyan-500/20
                   shadow-[0_0_40px_rgba(34,211,238,0.2)]
                   text-white"
      >
        <h2 className="text-xl font-bold text-center mb-4 text-cyan-400">
          🔑 Reset hesla
        </h2>

        {!done ? (
          <>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nové heslo"
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
              {loading ? "Ukládám..." : "Změnit heslo"}
            </button>
          </>
        ) : (
          <p className="text-center text-green-400">
            ✅ Heslo změněno, přesměrovávám…
          </p>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;