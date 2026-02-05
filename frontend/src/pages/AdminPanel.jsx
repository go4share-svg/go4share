import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getLevelMeta } from "../utils/levelHelper";
import API_BASE from "../api";
import { useUser } from "../context/UserContext";
import RefundModal from "../components/admin/RefundModal";

const copyToClipboard = (text) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
};

const AdminPanel = () => {
 
  const { user } = useUser();
  const [token, setToken] = useState(null);
  const [storedTokens, setStoredTokens] = useState(0);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [tokenChange, setTokenChange] = useState(10);
  const [newLevel, setNewLevel] = useState("");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [tokenLog, setTokenLog] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [tokenPurchases, setTokenPurchases] = useState([]);
  const [purchases, setPurchases] = useState([]);
 const [refundTarget, setRefundTarget] = useState(null);
 const [refundLog, setRefundLog] = useState(null);

 useEffect(() => {
  console.log("🧪 refundLog changed:", refundLog);
}, [refundLog]);

  const copyText = (text) => {
  if (!text) return;

  // moderní clipboard (desktop)
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text);
  } else {
    // fallback (mobile safe)
    const input = document.createElement("input");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }
};

const markAsPaid = async (id) => {
  await fetch(`${API_BASE}/api/payout/mark-paid`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      payoutId: id,
      adminId: user._id,
    }),
  });

  setPendingPayouts(prev => prev.filter(p => p._id !== id));
};

useEffect(() => {
  const loadPurchases = async () => {
    const token = localStorage.getItem("warpToken");
    const res = await fetch(`${API_BASE}/api/admin/token-purchases`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setPurchases(data);
  };

  loadPurchases();
}, []);


   

const refreshMe = async () => {
  const token = localStorage.getItem("warpToken");
  if (!token) return;

  const res = await fetch("http://localhost:5000/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  localStorage.setItem("warpUser", JSON.stringify(data.user));
  window.dispatchEvent(new Event("warpUserUpdated"));
};

  const selectedUserData =
    users.find((u) => u.username === selectedUser) || null;
  const levelMeta = selectedUserData
    ? getLevelMeta(selectedUserData.level)
    : null;

     useEffect(() => {
  fetch(`${API_BASE}/api/payout/admin/pending`)
    .then(res => res.json())
    .then(setPendingPayouts)
    .catch(console.error);
}, []);

const handlePayoutDecision = async (id, action) => {
  const res = await fetch(`${API_BASE}/api/payout/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId: id, action }),
  });

  const data = await res.json();

  if (data.success) {
    setPendingPayouts(prev =>
      prev.filter(p => p._id !== id)
    );
  }
};

useEffect(() => {
  const token = localStorage.getItem("warpToken");

  fetch(`${API_BASE}/api/admin/token-purchases`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then(setTokenPurchases)
    .catch(console.error);
}, []);


  
  
  // ✅ Načtení seznamu uživatelů  
const loadUsers = async () => {  
  try {  
    const res = await fetch(`${API_BASE}/api/admin/users`); // 👈 ZMĚNA TADY
    const data = await res.json();

    console.log("👥 ADMIN USERS:", data); // 👈 LOG PRO KONTROLU

    // 👇 bezpečný set
    setUsers(Array.isArray(data) ? data : data.users || []);
  } catch (err) {  
    console.error("❌ Admin user load error:", err);  
  }  
};  

useEffect(() => {  
  loadUsers();  
}, []);


  // ✅ Statistiky vybraného uživatele
  useEffect(() => {
    if (!selectedUserData) {
      setStats(null);
      return;
    }

    fetch(
      `${API_BASE}/api/admin/token-stats/${selectedUserData._id}`
    )
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, [selectedUserData]);

  useEffect(() => {
  fetch(`${API_BASE}/api/admin/token-log/latest`)
    .then(res => res.json())
    .then(setTokenLog)
    .catch(console.error);
}, []);


  // ➕➖ Tokeny
 const handleTokenUpdate = async (type) => {
  if (!selectedUser) {
    alert("Vyber uživatele");
    return;
  }

  setSaving(true);

  try {
    await fetch(`${API_BASE}/api/tokens/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: selectedUser,
        change: type === "add" ? tokenChange : -tokenChange,
        type: "adminPanel",
        fromUser: "Admin",
      }),
    });

    await loadUsers();
    await refreshMe();
    alert("Tokeny upraveny");
  } catch (err) {
    console.error(err);
  }

  setSaving(false);
};


  // 🎚️ Level
 const handleLevelChange = async () => {
  if (!selectedUser || !newLevel) {
    alert("Vyber uživatele i level");
    return;
  }

  setSaving(true);

  try {
    await fetch(`${API_BASE}/api/auth/updateLevel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: selectedUser,
        level: newLevel,
      }),
    });

    await loadUsers(); // 🔥 TOTO JE KLÍČ
    alert("Level změněn");
  } catch (err) {
    console.error(err);
  }

  setSaving(false);
};
 const Stat = ({ label, value }) => (
  <div className="rounded-lg border border-cyan-500/20 p-3">
    <div className="text-xs text-gray-400">{label}</div>
    <div className="text-lg font-semibold text-white">
      {value ?? "—"}
    </div>
  </div>
);

  // 🔐 Guard
 if (!user) {
  return (
    <div className="text-center text-gray-400 pt-20">
      ⏳ Načítám uživatele…
    </div>
  );
}

if (user.role !== "admin") {
  return (
    <div className="text-center text-red-400 pt-20">
      🚫 Warp access denied — admin only
    </div>
  );
}

/* =========================
   💸 ADMIN → HANDLE PAYOUT
   ========================= */
const handleDecision = async (requestId, action) => {
  try {
    const res = await fetch(`${API_BASE}/api/payout/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId,
        action, // "approve" | "reject"
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert("Payout action failed");
      return;
    }

    // 🔥 odstranit z listu pending payouts
    setPendingPayouts((prev) =>
      prev.filter((p) => p._id !== requestId)
    );

  } catch (err) {
    console.error("❌ handleDecision error:", err);
    alert("Server error");
  }
};

const exportPurchasesCSV = () => {
  const rows = [
    ["Username", "Email", "Tokens", "Amount", "Currency", "Date", "StripeSession"],
    ...purchases.map((p) => [
      p.userId?.username,
      p.userId?.email,
      p.amount,
      p.fiatAmount ?? "",
      p.fiatCurrency ?? "EUR",
      new Date(p.createdAt).toISOString(),
      p.externalSourceId,
    ]),
  ];

  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "token-purchases.csv";
  a.click();
};

const refundPurchase = async (logId) => {
  if (!confirm("Refund money and revoke tokens?")) return;

  await fetch(`/api/stripe/refund/${logId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${warpToken}`,
    },
  });

  alert("Refund processed");
};

const handleRefund = async (purchase) => {
  const res = await fetch(
    `${API_BASE}/api/stripe/refund/${purchase._id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${warpToken}`,
      },
    }
  );

  if (!res.ok) {
    alert("Refund failed");
    return;
  }

  setRefundLog(null);
  fetchPurchases();
};


  return (
    <motion.div
      className="p-10 mt-20 text-white rounded-2xl border border-cyan-500/30 bg-[#0b0b19]/80 backdrop-blur-xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-3xl font-bold mb-6">
        👑 Welcome back, {user.username}
      </h1>

      {/* 🕹️ Warp Control Panel */}
      <div className="mb-8 p-6 bg-[#0e0e20] rounded-xl border border-fuchsia-500/30">
        <h2 className="text-xl text-fuchsia-400 mb-4">
          🕹️ Warp Control Panel
        </h2>

        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="bg-[#111629] px-3 py-2 rounded-lg border border-cyan-500/30"
          >
            <option value="">Vyber uživatele</option>
            {users.map((u) => (
              <option key={u._id} value={u.username}>
                {u.username}
              </option>
            ))}
          </select>

          {selectedUserData && (
  <>
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <Stat label="Aktuální tokeny" value={selectedUserData.tokens} />
      <Stat label="Level" value={selectedUserData.level ?? "Explorer"} />
      <Stat
  label="User ID"
  value={
    <span className="font-mono text-xs break-all max-w-[180px] block">
      {selectedUserData._id}
    </span>
  }
/>
  
  <Stat label="Email" value={selectedUserData.email ?? "—"} />
    </div>

    {levelMeta && (
      <div className="mt-2 font-semibold">
        <span className={levelMeta.color}>
          {levelMeta.icon} {levelMeta.label}
        </span>
      </div>
    )}
  </>
)}

          {stats && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Získáno tokenů" value={stats.tokensEarned} />
              <Stat label="Utraceno tokenů" value={stats.tokensSpent} />
              <Stat label="Počet videí" value={stats.videosUploaded} />
              <Stat label="Celkem views" value={stats.totalViews} />
            </div>
          )}

<div className="mt-10 bg-[#0e0e20] p-6 rounded-xl border border-cyan-500/20">
  <h2 className="text-lg font-semibold text-cyan-400 mb-4">
    🧾 Poslední token akce
  </h2>

  {tokenLog.length === 0 ? (
    <p className="text-sm text-gray-500">Žádné záznamy</p>
  ) : (
    <ul className="space-y-2 text-sm">
      {tokenLog.map((log) => (
        <li
          key={log._id}
          className="flex justify-between items-center text-gray-300"
        >
          <span>
            <strong>{log.userId?.username || "?"}</strong>{" "}
            <span className="text-gray-500">({log.type})</span>
          </span>

          <span
            className={
              log.amount > 0 ? "text-green-400" : "text-red-400"
            }
          >
            {log.amount > 0 ? "+" : ""}
            {log.amount}
          </span>
        </li>
      ))}
    </ul>
  )}
</div>


          <div className="flex gap-2">
            {[100, 500, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => setTokenChange(amount)}
                className="px-3 py-1 rounded-md text-sm font-semibold bg-[#111629] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600 hover:text-white transition"
              >
                +{amount}
              </button>
            ))}
          </div>

          <input
            type="number"
            value={tokenChange}
            onChange={(e) => setTokenChange(Number(e.target.value))}
            className="w-24 bg-[#111629] px-2 py-2 rounded-lg border border-cyan-500/30"
          />

          <button
  type="button"
  onClick={() => handleTokenUpdate("add")}
  className="bg-cyan-600 px-4 py-2 rounded"

>

  ➕ Tokeny
</button>

<button
  type="button"
  onClick={() => handleTokenUpdate("remove")}
  className="bg-fuchsia-600 px-4 py-2 rounded"
>
  ➖ Tokeny
</button>

<button
  onClick={() =>
    window.open(`${API_BASE}/api/payout/admin/export/csv`, "_blank")
  }
  className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-sm"
>
  📄 Export CSV Payouts
</button>

<button
  onClick={exportPurchasesCSV}
  className="mb-4 px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-sm"
>
  📄 Export CSV Purchases
</button>


{/* ===============================
   💸 ADMIN – PENDING PAYOUTS
   =============================== */}
<div className="mt-10 bg-[#0e0e20] p-6 rounded-xl border border-cyan-500/20">
  <h2 className="text-xl font-semibold text-cyan-400 mb-4">
    💸 Pending payouts
  </h2>

  {pendingPayouts.length === 0 ? (
    <p className="text-sm text-gray-500">No pending payouts 🎉</p>
  ) : (
    <div className="space-y-4">
      {pendingPayouts.map((log) => (
        <div
          key={log._id}
          className="p-4 rounded-lg bg-[#0b0b19] border border-cyan-500/20"
        >
          {/* USER */}
          <div className="mb-2">
            <div className="font-semibold text-cyan-300">
              {log.userId?.username}
            </div>
            <div className="text-xs text-gray-400">
              {log.userId?.email}
            </div>
          </div>

          {/* AMOUNT */}
          <div className="text-yellow-400 font-semibold mb-2">
            −{Math.abs(log.amount)} tokens
          </div>

          {/* PAYOUT DETAILS */}
          <div className="text-sm text-gray-300 space-y-1">
            <div>
              <span className="text-gray-400">Full name:</span>{" "}
              {log.payout?.fullName || "—"}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400">IBAN:</span>
              <span className="font-mono">{log.payout?.iban || "—"}</span>
              {log.payout?.iban && (
                <button
                  onClick={() => copyText(log.payout.iban)}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  📋 copy
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400">SWIFT:</span>
              <span className="font-mono">{log.payout?.swift || "—"}</span>
              {log.payout?.swift && (
                <button
                  onClick={() => copyText(log.payout.swift)}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  📋 copy
                </button>
              )}
            </div>

            <div>
              <span className="text-gray-400">Country:</span>{" "}
              {log.payout?.country || "—"}
            </div>

            {log.payout?.address && (
              <div>
                <span className="text-gray-400">Address:</span>{" "}
                {log.payout.address.street},{" "}
                {log.payout.address.city} {log.payout.address.zip}
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 mt-4">
            {log.status === "pending" && (
              <>
                <button
                  onClick={() => handleDecision(log._id, "approve")}
                  className="px-4 py-1.5 rounded bg-green-600 hover:bg-green-500 text-sm"
                >
                  ✅ Approve
                </button>

                <button
                  onClick={() => handleDecision(log._id, "reject")}
                  className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-sm"
                >
                  ❌ Reject
                </button>
              </>
            )}

            {log.status === "approved" && (
              <button
                onClick={() => markAsPaid(log._id)}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm"
              >
                💸 Mark as paid
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

{/* ===============================
   💳 TOKEN PURCHASES
   =============================== */}
<div className="mt-10 bg-[#0e0e20] p-6 rounded-xl border border-cyan-500/20">
  <h2 className="text-xl font-semibold text-cyan-400 mb-4">
    💳 Token purchases
  </h2>

  {purchases.length === 0 ? (
    <p className="text-sm text-gray-500">No purchases yet</p>
  ) : (
    <div className="space-y-3">
      {purchases.map((log) => (
        <div
          key={log._id}
          className="p-4 bg-[#0b0b19] rounded-lg border border-cyan-500/10 text-sm"
        >
          <div className="flex justify-between">
            <div>
              <div className="font-semibold text-cyan-300">
                {log.userId?.username}
              </div>
              <div className="text-xs text-gray-400">
                {log.userId?.email}
              </div>
            </div>

            <div className="text-green-400 font-semibold">
              +{log.amount} tokens
            </div>
          </div>
<button
  onClick={() => {
    console.log("🔥 REFUND CLICK", log._id);
    setRefundLog(log);
  }}
  className="text-xs px-3 py-1 rounded bg-red-600 hover:bg-red-500"
>
  Refund
</button>


          <div className="mt-2 text-xs text-gray-400 flex justify-between">
            <span>{new Date(log.createdAt).toLocaleString()}</span>
            <span className="font-mono">
              {log.externalSourceId?.slice(0, 16)}…
            </span>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

{refundLog && (
  <RefundModal
    purchase={refundLog}          // 🔥 TADY JE TEN FIX
    onClose={() => setRefundLog(null)}
    onConfirm={handleRefund}      // 🔥 MUSÍ EXISTOVAT
  />
)}


              <select
  value={newLevel}
  onChange={(e) => setNewLevel(Number(e.target.value))}
  className="bg-[#111629] px-3 py-2 rounded-lg border border-fuchsia-500/30 text-white"
>
  <option value="">Změnit level</option>
  <option value={1}>Explorer</option>
  <option value={2}>Creator</option>
  <option value={3}>Innovator</option>
  <option value={4}>Legend</option>
  <option value={5}>Warp Master</option>
</select>

 
        <button
  type="button"
  onClick={handleLevelChange}
  className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 rounded"
>
  🔄 Uložit level
</button>
        </div>
      </div>
    </motion.div>
  );

};

export default AdminPanel;

