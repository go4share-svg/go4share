import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import API_BASE from "../api";

const Notifications = ({ onClose }) => {
  const { user } = useUser();
  const [notifs, setNotifs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/api/notifications/${user.username}`)
      .then((r) => r.json())
      .then(setNotifs);
  }, [user.username]);

  // ✅ klik na notifikaci
  const handleClick = async (n) => {
    // označit jako přečtené
    await fetch(`${API_BASE}/api/notifications/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username }),
    });

    // 🔀 navigace podle typu
    if (n.type === "comment" || n.type === "like") {
      if (n.videoId) navigate(`/video/${n.videoId}`);
    }

  if (n.type === "follow") {
  if (typeof n.from === "string" && n.from.length > 0) {
    navigate(`/profile/${n.from}`);
  } else {
    console.warn("❌ Follow notification without from:", n);
  }
}

    onClose?.();
  };

  if (!notifs.length) {
    return (
      <div className="bg-[#0b0b12] p-6 rounded-xl text-gray-400">
        No notifications 🌌
      </div>
    );
  }

  return (
    <div className="bg-[#0b0b12] p-6 rounded-xl w-[420px] max-h-[70vh] overflow-y-auto space-y-3">
      <h3 className="text-cyan-400 font-semibold mb-2">🔔 Notifications</h3>

      {notifs.map((n) => (
        <div
          key={n._id}
          onClick={() => handleClick(n)}
          className={`p-3 rounded border cursor-pointer transition
            ${
              n.read
                ? "bg-[#151526] border-cyan-500/10 text-gray-400"
                : "bg-[#18183a] border-cyan-500/30 text-white"
            }
            hover:bg-[#1f1f3a]`}
        >
          <div>{n.text}</div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(n.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;

