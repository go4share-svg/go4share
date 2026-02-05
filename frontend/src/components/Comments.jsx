import React, { useEffect, useState } from "react";
import API_BASE from "../api";
import { useUser } from "../context/UserContext";
import EmojiPicker from "emoji-picker-react";

const Comments = ({ videoId, username }) => {
  const { user, socket } = useUser();

  // 🔹 STATES
  const [comments, setComments] = useState([]);
  const [openReactionFor, setOpenReactionFor] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

const onEmojiClick = (emojiData) => {
  setText((prev) => prev + emojiData.emoji);
};

// =========================
// ➕ ODESLÁNÍ KOMENTÁŘE / REPLY
// =========================
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!text.trim() || !username) return;

  setLoading(true);
  try {
    const res = await fetch(`${API_BASE}/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: username,
        videoId,
        text,
        parentId: replyTo || null,
      }),
    });

    if (!res.ok) throw new Error("Comment failed");

    setText("");
    setReplyTo(null);
    await fetchComments();
  } catch (err) {
    console.error("❌ Comment failed:", err);
  } finally {
    setLoading(false);
  }
};


  // =========================
  // 📥 NAČTENÍ KOMENTÁŘŮ
  // =========================
  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/comments/${videoId}`);
      const data = await res.json();
      setComments(data || []);
    } catch (err) {
      console.error("❌ Load comments failed:", err);
    }
  };

  useEffect(() => {
    if (open) fetchComments();
  }, [open]);

  // =========================
  // 😀 REAKCE NA KOMENTÁŘ (TOGGLE)
  // =========================
  const reactToComment = async (commentId, emoji) => {
    try {
      const res = await fetch(`${API_BASE}/api/comments/${commentId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emoji,
          username, // 👈 aby server věděl, kdo reaguje
        }),
      });

      const data = await res.json();
      if (!data.success) return;

      // 🔄 aktualizace lokálního stavu
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, reactions: data.reactions } : c
        )
      );
    } catch (err) {
      console.error("❌ React to comment failed:", err);
    }
  };

  useEffect(() => {
  if (open) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [open]);

  // =========================
  // ❤️ LIKE KOMENTÁŘE
  // =========================
  const handleLike = async (commentId) => {
    try {
      const res = await fetch(`${API_BASE}/api/comments/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, username }),
      });

      const data = await res.json();
      if (!data.success) return;

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                likesCount: data.likesCount,
                likedByMe: data.liked,
              }
            : c
        )
      );
    } catch (err) {
      console.error("❌ Like comment failed:", err);
    }
  };

  // =========================
  // 🗑 DELETE
  // =========================
  const handleDelete = async (commentId) => {
    if (!confirm("Opravdu chceš smazat tento komentář?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user?.username,
          isAdmin: user?.isAdmin || false,
        }),
      });

      const data = await res.json();
      if (!data.success) return;

      // odstraní komentář + jeho odpovědi
      setComments((prev) =>
        prev.filter(
          (c) => c._id !== commentId && String(c.parentId) !== String(commentId)
        )
      );
    } catch (err) {
      console.error("❌ Delete comment failed:", err);
    }
  };

  // =========================
  // 🧠 ROOT + REPLIES
  // =========================
  const rootComments = (comments || []).filter((c) => !c.parentId);
  const replies = (comments || []).filter((c) => c.parentId);

  // =========================
  // 🎨 RENDER
  // =========================
  return (
    <div className="mt-2">
      {/* 💬 OTEVŘÍT KOMENTÁŘE */}
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
      >
        💬 {comments.length > 0 && `(${comments.length})`}
      </button>
 {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60"
          onClick={() => setOpen(false)}
        >
  <div
            className="absolute left-1/2 -translate-x-1/2 top-[164px] bottom-[16px]
                       w-[90%] max-w-md bg-[#0e0e20] border border-cyan-500/30 rounded-xl
                       flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 📜 SEZNAM KOMENTÁŘŮ */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {rootComments.length === 0 && (
                <p className="text-gray-400 text-sm">Zatím žádné komentáře</p>
              )}

              {rootComments.map((c) => {
                // 🔢 seskupení reakcí z pole [{emoji,user}]
                const groupedReactions = (c.reactions || []).reduce(
                  (acc, r) => {
                    if (!r?.emoji) return acc;
                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                    return acc;
                  },
                  {}
                );

                return (
                  <div
                    key={c._id}
                    className="text-sm text-gray-300 bg-[#0b0b18]
                               border border-cyan-500/10 rounded px-2 py-1"
                  >
                    {/* TEXT */}
                    <div>
                      <span className="text-cyan-400 font-medium">
                        {c.user}:
                      </span>{" "}
                      {c.text}
                    </div>

                    {/* AKCE */}
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      {/* ❤️ LIKE */}
                      <button
                        onClick={() => handleLike(c._id)}
                        className={`transition ${
                          c.likedByMe
                            ? "text-pink-500 scale-110"
                            : "text-gray-400"
                        }`}
                      >
                        ❤️ {c.likesCount || 0}
                      </button>

                      {/* 💬 ODPOVĚDĚT */}
                      <button
                        onClick={() => setReplyTo(c._id)}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        Odpovědět
                      </button>

                      {/* 🙂 OTEVŘÍT EMOJI */}
                      <button
                        onClick={() =>
                          setOpenReactionFor(
                            openReactionFor === c._id ? null : c._id
                          )
                        }
                        className="text-yellow-400 hover:text-yellow-300 text-xs"
                      >
                        🙂
                      </button>
                    </div>

                    {/* 🧩 EMOJI MENU */}
                    {openReactionFor === c._id && (
                      <div className="mt-1 flex gap-1 bg-[#141420] border border-cyan-500/30 rounded-lg p-1">
                        {["🔥", "😂", "😍", "😎", "👑", "🐐"].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              reactToComment(c._id, emoji);
                              setOpenReactionFor(null);
                            }}
                            className="hover:scale-125 transition"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* 😀 ZOBRAZENÉ REAKCE (klik = toggle) */}
                    {Object.keys(groupedReactions).length > 0 && (
                      <div className="flex gap-2 mt-1 text-sm">
                        {Object.entries(groupedReactions).map(
                          ([emoji, count]) => (
                            <button
                              key={emoji}
                              onClick={() => reactToComment(c._id, emoji)}
                              className="px-2 py-0.5 rounded bg-[#1b1b2a] hover:bg-cyan-600 transition"
                            >
                              {emoji} {count}
                            </button>
                          )
                        )}
                      </div>
                    )}

                    {/* 🗑 SMAZAT */}
                    {(c.user === username || user?.isAdmin) && (
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="text-red-400 hover:text-red-500 text-xs mt-1"
                      >
                        🗑
                      </button>
                    )}

                    {/* REPLIES */}
                    <div className="ml-4 mt-2 space-y-1">
                      {replies
                        .filter(
                          (r) =>
                            String(r.parentId) === String(c._id)
                        )
                        .map((r) => (
                          <div
                            key={r._id}
                            className="text-xs text-gray-300 bg-[#090916]
                                       border border-cyan-500/10 rounded px-2 py-1"
                          >
                            <span className="text-cyan-400 font-medium">
                              {r.user}:
                            </span>{" "}
                            {r.text}
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ✍️ INPUT DOLE – KOMENTÁŘ / REPLY */}
            <div className="shrink-0 border-t border-cyan-500/20 pt-2 bg-[#0e0e20]">
              {replyTo && (
                <div className="text-xs text-cyan-400 mb-1 flex items-center gap-2">
                  Odpovídáš na:
                  <span className="font-semibold">
                    {comments.find((c) => c._id === replyTo)?.user}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex gap-2 relative">

  {/* 🙂 TLAČÍTKO – jen když není reply */}
  {!replyTo && (
    <button
      type="button"
      onClick={() => setShowEmojiPicker((prev) => !prev)}
      className="px-2 text-lg text-yellow-400 hover:text-yellow-300"
    >
      🙂
    </button>
  )}

 {showEmojiPicker && !replyTo && (
    <div className="absolute bottom-14 left-0 z-50">
      <EmojiPicker
        theme="dark"
        onEmojiClick={onEmojiClick}
        searchDisabled={false}
        skinTonesDisabled={false}
      />
    </div>
  )}
  <input
    className="flex-1 bg-transparent border border-cyan-500/20 rounded px-2 py-1 text-sm text-white"
    placeholder={
      replyTo
        ? "Odpovědět na komentář..."
        : "Napiš komentář..."
    }
    value={text}
    onChange={(e) => setText(e.target.value)}
    disabled={loading}
  />

  <button
    type="submit"
    disabled={loading}
    className="px-4 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-sm"
  >
    Odeslat
  </button>
</form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comments;