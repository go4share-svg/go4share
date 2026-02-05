import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { auraClasses } from "../utils/auraClasses";
import API_BASE from "../api";
import { auraShopItems } from "../data/auraShopItems";
import { auraTokenItems } from "../data/auraTokenItems";
import { auraImages } from "../utils/auraImages";


const AuraShopModal = ({ onClose }) => {
  console.log("🧠 AuraShopModal render");
  const { user, setUser } = useUser();
  const [auras, setAuras] = useState([]);

  const auraButtonClass = (state) => {
  switch (state) {
    case "active":
      return "bg-cyan-500 text-black cursor-default";
    case "ready":
      return "bg-gradient-to-r from-green-500 to-cyan-500 hover:opacity-90";
    case "locked":
      return "bg-gray-700 text-gray-400 cursor-not-allowed";
    case "buy":
      return "bg-fuchsia-500 hover:bg-fuchsia-400";
    default:
      return "bg-gray-600";
  }
};

 
  // =====================
  // 📦 LOAD BUY AURAS
  // =====================
  const loadAuras = async () => {
    if (!user?.username) return;

    try {
     const res = await fetch(
  `${API_BASE}/api/auras?username=${encodeURIComponent(user.username)}`
);
      const data = await res.json();
      setAuras(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Load auras failed:", err);
    }
  };

  useEffect(() => {
    loadAuras();
  }, [user?.username]);

  // =====================
  // 🛒 BUY AURA
  // =====================
  const buyAura = async (auraKey) => {
    try {
      const res = await fetch(`${API_BASE}/api/auras/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          auraKey,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error();

      setUser((prev) => ({
        ...prev,
        tokens: data.tokensLeft,
        activeAura: auraKey,
        ownedAuras: prev.ownedAuras?.includes(auraKey)
          ? prev.ownedAuras
          : [...(prev.ownedAuras || []), auraKey],
      }));

      loadAuras();
    } catch (err) {
      console.error("❌ Aura buy failed:", err);
    }
  };

  // =====================
  // ⚡ ACTIVATE AURA
  // =====================
const activateAura = async (auraKey) => {
  try {
    const res = await fetch(`${API_BASE}/api/auras/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.username,
        auraKey,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) return;

    // 🔁 PŘEPIŠ ACTIVE AURU JEDINĚ
    setUser((prev) => ({
      ...prev,
      activeAura: auraKey,
    }));
  } catch (err) {
    console.error("❌ Aura activate failed:", err);
  }
};

console.log("🧠 USER IN AURA SHOP:", {
  achievements: user?.achievements,
  isTopCreator: user?.isTopCreator,
});
 
return (

    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-32 z-[9999]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
    className="bg-[#0b0b12] border border-cyan-500/20 rounded-2xl p-6
                   w-[900px] max-w-[95%] max-h-[70vh] overflow-y-auto text-white"
        
      >
        <h2 className="text-xl font-bold text-cyan-400 mb-4">✨ Aura Shop</h2>

        {/* BUY AURAS */}
        <div className="grid grid-cols-3 gap-4">
          {auras.map((aura) => (
            <div key={aura.key} className="p-4 bg-[#141420] rounded-xl">
              <div className="h-14 mb-2 relative overflow-hidden">
                {auraClasses[aura.key] && (
                  <div
  className={`absolute inset-0 blur-xl opacity-70 ${auraClasses[aura.key]}`}
/>
                )}
              </div>

              <div className="font-semibold">{aura.name}</div>
              <div className="text-sm text-gray-400">
                {aura.price} tokenů
              </div>
{!aura.owned ? (
  <button
    onClick={() => buyAura(aura.key)}
    className={`mt-3 w-full py-1.5 rounded-md text-sm ${auraButtonClass("buy")}`}
  >
    🛒 Buy
  </button>
) : user.activeAura === aura.key ? (
  <button
    disabled
    className={`mt-3 w-full py-1.5 rounded-md text-sm ${auraButtonClass("active")}`}
  >
    ✓ Active
  </button>
) : (
  <button
    onClick={() => activateAura(aura.key)}
    className={`mt-3 w-full py-1.5 rounded-md text-sm ${auraButtonClass("ready")}`}
  >
    Activate
  </button>
)}

            </div>
          ))}
        </div>

   
<h3 className="text-lg font-bold text-fuchsia-400 mt-8 mb-3">
  🔒 Token Auras
</h3>

<div className="grid grid-cols-3 gap-4">
  {auraTokenItems.map((aura) => {
    const unlocked = (user?.tokens || 0) >= aura.minTokens;

    return (
      <div key={aura.id} className={`p-4 bg-[#141420] rounded-xl ${unlocked ? "" : "opacity-50"}`}>
       <div className="mb-2 flex items-center justify-center">
  <div className="relative w-14 h-14 rounded-full">
    {auraClasses[aura.id] && (
      <div
        className={`absolute inset-0 rounded-full ${auraClasses[aura.id]}`}
      />
    )}
  </div>
</div>

        <div className="font-semibold">{aura.name}</div>
        <div className="text-xs text-gray-400 mt-1">{aura.description}</div>

       {!unlocked ? (
  <div className="mt-2 text-xs text-gray-400 text-center">
    🔒 You need <b>{aura.minTokens}</b> tokens 
    <div className="mt-1 opacity-70">
      You have: {user?.tokens || 0}
    </div>
  </div>
) : user.activeAura === aura.id ? (
  <button
    disabled
    className={`mt-3 w-full py-1.5 rounded-md text-sm ${auraButtonClass("active")}`}
  >
    ✓ Active
  </button>
) : (
  <button
    onClick={() => activateAura(aura.id)}
    className={`mt-3 w-full py-1.5 rounded-md text-sm ${auraButtonClass("ready")}`}
  >
    Activate
  </button>
)}
      </div>
    );
  })}
</div>

       {/* LOCKED AURAS */}
<h3 className="text-lg font-bold text-fuchsia-400 mt-8 mb-3">
  🔒 Locked Auras
</h3>

<div className="grid grid-cols-3 gap-4">
  {auraShopItems.map((aura) => {
    const unlocked =
      aura.id === "top_creator"
        ? user?.isTopCreator === true
        : user?.achievements?.[aura.id] === true;

    return (
      <div
        key={aura.id}
        className={`p-4 bg-[#141420] rounded-xl
          ${unlocked ? "hover:scale-[1.02]" : "opacity-50"}
          transition`}
      >
       
        {/* PREVIEW */}
<div className="h-14 mb-2 relative flex items-center justify-center">
  <div className="w-10 h-10 rounded-full bg-[#0b0b12] relative">
    {auraClasses[aura.id] && (
      <div
        className={`absolute inset-0 rounded-full ${auraClasses[aura.id]}`}
      />
    )}
  </div>
</div>

        <div className="font-semibold">{aura.name}</div>
        <div className="text-xs text-gray-400 mt-1">
          {aura.description}
        </div>

        {!unlocked ? (
          <div className="mt-2 text-xs text-gray-300 text-center">
            🔒 {aura.unlockText}
          </div>
        ) : user.activeAura === aura.id ? (
          <button
            disabled
            className="mt-3 w-full py-1.5 rounded-md text-sm bg-gray-600"
          >
            ✓ Active
          </button>
        ) : (
          <button
            onClick={() => activateAura(aura.id)}
            className="mt-3 w-full py-1.5 rounded-md text-sm
              bg-gradient-to-r from-green-500 to-cyan-500"
          >
            Activate
          </button>
        )}
      </div>
    );
  })}
</div>

      </div>
    </div>
  );
};

export default AuraShopModal;