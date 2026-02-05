import React, { useState } from "react";
import { Moon, Sun, Globe, Bell, User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext"


const SettingsHub = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState("cs");
  const [notifications, setNotifications] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const closeHub = () => {
    setIsClosing(true);
    setTimeout(() => navigate("/"), 400); // čeká na animaci
  };

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center
      bg-black/70 mt-10 backdrop-blur-sm transition-opacity duration-500 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeHub();
      }}
    >
      <div
        className={`relative bg-[#0a0a0d]/90 backdrop-blur-xl border border-cyan-500/20
        rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.1)] w-[480px] max-w-[90%]
        mx-auto p-6 text-white transform transition-all duration-500 ease-in-out ${
          isClosing ? "scale-90 opacity-0 blur-sm" : "scale-100 opacity-100 blur-0"
        }`}
      >
        {/* ❌ Zavírací tlačítko */}
        <button
          onClick={closeHub}
          className="absolute top-3 right-3 text-gray-400 hover:text-fuchsia-400 transition"
        >
          <X size={20} />
        </button>

        {/* 🔹 Header */}
        <div className="flex items-center justify-between mb-6 border-b border-cyan-500/20 pb-3">
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
            ⚙️ Nastavení uživatele
          </h2>
          <div className="flex items-center gap-2 text-gray-400">
            <User size={18} />
            <span>{user?.username}</span>
          </div>
        </div>

        {/* 🌙 Režim zobrazení */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
            <span>Režim zobrazení</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300 ${
              darkMode
                ? "bg-gradient-to-r from-cyan-600 to-fuchsia-600"
                : "bg-gray-700 text-white"
            }`}
          >
            {darkMode ? "Tmavý" : "Světlý"}
          </button>
        </div>

        {/* 🌍 Jazyk */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Globe size={18} />
            <span>Jazyk rozhraní</span>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#111] border border-cyan-500/30 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            <option value="cs">Čeština</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        {/* 🔔 Notifikace */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Bell size={18} />
            <span>Upozornění</span>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300 ${
              notifications
                ? "bg-gradient-to-r from-cyan-600 to-fuchsia-600"
                : "bg-gray-700 text-white"
            }`}
          >
            {notifications ? "Zapnuto" : "Vypnuto"}
          </button>
        </div>

        {/* 🧭 Footer */}
        <div className="text-center mt-6 text-xs text-gray-500 border-t border-cyan-500/10 pt-3">
          <p>© 2026 Go4Share Galaxy System</p>
          <p className="text-gray-600">Warp build v2.3</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsHub;

