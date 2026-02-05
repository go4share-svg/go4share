import { useEffect, useState } from "react";
import API_BASE from "../api";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const UserStatsPanel = () => {
  const navigate = useNavigate();
  
  const { user } = useUser();
  const [stats, setStats] = useState(null);

  // 🛑 dokud není user
  if (!user) return null;

  const memberSince = stats?.joinedAt
  ? new Date(stats.joinedAt).toLocaleDateString("cs-CZ")
  : "—";

  useEffect(() => {
    if (!user?.username) return;

    fetch(`${API_BASE}/api/users/${user.username}/stats`)
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, [user?.username]);

  if (!stats) {
    return <div className="text-gray-400">Načítám statistiky…</div>;
  }

    return (
    <div className="relative rounded-2xl p-6 ...">

      <button
        onClick={() => navigate(-1)}
        className="absolute top-3 right-3 text-gray-400 hover:text-cyan-400
                   transition-transform hover:scale-110"
        title="Zavřít statistiky"
      >
        ✕
      </button>

      <h2 className="text-lg font-semibold text-cyan-400 mb-4">
        📊 Statistiky – {user.username}
      </h2>



      <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
        <div>🎥 Videa: <b>{stats.videosCount}</b></div>
        <div>👀 Views: <b>{stats.totalViews}</b></div>
        <div>❤️ Likes: <b>{stats.totalLikes}</b></div>
        <div>👥 Followers: <b>{stats.followersCount}</b></div>

        {/* 📊 EXTRA STATS */}
<div className="mt-4 border-t border-cyan-500/10 pt-4 text-sm text-gray-300 space-y-2">

  <div>
    📈 Průměr likes / video:{" "}
    <b className="text-white">{stats.avgLikes}</b>
  </div>

  <div>
    🏆 Nejúspěšnější video:{" "}
    {stats.bestVideo ? (
      <span className="text-cyan-400">
        {stats.bestVideo.title} ({stats.bestVideo.likesCount} ❤️)
      </span>
    ) : (
      <span className="text-gray-500">—</span>
    )}
  </div>

  <div className="mt-4">
  <div className="h-2 w-full rounded-full bg-gray-700 overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"
      style={{ width: `${Math.min(stats.avgLikes * 10, 100)}%` }}
    />
  </div>
  <p className="text-xs text-gray-500 mt-1">
    Aktivita podle engagementu
  </p>
</div>


</div>
      </div>

      <div className="text-xs text-gray-500 mt-4">
  Member since: {memberSince}
</div>



    </div>
  );
};

export default UserStatsPanel;
