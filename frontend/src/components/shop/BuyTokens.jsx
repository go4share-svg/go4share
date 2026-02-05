import { useState } from "react";
import { useUser } from "../../context/UserContext";
import API_BASE from "../../api";
import TOKEN_PACKS from "../../config/tokenPacks";

const BuyTokens = ({ onDone }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const buyPack = async (pack) => {
  if (loading) return;
  setLoading(true);

  const token = localStorage.getItem("warpToken");
  if (!token) {
    alert("You must be logged in");
    setLoading(false);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/stripe/create-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        packId: pack.id,
      }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  } catch (err) {
    console.error("❌ Stripe session failed", err);
  }

  setLoading(false);
};

  return (
    <div className="space-y-4">
      {/* 💰 CURRENT BALANCE */}
      <p className="text-sm text-gray-400 text-center">
        Current balance:{" "}
        <span className="text-cyan-400 font-semibold">
          {user?.tokens ?? 0} 🪙
        </span>
      </p>

      {TOKEN_PACKS.map((pack) => (
        <div key={pack.id} className="space-y-2 relative group">
          <button
            onClick={() => buyPack(pack)}
            disabled={loading}
            className="w-full py-2 rounded-xl
                       bg-gradient-to-r from-cyan-600 to-fuchsia-600
                       text-white font-semibold
                       hover:opacity-90 transition"
          >
            🪙 {pack.tokens} tokens – {pack.price}
          </button>

          {/* TOOLTIP */}
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2
                       bottom-full mb-2 w-64
                       opacity-0 group-hover:opacity-100
                       transition-opacity duration-200"
          >
            <div
              className="bg-[#0b0b12] border border-cyan-500/20
                         text-xs text-gray-300 rounded-xl p-3
                         shadow-[0_0_20px_rgba(34,211,238,0.25)]"
            >
              <b className="text-cyan-400">🪙 How it works?</b>
              <ul className="mt-1 space-y-1">
                <li>• 1 token ≈ 10 video views</li>
                <li>• You get tokens by purchase or create</li>
                <li>• Watch and boost videos with them</li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Tokens are used to unlock videos and boost content.
          </p>
        </div>
      ))}
    </div>
  );
};

export default BuyTokens;