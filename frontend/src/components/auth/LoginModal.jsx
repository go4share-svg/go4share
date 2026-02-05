import React, { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "../../context/UserContext";
import API_BASE from "../../api";
import ForgotPasswordModal from "./ForgotPasswordModal";

const LoginModal = ({ onClose }) => {
  const { setUser } = useUser();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
      const data = await res.json();

      if (!res.ok || !data.user) {
        throw new Error(data.message || "Login failed");
      }

      const userData = {
        username: data.user.username,
        email: data.user.email,
        tokens: data.user.tokens ?? 0,
        aura: data.user.aura ?? "none",
        level: data.user.level ?? 1,
        bio: data.user.bio ?? "",
        token: data.token,
      };

      localStorage.setItem("warpToken", data.token);
      localStorage.setItem("warpUser", JSON.stringify(userData));

      setUser(userData);
      onClose();
    } catch (err) {
      console.error("❌ Login error:", err);
      alert("❌ Přihlášení selhalo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-[420px] bg-[#0a0a18] border border-cyan-500/30 rounded-2xl p-8 text-white"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-cyan-400">
          Warp Login
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* EMAIL */}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="E-mail"
            required
            className="bg-[#0f0f1f] border border-cyan-500/30 rounded-md px-4 py-2 outline-none text-white placeholder-gray-500"
          />

          {/* PASSWORD */}
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Heslo"
            required
            className="bg-[#0f0f1f] border border-cyan-500/30 rounded-md px-4 py-2 outline-none text-white placeholder-gray-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2 rounded-md bg-gradient-to-r from-cyan-600 to-fuchsia-600 font-semibold"
          >
            {loading ? "Warping..." : "Login"}
          </button>
        </form>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-cyan-400"
        >
          ✕
        </button>

        <button
  type="button"
  onClick={() => {
    setShowForgot(true);
  }}
  className="text-xs text-cyan-400 hover:underline mt-2 text-left"
>
  Zapomněl/a jsi heslo?
</button>

{showForgot && (
  <ForgotPasswordModal onClose={() => setShowForgot(false)} />
)}
      </motion.div>
    </motion.div>
  );
};

export default LoginModal;