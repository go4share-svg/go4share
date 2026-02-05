import React, { useEffect, useState } from "react";
import API_BASE from "../api";

const AuraShop = () => {
console.log("🔥 AuraShop render");
  const [auras, setAuras] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAuras = async () => {
    const username = localStorage.getItem("username");
    if (!username) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/auras?username=${encodeURIComponent(username)}`
      );
      const data = await res.json();
      setAuras(data);
    } catch (err) {
      console.error("❌ Aura list error:", err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  loadAuras();
}, []);

const reloadAuras = async () => {
  const username = localStorage.getItem("username");
  if (!username) return;

  const res = await fetch(
    `${API_BASE}/api/auras?username=${encodeURIComponent(username)}`
  );
  const data = await res.json();
  setAuras(data);
};



 const buyAura = async (auraKey) => {
  const username = localStorage.getItem("username");
  if (!username) return;

  try {
    await fetch(`${API_BASE}/api/auras/buy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, auraKey }),
    });

    // 🔥 TADY JE TEN KOUZELNÝ ŘÁDEK
    await reloadAuras();
  } catch (err) {
    console.error("❌ Aura buy error:", err);
  }
};



  const activateAura = async (auraKey) => {
  const username = localStorage.getItem("username");
  if (!username) return;

  try {
    await fetch(`${API_BASE}/api/auras/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, auraKey }),
    });

    // 🔥 ZASE – reload
    await reloadAuras();
  } catch (err) {
    console.error("❌ Aura activate error:", err);
  }
};

console.table(
  auras.map(a => ({
    key: a.key,
    owned: a.owned,
    active: a.active
  }))
);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {auras.map((aura) => (
        <div
          key={aura.key}
          className="bg-[#0b0b12] border border-cyan-500/20 rounded-xl p-4
                     shadow-[0_0_20px_rgba(34,211,238,0.15)]"
        >
          <h3 className="text-cyan-400 font-semibold text-lg">
            {aura.name}
          </h3>

          <p className="text-gray-400 text-sm mt-1">
            {aura.description}
          </p>

          <div className="flex justify-between items-center mt-4">
            <span className="text-cyan-300 font-medium">
              💠 {aura.price} tokenů
            </span>

            {!aura.owned ? (
  <button
    onClick={() => buyAura(aura.key)}
    className="px-3 py-1 rounded-md bg-gradient-to-r
               from-cyan-500 to-fuchsia-500 text-white text-sm"
  >
    Buy
  </button>
) : aura.active ? (
  <button
    disabled
    className="px-3 py-1 rounded-md bg-gray-600 text-white text-sm cursor-default"
  >
    ✓ Active
  </button>
) : (
  <button
    onClick={() => activateAura(aura.key)}
    className="px-3 py-1 rounded-md bg-gradient-to-r
               from-green-500 to-cyan-500 text-white text-sm"
  >
    Activate
  </button>
)}

                     </div>
        </div>
      ))}
    </div>
  );
};

export default AuraShop;