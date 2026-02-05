import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import Messages from "./Messages";
import API_BASE from "../api";

const MessagesLayout = () => {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [unreadUsers, setUnreadUsers] = useState([]);
  const [lastMessages, setLastMessages] = useState({});

  // 🔔 UNREAD USERS
  useEffect(() => {
    if (!user) return;

    fetch(`${API_BASE}/api/messages/unread/${user.username}`)
      .then((r) => r.json())
      .then(setUnreadUsers)
      .catch(console.error);
  }, [user]);

  // 👥 USER LIST
  useEffect(() => {
    if (!user) return;

    fetch(`${API_BASE}/api/users/list`)
      .then((r) => r.json())
      .then((data) =>
        setUsers(data.filter((u) => u.username !== user.username))
      )
      .catch(console.error);
  }, [user]);

  // 💬 POSLEDNÍ ZPRÁVY (preview)
  useEffect(() => {
    if (!user || users.length === 0) return;

    users.forEach((u) => {
      fetch(
        `${API_BASE}/api/messages/${user.username}/${u.username}`
      )
        .then((r) => r.json())
        .then((msgs) => {
          if (msgs.length > 0) {
            const last = msgs[msgs.length - 1];
            setLastMessages((prev) => ({
              ...prev,
              [u.username]: last,
            }));
          }
        })
        .catch(console.error);
    });
  }, [users, user]);

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const sortedUsers = [...users].sort((a, b) => {
  const aUnread = unreadUsers.includes(a.username);
  const bUnread = unreadUsers.includes(b.username);

  // 1️⃣ nepřečtení nahoře
  if (aUnread !== bUnread) return bUnread - aUnread;

  // 2️⃣ fallback: poslední zpráva (nejnovější nahoře)
  const aTime = lastMessages[a.username]?.createdAt || 0;
  const bTime = lastMessages[b.username]?.createdAt || 0;

  return new Date(bTime) - new Date(aTime);
});

  return (
  <div className="flex w-full h-full text-white">

    {/* 👥 LEVÝ PANEL */}
    <div
      className={`
        bg-[#0e0e15] border-r border-cyan-500/20 overflow-y-auto
        w-full md:w-1/3
        ${receiver ? "hidden md:block" : "block"}
      `}
    >
      <h2 className="text-cyan-400 font-semibold p-3 border-b border-cyan-500/10">
        👥 Zprávy
      </h2>

      {sortedUsers.map((u) => {
        const hasUnread = unreadUsers.includes(u.username);
        const lastMsg = lastMessages[u.username];

        return (
          <div
            key={u._id}
            onClick={() => setReceiver(u.username)}
            className={`relative flex items-center gap-3 p-3 cursor-pointer
              hover:bg-[#141420]
              ${receiver === u.username ? "bg-[#141420]" : ""}`}
          >
            {/* AVATAR + AURA */}
            <div className="relative">
              <img
                src={u.avatar || "/default-avatar.png"}
                alt={u.username}
                className="w-10 h-10 rounded-full object-cover border border-cyan-500/30"
              />

              {u.aura && u.aura !== "none" && (
                <span
                  className="absolute inset-0 rounded-full pointer-events-none
                             ring-2 ring-cyan-400/60 blur-[1px]"
                />
              )}
            </div>

            {/* JMÉNO + PREVIEW */}
            <div className="flex-1 overflow-hidden">
              <div className="text-sm">{u.username}</div>

              {lastMsg && (
                <div className="text-xs text-gray-400 truncate">
                  {lastMsg.text}
                </div>
              )}
            </div>

            {/* ČAS */}
            {lastMsg?.createdAt && (
              <span className="text-[10px] text-gray-500">
                {formatTime(lastMsg.createdAt)}
              </span>
            )}

            {/* UNREAD DOT */}
            {hasUnread && (
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2
                           w-2 h-2 rounded-full bg-cyan-400
                           shadow-[0_0_8px_rgba(34,211,238,0.9)]"
              />
            )}
          </div>
        );
      })}
    </div>

    {/* 💬 PRAVÝ PANEL */}
    <div
      className={`
        flex-1 flex flex-col overflow-hidden
        w-full
        ${receiver ? "block" : "hidden md:flex"}
      `}
    >
      {!receiver ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          Vyber uživatele 👉
        </div>
      ) : (
        <Messages receiver={receiver} />
      )}
    </div>
  </div>
);
};

export default MessagesLayout;