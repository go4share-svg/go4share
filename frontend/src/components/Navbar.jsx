
import React, { useEffect, useRef, useState } from "react";
import { Bell, MessageSquare, Menu } from "lucide-react";
import ReactDOM from "react-dom";
import API_BASE from "../api";

import MessagesLayout from "./MessagesLayout.jsx";
import Notifications from "./Notifications.jsx";
import UserMenu from "./UserMenu.jsx";
import LoginModal from "./auth/LoginModal.jsx";
import RegisterModal from "./auth/RegisterModal.jsx";
import AuraShopModal from "../components/AuraShopModal";
import ShopHubModal from "./shop/ShopHubModal";
import { useUser } from "../context/UserContext";

const Navbar = ({ onOpenSidebar }) => {
  const starsRef = useRef(null);

  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAuraShop, setShowAuraShop] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [bellGlow, setBellGlow] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  
  const { user, setUser, logout, notifications } = useUser();


  const { socket } = useUser();


useEffect(() => {
  if (!socket) return;

  const handler = () => {
    setHasUnreadMessages(true);
  };

  socket.on("messageNotification", handler);
  return () => socket.off("messageNotification", handler);
}, [socket]);

 
  // 🔔 Notifikace glow
  useEffect(() => {
    if (!notifications || notifications.length === 0) {
      setHasUnreadNotifications(false);
      return;
    }

    const hasUnread = notifications.some((n) => n.read === false);
    setHasUnreadNotifications(hasUnread);

    if (hasUnread) {
      setBellGlow(true);
      const t = setTimeout(() => setBellGlow(false), 1000);
      return () => clearTimeout(t);
    }
  }, [notifications]);

  // 🌌 Parallax hvězd
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      if (starsRef.current) {
        starsRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 📩 Nezprávy
 useEffect(() => {
  if (!user?.username) return;

  fetch(`${API_BASE}/api/messages/unread/${user.username}`)
    .then((r) => r.json())
    .then((data) => {
      setHasUnreadMessages(data.length > 0);
    })
    .catch(console.error);
}, [user?.username]);

 const handleMessages = () => {
  setShowMessages((v) => !v);
  setShowNotifications(false);
  setHasUnreadMessages(false); // 🔑 zhasnutí po otevření
};

 const handleNotifications  = ({ onClose }) => {
  setShowNotifications((v) => !v);
  setShowMessages(false);

  // ✅ TADY ŘÍKÁŠ: UŽIVATEL TO VIDĚL
  setHasUnreadNotifications(false);
  setBellGlow(false);
};


  

 return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-[#0a0a0d]/90 backdrop-blur-xl border-b border-cyan-500/10 z-50 flex items-center px-6 overflow-hidden">
        {/* ✨ Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070713] via-[#0a0a0d] to-[#08081a]">
          <div
            ref={starsRef}
            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]
                       animate-stars mix-blend-screen transition-transform duration-500"
          />
        </div>

        <div className="relative w-full max-w-7xl mx-auto flex justify-between items-center">

          {/* 🍔 HAMBURGER – jen na mobilu */}
          <button
            onClick={onOpenSidebar}
            className="md:hidden text-cyan-400 hover:text-cyan-300 transition"
          >
            <Menu size={26} />
          </button>

          {/* LOGO */}
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent select-none">
            
          </h1>

          {/* PRAVÁ ČÁST */}
          <div className="flex items-center gap-4">
            {!user && (
              <>
                <button onClick={() => setShowLogin(true)}>Login</button>
                <button onClick={() => setShowRegister(true)}>Register</button>
              </>
            )}

            {user && (
              <>
                {/* 🧪 TEST TOKENŮ */}
                <button
                  onClick={async () => {
                    const res = await fetch(`${API_BASE}/api/tokens/update`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        username: user.username,
                        change: 50,
                        type: "test_pack",
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setUser((prev) => ({ ...prev, tokens: data.total }));
                    }
                  }}
                  className="bg-gradient-to-r from-cyan-600 to-fuchsia-600 px-3 py-1 rounded text-sm"
                >
                  🧪 +50
                </button>

                <button onClick={() => setShowShop(true)}>💎 </button>

                {/* 💬 Zprávy */}
                <button onClick={handleMessages} className="relative">
                  <MessageSquare
                    className={`w-6 h-6 transition ${
                      hasUnreadMessages ? "text-cyan-400" : "text-gray-300"
                    }`}
                  />
                  {hasUnreadMessages && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                  )}
                </button>

                {/* 🔔 Notifikace */}
                <button onClick={handleNotifications} className="relative">
                  <Bell
                    className={`w-6 h-6 transition ${
                      bellGlow
                        ? "text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.9)]"
                        : "text-gray-300"
                    }`}
                  />
                  {hasUnreadNotifications && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>

                <button onClick={() => setShowAuraShop(true)}>✨</button>
                <UserMenu />
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ================= PORTÁLY ================= */}
      {showMessages &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999]"
            onClick={(e) =>
              e.target === e.currentTarget && setShowMessages(false)
            }
          >
            <div
              className="w-[85vw] max-w-6xl h-[80vh] bg-[#0b0b12] rounded-xl overflow-hidden flex"
              onClick={(e) => e.stopPropagation()}
            >
              <MessagesLayout />
            </div>
          </div>,
          document.body
        )}

      {showNotifications &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowNotifications(false);
              }
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-[420px] max-h-[70vh] overflow-y-auto"
            >
              <Notifications onClose={() => setShowNotifications(false)} />
            </div>
          </div>,
          document.body
        )}

      {/* ================= MODÁLY ================= */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
      {showAuraShop && <AuraShopModal onClose={() => setShowAuraShop(false)} />}
      {showShop && <ShopHubModal onClose={() => setShowShop(false)} />}
    </>
  );
};

export default Navbar;
