import React from "react";
import Comments from "./Comments";
import API_BASE from "../api";
import { useUser } from "../context/UserContext";
import { useRef } from "react";
import { auraClasses } from "../utils/auraClasses";
import { formatNumber } from "../utils/formatNumber";
import { Link } from "react-router-dom";

  
const VideoCard = ({ video, onBoost }) => {
     const isBoosted =
  video.boostExpiresAt && new Date(video.boostExpiresAt) > new Date();
  if (!video || !video.filePath) return null;

   const storedUser = JSON.parse(localStorage.getItem("user"));
  const username = storedUser?.username;
  const { user, setUser, updateFollowing } = useUser();
 const isFollowing = user?.followingUsernames?.includes(video.author);

 const hasViewedRef = useRef(false);
const viewTimeoutRef = useRef(null);


 // 🚀 BOOST VIDEO
const handleBoost = async (videoId, tokens) => {
  try {
    const res = await fetch(`${API_BASE}/api/boost/buy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user?.username,
        videoId,
        tokens,
      }),
    });

     const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || "Boost se nepovedl");
      return;
    }

    // 💰 Aktualizuj tokeny uživatele v kontextu
    if (data.userTokens !== undefined) {
      setUser((prev) => ({
        ...prev,
        tokens: data.userTokens,
      }));
    }

    alert(`🚀 Video bylo boostnuto o ${tokens} tokenů!`);
  } catch (err) {
    console.error("❌ Boost error:", err);
    alert("Chyba při boostu 😵");
  }
};

const handleShare = async () => {
  const url = `${window.location.origin}/video/${video._id}`;

  try {
    if (
      navigator.share &&
      window.isSecureContext // 👈 KRITICKÉ
    ) {
      await navigator.share({
        title: video.title,
        text: "Mrkni na tohle video na Go4Share 🚀",
        url,
      });
    } else {
      throw new Error("Share not supported");
    }
  } catch {
    await navigator.clipboard.writeText(url);
    alert("🔗 Odkaz zkopírován do schránky");
  }
};


const handleFollowToggle = async () => {
  const endpoint = isFollowing ? "unfollow" : "follow";

  try {
    const res = await fetch(`${API_BASE}/api/users/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromUsername: user.username,
        toUsername: video.author,
      }),
    });

    const data = await res.json();
    console.log("FOLLOW RESPONSE", data);

    if (!res.ok && data.message !== "Already following") {
      throw new Error(data.message || "Follow failed");
    }

    // 🔁 aktualizuj follow stav v contextu
    updateFollowing(video.author, endpoint === "follow");

  } catch (err) {
    console.error("❌ Follow failed:", err);
  }
};

  // ❤️ LIKE VIDEO
  const handleLike = async () => {
    if (!username) return;

    try {
      const res = await fetch(`${API_BASE}/api/videos/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video._id,
          username,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error("Like failed");
      // ❗ žádný setState tady – realtime to udělá v VideoFeed
    } catch (err) {
      console.error("❌ Like video failed:", err);
    }
  };

 // 🗑️ DELETE VIDEO (author OR admin)
const handleDeleteVideo = async () => {
  if (!user?.username) return;

  const isAdmin = user.role === "admin";

  const ok = window.confirm(
    isAdmin
      ? "ADMIN: Opravdu chceš smazat toto video?"
      : "Opravdu chceš smazat toto video?"
  );
  if (!ok) return;

  try {
    const res = await fetch(`${API_BASE}/api/videos/${video._id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.username,
        role: user.role, // 👈 TO JE KLÍČ
      }),
    });

    const data = await res.json();
    if (!data.success) throw new Error("Delete failed");

    // ❌ NIC NEMAŽEME LOKÁLNĚ
    // 🔥 socket to vyřeší ve VideoFeed
  } catch (err) {
    console.error("❌ Delete video failed:", err);
    alert("Nepodařilo se smazat video");
  }
};


const canWatch =
  user?.tokens > 0 || video.author === user?.username;
  const isLocked = !canWatch;



  return (
  <div className="relative bg-[#0e0e20] border border-cyan-500/20 rounded-xl p-4 flex flex-col">
    
    {/* 🎬 VIDEO WRAPPER */}
    <div className={`relative ${isBoosted ? "boosted-frame" : ""}`}>
      
      {/* 🟣 BOOST BADGE */}
      {isBoosted && (
        <div className="absolute top-2 left-2 boost-badge">
          BOOSTED
        </div>
      )}

      {/* 🔒 LOCK OVERLAY */}
      {isLocked && (
        <div
          className="absolute inset-0 z-10
                     bg-black/70 backdrop-blur-sm
                     flex flex-col items-center justify-center
                     text-center p-4 rounded-lg"
        >
          <p className="text-white font-semibold mb-2">
            🔒 Video is locked
          </p>

          <p className="text-sm text-gray-300 mb-3">
            You need tokens to watch the video
          </p>

          <button
            onClick={() => setShowTokenShop(true)}
            className="px-4 py-2 text-sm rounded-lg
                       bg-gradient-to-r from-cyan-500 to-fuchsia-500
                       text-black font-semibold"
          >
            Add tokens
          </button>

          <p className="mt-2 text-xs text-gray-400">
            Upload & chat work without tokens
          </p>
        </div>
      )}


        <video
  src={`${API_BASE}/${video.filePath}`}
  controls
  className={`w-full h-56 object-cover rounded-lg mb-3 ${
    isLocked ? "opacity-50 blur-[2px]" : ""
  }`}
onPlay={(e) => {
  if (isLocked) {
    e.target.pause();
    alert("🔒 Pro sledování videa potřebuješ tokeny");
    return;
  }

  // ⏱️ započítat view až po 3s sledování
  if (!hasViewedRef.current) {
    viewTimeoutRef.current = setTimeout(async () => {
      hasViewedRef.current = true;

      try {
        await fetch(`${API_BASE}/api/videos/${video._id}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: user?.username || null,
          }),
        });
      } catch (err) {
        console.error("❌ View count failed:", err);
      }
    }, 3000);
  }
}}
/>
      </div>

    {/* 🚀 BOOST BAR */}
    {video.boostExpiresAt &&
      new Date(video.boostExpiresAt) > new Date() && (
        <div className="absolute bottom-0 left-0 w-full h-[3px] overflow-hidden">
          <div
            className="h-full w-full boost-bar"
            style={{ animationDuration: "2.8s" }}
          />
        </div>
      )}
      
<Link
  to={`/profile/${video.author}`}
  className="flex items-center gap-2 mb-2 hover:opacity-80 transition"
>
  <div className="relative w-6 h-6">
    {video.authorAura && video.authorAura !== "none" && (
      <span
        className={`absolute -inset-1 rounded-full pointer-events-none
          ${auraClasses[video.authorAura]}`}
      />
    )}

    <img
      src={video.authorAvatar}
      alt={video.author}
      className="relative w-6 h-6 rounded-full object-cover
                 border border-cyan-500/30 bg-[#0b0b12]"
    />
  </div>

  <span className="font-semibold text-white text-sm">
    {video.author}
  </span>
</Link>


{/* 📌 TITULEK */}
<div className="text-sm font-semibold text-gray-200 truncate">
  {video.title}
</div>

    

    {/* ❤️ ACTION BAR */}
    <div className="flex items-center gap-4 mb-3 text-gray-400">
      <span className="text-sm select-none">
        👁 {formatNumber(video.views ?? 0)}
      </span>

      <button
        onClick={handleLike}
        className={`text-sm px-2 py-1 rounded transition ${
          video.likedByMe ? "text-pink-500" : "hover:text-white"
        }`}
      >
        ❤️ {formatNumber(video.likesCount ?? 0)}
      </button>

      <div className="comments-icon-only">
        <Comments videoId={video._id} username={username} />
      </div>

      <button
        onClick={handleShare}
        className="text-sm px-2 py-1 rounded hover:text-cyan-400 transition"
        title="Sdílet"
      >
        🔗
      </button>

      {user?.username !== video.author && (
        <button
          onClick={handleFollowToggle}
          className={`text-sm transition ${
            isFollowing ? "text-yellow-400" : "text-gray-400"
          }`}
        >
          {isFollowing ? "⭐" : "☆"}
        </button>
      )}

     {(user?.username === video.author || user?.role === "admin") && (
  <button
    onClick={handleDeleteVideo}
    className="text-xs hover:text-red-500 transition"
    title={user.role === "admin" ? "Admin delete" : "Delete"}
  >
    🗑 {user.role === "admin" && "Admin"}
  </button>




      )}
    </div>

    {/* 🚀 BOOST BUTTONS */}
    <div className="flex gap-2 mt-2">
      {[20, 50, 100].map((amount) => (
        <button
          key={amount}
          onClick={() => handleBoost(video._id, amount)}
          className="px-3 py-1 text-xs font-semibold rounded
                     bg-cyan-600 hover:bg-cyan-500 transition"
        >
          🚀 {amount}
        </button>
      ))}
    </div>
  </div>
);

};

export default VideoCard;
