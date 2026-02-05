import React from "react";
import { Home, PlusSquare, User, Settings, BarChart3, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useUser();

  return (
    <>
      {/* 🔲 OVERLAY – pouze na mobilu */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

    <aside
  className={`
    fixed left-0 top-0 mt-20 h-[calc(100vh-5rem)] w-64 
    bg-[#0a0a0d] border-r border-cyan-500/10 pb-10 z-50
    overflow-y-auto overflow-x-hidden
    transition-transform duration-300

    /* 📱 MOBIL */
    ${isOpen ? "translate-x-0" : "-translate-x-full"}

    /* 🖥 DESKTOP */
    md:translate-x-0
    md:fixed
    md:block
  `}
>
        {/* 💡 Neon aura vpravo */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-[2px]
          bg-gradient-to-b from-cyan-500 via-fuchsia-500 to-cyan-500
          blur-[6px] opacity-80"
        />

        {/* 🔹 Logo */}
        <div className="flex flex-col items-center mb-12 relative z-10">
          <h1 className="text-3xl font-extrabold select-none tracking-wide">
            <span className="text-cyan-400">Go4</span>
            <span className="text-fuchsia-400">Share</span>
          </h1>
          <div className="mt-2 w-8 h-[2px] bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full" />
        </div>

        {/* 🔸 Navigace */}
        <nav className="flex flex-col items-center gap-8 mt-4 relative z-10">
          <Link
            to="/"
            onClick={onClose}
            className="flex flex-col items-center text-gray-300 hover:text-cyan-400 transition"
          >
            <Home size={24} />
            <span className="text-xs mt-1">Domů</span>
          </Link>

          <Link
            to="/add"
            onClick={onClose}
            className="flex flex-col items-center text-gray-300 hover:text-fuchsia-400 transition"
          >
            <PlusSquare size={24} />
            <span className="text-xs mt-1">Přidat</span>
          </Link>

          <Link
            to={user ? `/profile/${user.username}` : "/"}
            onClick={onClose}
            className="flex flex-col items-center text-gray-300 hover:text-cyan-400 transition"
          >
            <User size={24} />
            <span className="text-xs mt-1">Profil</span>
          </Link>

          <Link
            to="/stats"
            onClick={onClose}
            className="flex flex-col items-center text-gray-300 hover:text-indigo-400 transition"
          >
            <BarChart3 size={24} />
            <span className="text-xs mt-1">Statistiky</span>
          </Link>

          <Link
            to="/settings"
            onClick={onClose}
            className="flex flex-col items-center text-gray-300 hover:text-yellow-400 transition"
          >
            <Settings size={24} />
            <span className="text-xs mt-1">Nastavení</span>
          </Link>

          {/* 🚪 Logout */}
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex flex-col items-center text-gray-300 hover:text-red-500 transition mt-8"
          >
            <LogOut size={24} />
            <span className="text-xs mt-1">Odhlásit</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;















