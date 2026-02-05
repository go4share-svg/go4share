import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";


import ProfileEditModal from "../components/ProfileEditModal";
import AvatarPickerModal from "../components/AvatarPickerModal";
import AuraCard from "../components/AuraCard";
import API_BASE from "../api";
import { Link } from "react-router-dom";
import PayoutModal from "../components/PayoutModal";
import VideoCard from "../components/VideoCard";

const ProfilePage = () => {
  const { user, setUser } = useUser();
  const { username } = useParams();
  const [videos, setVideos] = useState([]);

  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const navigate = useNavigate();
  const [hasPendingPayout, setHasPendingPayout] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState(1000);
 const [payoutStatus, setPayoutStatus] = useState(null);
// "pending" | "approved" | "rejected" | null

  const loadPayoutStatus = async () => {
  if (!user?.username) return;

  try {
    const res = await fetch(
      `${API_BASE}/api/payout/pending/${user.username}`
    );
    const data = await res.json();
    setHasPendingPayout(data.pending === true);
  } catch {
    setHasPendingPayout(false);
  }
};

useEffect(() => {
  loadPayoutStatus();
}, [user?.username]);

  const { updateFollowing } = useUser();

useEffect(() => {
  if (!user?.username) return;

  fetch(`${API_BASE}/api/payout/pending/${user.username}`)
    .then(res => res.json())
    .then(data => setHasPendingPayout(data.pending === true))
    .catch(() => setHasPendingPayout(false));
}, [user?.username]);

useEffect(() => {
  const fetchVideos = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/videos/by-user/${username}`
      );

      if (!res.ok) {
        console.error("❌ Failed to load videos");
        return;
      }

      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error("❌ Profile videos error:", err);
    }
  };

  fetchVideos();
}, [username]);



  // 🔄 LOAD PROFILE
  useEffect(() => {
    if (!username || !user) return;

    fetch(
      `${API_BASE}/api/users/profile/${username}?viewer=${user.username}`
    )
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setIsFollowing(data.isFollowing);
      })
      .catch(console.error);
  }, [username, user]);

  const isMe = user?.username === profile?.username;

const handleFollowToggle = async () => {
  const endpoint = isFollowing ? "unfollow" : "follow";

  const res = await fetch(`${API_BASE}/api/users/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fromUsername: user.username,
      toUsername: profile.username,
    }),
  });

  const data = await res.json();
  console.log("FOLLOW RESPONSE", data);

  if (res.ok) {
    // 🔥 1️⃣ lokální UI (profil)
    setIsFollowing(!isFollowing);

    // 🔥 2️⃣ GLOBÁLNÍ STAV (VideoCard, feed, všude)
    updateFollowing(profile.username, !isFollowing);
  }
};

  // ⏳ LOADING
  if (!user || !profile) {
    return (
      <div className="pt-40 text-center text-gray-400 animate-pulse">
        ⏳ Loading profile...
      </div>
    );
  }

 
  const requestPayout = async () => {
  const res = await fetch(`${API_BASE}/api/payout/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: user.username,
      amount: 100,
      reason: "Payout request",
    }),
  });

  const data = await res.json();

  if (data.success) {
    setHasPendingPayout(true); // 🔥 TADY
  }
};

console.log("showPayout:", showPayout);

const submitPayout = async () => {
  if (payoutAmount < 1000) {
    alert("Minimum payout is 1000 tokens");
    return;
  }

  if (payoutAmount > user.tokens) {
    alert("Not enough tokens");
    return;
  }

  const res = await fetch(`${API_BASE}/api/payout/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: user.username,
      amount: payoutAmount, // 🔥 TADY JE ROZDÍL
    }),
  });

  const data = await res.json();

  if (data.success) {
    await loadPayoutStatus();
    setShowPayout(false);
  }
};



  return (
  <>
  <div className="relative max-w-7x1 mx-auto px-6">
    
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 right-6 text-gray-400 hover:text-cyan-400 text-2xl z-50
                   transition-transform hover:scale-110"
      >
        ✕
      </button>

      <div className="flex flex-col md:flex-row items-center gap-6 mt-24 mb-10 border-b border-cyan-500/20 pb-8">
        {/* AVATAR */}
        <div className="flex flex-col items-center gap-2">
          <AuraCard aura={user?.activeAura || "none"}>
            <img
              src={
                profile.avatar?.startsWith("/uploads")
                  ? `${API_BASE}${profile.avatar}`
                  : profile.avatar || "/avatars/default.png"
              }
              onError={(e) =>
                (e.currentTarget.src = "/avatars/default.png")
              }
              alt="Avatar"
              className="w-14 h-14 rounded-full border border-cyan-300
                         transition-transform duration-200
                         hover:scale-[1.03]
                         hover:shadow-[0_0_12px_rgba(34,211,238,0.6)]"
            />
          </AuraCard>
        </div>

        {/* INFO */}
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">
            {profile.username}
          </h1>

          <p className="text-gray-400 mt-1">
            {profile.bio || "— no bio —"}
          </p>

          <div className="flex gap-6 mt-4 text-sm text-gray-300">
            <span>⭐ Level {profile.level}</span>
            <span>💠 Tokens {profile.tokens}</span>
            <span>👥 Followers {profile.followersCount}</span>
          </div>

          <div className="flex gap-3 mt-8">
            {isMe ? (
              <>
                <button
                  onClick={() => setShowEdit(true)}
                  className="bg-gradient-to-r from-cyan-500 to-fuchsia-500
                             text-white px-4 py-1.5 rounded-md text-sm"
                >
                  ⚙️ Edit profile
                </button>

                <button
                  onClick={() => setShowAvatarPicker(true)}
                  className="bg-[#12121a] border border-cyan-500/30
                             text-cyan-400 px-4 py-1.5 rounded-md text-sm"
                >
                  🖼️ Avatar
                </button>
              </>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`px-6 py-2 rounded-md text-sm transition ${
                  isFollowing
                    ? "bg-[#12121a] border border-cyan-500/40 text-cyan-400"
                    : "bg-gradient-to-r from-cyan-600 to-fuchsia-600 text-white"
                }`}
              >
                {isFollowing ? "✓ Following" : "➕ Follow"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* 💰 TOKENS + PAYOUT */}
    {isMe && (
      <div className="max-w-7xl mx-auto px-6">
        <div className="mt-6 p-4 rounded-xl bg-[#0e0e20] border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">💰 Tokeny</span>
            <span className="text-cyan-400 font-semibold">
              {user.tokens}
            </span>
          </div>

          <button
            disabled={hasPendingPayout}
            onClick={() => setShowPayout(true)}
            className={`mt-3 w-full px-4 py-2 rounded-lg font-semibold transition
              ${
                hasPendingPayout
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:scale-[1.02]"
              }`}
          >
            {hasPendingPayout
              ? "⏳ Payout pending"
              : "💸 Request payout"}
          </button>

          {hasPendingPayout && (
            <p className="mt-2 text-xs text-yellow-400">
              ⏳ Payout will be processed shortly
            </p>
          )}
        </div>
      </div>
    )}

    {/* 💸 PAYOUT MODAL */}
    {showPayout && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-[#0b0b19] p-6 rounded-xl w-96">
          <h2 className="text-lg font-semibold mb-4">
            Request payout
          </h2>

          {payoutStatus === "approved" && (
  <div className="mt-2 text-xs text-green-400">
    ✅ Payout approved.  
    Funds will be transferred shortly.
  </div>
)}
          
          <input
  type="number"
  min={1000}
  max={user.tokens}
  step={100}
  value={payoutAmount}
  onChange={(e) => setPayoutAmount(Number(e.target.value))}
  className="w-full px-3 py-2 rounded-lg
             bg-[#111629] border border-cyan-500/30
             text-white mb-2"
/>

<p className="text-xs text-gray-400 mb-4">
  Minimum: 1000 tokens • Available: {user.tokens}
</p>

          <button
            onClick={submitPayout}
            className="w-full px-4 py-2 rounded-lg
                       bg-gradient-to-r from-cyan-500 to-fuchsia-500
                       text-black font-semibold"

                       
         >


           Confirm payout
          </button>


          <button
            onClick={() => setShowPayout(false)}
            className="mt-3 w-full text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>


        </div>
      </div>
    )}

    
    {/* MODALS */}
    {showEdit && (
      <ProfileEditModal
        user={profile}
        onClose={() => setShowEdit(false)}
        onSave={(updated) => {
          setProfile(updated);
          if (isMe) setUser(updated);
        }}
      />
    )}

    {showPayout && <PayoutModal onClose={() => setShowPayout(false)} />}

    {showAvatarPicker && (
      <AvatarPickerModal
        onClose={() => setShowAvatarPicker(false)}
        onAvatarUpdated={(newAvatar) => {
          setProfile((prev) => ({ ...prev, avatar: newAvatar }));
          if (isMe) setUser((prev) => ({ ...prev, avatar: newAvatar }));
        }}
      />
    )}

 {/* 🎬 USER VIDEOS */}
<div className="mt-6">
  {videos.length === 0 ? (
    <p className="text-gray-500 text-center">
      This user hasn’t uploaded any videos yet
    </p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map(video => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  )}
</div>

    {user?.role === "admin" && (
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <button
          onClick={() => navigate("/admin")}
          className="px-4 py-2 rounded-xl
                     bg-gradient-to-r from-fuchsia-500 to-cyan-500
                     text-white font-semibold
                     shadow-[0_0_12px_rgba(217,70,239,0.6)]
                     hover:scale-105 transition"
        >
          🧠 Admin Panel
        </button>
      </div>
    )}
  </>
);
}
export default ProfilePage;