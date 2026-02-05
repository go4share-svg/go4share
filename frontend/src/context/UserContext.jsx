import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import API_BASE from "../api";


/* =========================
   🧠 NORMALIZE USER (JEDINÉ MÍSTO)
   ========================= */
const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,

    // aury
    ownedAuras: Array.isArray(user.ownedAuras) ? user.ownedAuras : [],
    activeAura: typeof user.activeAura === "string" ? user.activeAura : "none",

    // views / stats
    totalViews: typeof user.totalViews === "number" ? user.totalViews : 0,

    
    // 🏆 ACHIEVEMENTS – PROPUSTIT CELÉ
    achievements: user.achievements || {},

    // special
    isTopCreator: user.isTopCreator === true,

    // role
    role: user.role ?? "user",
  };
};

const UserContext = createContext(null);

/* =========================
   🔌 SOCKET (JEDNA INSTANCE)
   ========================= */
const socket = io(API_BASE, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  autoConnect: true,
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  /* =========================
     🔔 REALTIME NOTIFICATIONS
     ========================= */
  useEffect(() => {
    if (!user?.username) return;

    const handleNotification = (note) => {
      if (note.to === user.username) {
        setNotifications((prev) => [note, ...prev]);
      }
    };

    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
  }, [user?.username]);

  /* =========================
     📥 LOAD NOTIFICATIONS
     ========================= */
  const loadNotifications = async (username) => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${username}`);
      const data = await res.json();
      setNotifications(data);
    } catch (e) {
      console.error("❌ Failed to load notifications", e);
    }
  };

  /* =========================
     📥 PROFILE SYNC (PRAVDA)
     ========================= */
  useEffect(() => {
    if (!user?.username) return;

    const loadProfile = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/users/profile/${encodeURIComponent(user.username)}`
        );
        if (!res.ok) return;

        const profile = await res.json();

        setUser((prev) =>
          normalizeUser({
            ...prev,
            ...profile,
          })
        );

        loadNotifications(user.username);
      } catch (e) {
        console.error("❌ Profile sync failed", e);
      }
    };

    loadProfile();
  }, [user?.username]);

  /* =========================
     🔁 LOAD FROM LOCALSTORAGE
     ========================= */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(normalizeUser(JSON.parse(stored)));
    }
  }, []);

  /* =========================
     💾 SAVE TO LOCALSTORAGE
     ========================= */
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  /* =========================
     🚪 LOGOUT
     ========================= */
  const logout = () => {
    setUser(null);
    setNotifications([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  /* =========================
   ⭐ FOLLOW / UNFOLLOW SYNC
   ========================= */
const updateFollowing = (targetUsername, isFollow) => {
  setUser((prev) => {
    if (!prev) return prev;

    const current = Array.isArray(prev.followingUsernames)
      ? prev.followingUsernames
      : [];

    return {
      ...prev,
      followingUsernames: isFollow
        ? [...new Set([...current, targetUsername])]
        : current.filter((u) => u !== targetUsername),
    };
  });
};

  return (
   <UserContext.Provider
  value={{
    user,
    setUser,
    logout,
    socket,
    notifications,
    setNotifications,
    loadNotifications,
    updateFollowing, // ⭐ TADY BYLA DÍRA
  }}
>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);