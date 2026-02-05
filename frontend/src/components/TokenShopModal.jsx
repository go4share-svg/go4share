console.log("🔥 THIS RESET COMPONENT IS RENDERED");

import { useUser } from "../context/UserContext";
import API_BASE from "../api";




const TokenShopModal = ({ onClose }) => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);

 const buyPack = async (pack) => {
  if (loading) return;
  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/api/tokens/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.username,
        tokens: pack.tokens,
        packId: pack.id,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setUser((prev) => ({
        ...prev,
        tokens: data.total,
      }));
      onClose();
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div className="bg-[#0b0b12] p-6 rounded-xl w-[400px] border border-cyan-500/20">
        <h2 className="text-xl text-cyan-400 mb-4">🪙 Token Shop</h2>

  <p className="text-sm text-gray-400 mb-4">
  Aktuální zůstatek:{" "}
  <span className="text-cyan-400 font-semibold">
    {user.tokens} 🪙
  </span>
</p>

        {PACKS.map((p) => (
          <button
            key={p.id}
            onClick={() => buyPack(p)}
            className="w-full mb-2 bg-gradient-to-r from-cyan-600 to-fuchsia-600 py-2 rounded text-white font-semibold"
          >
            {p.tokens} tokenů – {p.price}
          </button>
        ))}

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-400 hover:text-white"
        >
          Zavřít
        </button>

        <button
  disabled={loading}
  className={`w-full mb-2 py-2 rounded font-semibold transition
    ${
      loading
        ? "bg-gray-600 cursor-not-allowed"
        : "bg-gradient-to-r from-cyan-600 to-fuchsia-600"
    }`}
></button>

      </div>
    </div>
  );
};

export default TokenShopModal;