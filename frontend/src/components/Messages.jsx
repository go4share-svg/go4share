import React, { useEffect, useRef, useState } from "react";
import { useUser } from "../context/UserContext";
import { playSound } from "../utils/sound";
import { haptic } from "../utils/haptic";
import API_BASE from "../api";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";



const socket = io(API_BASE, {
  transports: ["websocket", "polling"],
});

const Messages = ({ receiver }) => {
  const { user } = useUser();const sendReaction = async (messageId, emoji) => {
  try {
    await fetch(`${API_BASE}/api/messages/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId,
        emoji,
        userId: sender,
      }),
    });
  } catch (err) {
    console.error("❌ Emoji reaction failed:", err);
  }
};



  const sender = user?.username;
  const emojiRef = useRef(null);

   const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [openReactionFor, setOpenReactionFor] = useState(null);
  const [justSentId, setJustSentId] = useState(null);

  // 🔕 MUTE USERS
  const [mutedUsers, setMutedUsers] = useState(() => {
    return JSON.parse(localStorage.getItem("mutedUsers") || "[]");
  });

  const bottomRef = useRef(null);
  const prevCountRef = useRef(0);
  const messageSoundRef = useRef(null);

//emoji click
  useEffect(() => {
  const handleClickOutside = (e) => {
    if (emojiRef.current && !emojiRef.current.contains(e.target)) {
      setShowEmoji(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

useEffect(() => {
  messageSoundRef.current = new Audio("/sounds/message-in.mp3");
}, []);

  // 🔔 REALTIME: NOVÁ ZPRÁVA
  useEffect(() => {
  if (!sender || !receiver) return;

  socket.on("messageNew", (msg) => {
    // ❌ moje zpráva – ignoruj
    if (msg.senderId === sender) return;

    // ✔️ jen zpráva do aktuální konverzace
    if (msg.senderId === receiver && msg.receiverId === sender) {
      setMessages((prev) => [...prev, msg]);

      // 🔔 zvuk jen pro příchozí DM
      if (
        messageSoundRef.current &&
        !mutedUsers.includes(msg.senderId)
      ) {
        messageSoundRef.current.currentTime = 0;
        messageSoundRef.current.play().catch(() => {});
      }
    }
  });

  return () => {
    socket.off("messageNew");
  };
}, [sender, receiver, mutedUsers]);



  // 🔁 TOGGLE MUTE
  const toggleMute = () => {
    const updated = mutedUsers.includes(receiver)
      ? mutedUsers.filter((u) => u !== receiver)
      : [...mutedUsers, receiver];

    setMutedUsers(updated);
    localStorage.setItem("mutedUsers", JSON.stringify(updated));
  };

  // 📥 LOAD + MARK AS READ
  const loadMessages = async () => {
    if (!receiver || !sender) return;

    const res = await fetch(`${API_BASE}/api/messages/${sender}/${receiver}`);
    const data = await res.json();
    setMessages(data);

    // ✅ MARK AS READ
    await fetch(`${API_BASE}/api/messages/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: receiver,
        receiverId: sender,
      }),
    });
  };

  // 🔄 LOAD ON CHANGE
  useEffect(() => {
    loadMessages();
  }, [sender, receiver]);

        const onEmojiClick = (emojiData) => {
  setText((prev) => prev + emojiData.emoji);
};

   /* =========================
     📨 SEND MESSAGE (SOUND OUT)
  ========================= */
const sendMessage = async () => {
  if (!text.trim() || !sender || !receiver) return;

  try {
    const res = await fetch(`${API_BASE}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: sender,
        receiverId: receiver,
        text,
      }),
    });

    if (!res.ok) throw new Error("Send failed");

    const newMessage = await res.json(); // 🔑 TADY CHYBĚLO

    setMessages((prev) => [...prev, newMessage]); // aby se hned zobrazila
    setJustSentId(newMessage._id);

    setTimeout(() => setJustSentId(null), 600);

    playSound("/sounds/message-out.mp3", 0.25);
    haptic("light");
    setText("");
  } catch (err) {
    console.error("❌ Send message failed:", err);
  }
};

useEffect(() => {
  const unlock = () => {
    if (!messageSoundRef.current) return;

    messageSoundRef.current.play()
      .then(() => {
        messageSoundRef.current.pause();
        messageSoundRef.current.currentTime = 0;
      })
      .catch(() => {});

    window.removeEventListener("click", unlock);
  };

  window.addEventListener("click", unlock);
  return () => window.removeEventListener("click", unlock);
}, []);


  
   /* =========================
     🎨 UI
  ========================= */
  return (
    <div className="flex flex-col h-full bg-[#0e0e15]">
      {/* 🔝 HLAVIČKA */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-500/20">
        <div className="text-cyan-400 font-semibold">
          💬 {receiver}
        </div>

        <button
          onClick={toggleMute}
          className="text-xs text-gray-400 hover:text-white"
        >
          {mutedUsers.includes(receiver) ? "🔕 Unmute" : "🔔 Mute"}
        </button>
      </div>

      {/* 📜 ZPRÁVY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
  {messages.map((m) => {
  const isMe = m.senderId === sender;

  return (
    <div
      key={m._id}
      className={`max-w-[80%] ${isMe ? "ml-auto" : "mr-auto"} group`}
    >
      {/* 💬 BUBLINA ZPRÁVY */}
 <div
  className={`
    px-3 py-2 rounded-lg text-sm
    ${isMe ? "bg-cyan-600 text-white ml-auto" : "bg-[#1b1b2a] text-gray-200 mr-auto"}
    ${m._id === justSentId ? "shadow-[0_0_16px_rgba(34,211,238,0.9)]" : ""}
  `}
>
  {m.text}
</div>
      {/* ❤️ ZOBRAZENÉ REAKCE */}
      {m.reactions?.length > 0 && (
        <div className="flex gap-1 mt-1 text-sm">
          {m.reactions.map((r, i) => (
            <span key={i}>{r.emoji}</span>
          ))}
        </div>
      )}

      {/* 🙂 ŘÁDEK POD ZPRÁVOU */}
      <div
        className={`relative mt-1 text-xs text-gray-400 ${
          isMe ? "text-right" : "text-left"
        }`}
      >
        <button
  onClick={() =>
    setOpenReactionFor(openReactionFor === m._id ? null : m._id)
  }
  className="hover:text-white"
>
  🙂 
</button>

        {/* 🧩 EMOJI MENU – POD ZPRÁVOU */}
       {openReactionFor === m._id && (
  <div
    className="absolute top-full mt-1 flex
               bg-[#141420] border border-cyan-500/30 rounded-lg p-1 gap-1 z-50"
  >
          {["🔥", "😂", "😍", "😎", "👑", "🐐"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
  sendReaction(m._id, emoji);
  setOpenReactionFor(null);
}}
              className="hover:scale-125 transition"
            >
              {emoji}
            </button>
          ))}
          </div>
)}
        
      </div>
    </div>
  );
})}

        <div ref={bottomRef} />
      </div>

      {/* ✍️ INPUT DOLE */}
      <div className="relative shrink-0 border-t border-cyan-500/20 p-3 bg-[#0e0e15] flex gap-2">
  
  {/* 😀 EMOJI BUTTON */}
  <button
    onClick={() => setShowEmoji((prev) => !prev)}
    className="px-3 text-lg text-cyan-400 hover:text-cyan-300"
  >
    🙂
  </button>

  {/* 😀 EMOJI PICKER */}
  {showEmoji && (
    <div className="absolute bottom-14 left-3 z-50">
      <EmojiPicker
        theme="dark"
        onEmojiClick={onEmojiClick}
        searchDisabled={false}
        skinTonesDisabled={false}
        
      />

      <button
  onClick={() => setShowEmoji((prev) => !prev)}
  className="text-xl"
>
  😀
</button>

    </div>
  )}

  <input
    value={text}
    onChange={(e) => setText(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    }}
    placeholder="Napiš zprávu…"
    className="flex-1 bg-transparent border border-cyan-500/20 rounded px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
  />

  <button
    onClick={sendMessage}
    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-sm"
  >
    ➤
  </button>
</div>

    </div>
  );
};

export default Messages;