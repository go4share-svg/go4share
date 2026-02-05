import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import API_BASE from "../api";

const WarpAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);

  // 🕹️ Warp Control Panel
const [selectedUser, setSelectedUser] = useState("");
const [tokenChange, setTokenChange] = useState(10);
const [newLevel, setNewLevel] = useState("");
const [saving, setSaving] = useState(false);

const handleTokenUpdate = async (type) => {
  if (!selectedUser) return alert("Vyber uživatele!");
  setSaving(true);
  try {
    const res = await fetch(`${API_BASE}/api/tokens/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: selectedUser,
        change: type === "add" ? tokenChange : -tokenChange,
        type: "admin",
        fromUser: "Admin",
      }),
    });
    const data = await res.json();
    console.log("✅ Token update:", data);
    alert(`Tokeny aktualizovány pro ${selectedUser}`);
  } catch (err) {
    console.error("❌ Chyba při úpravě tokenů:", err);
  }
  setSaving(false);
};

const handleLevelChange = async () => {
  if (!selectedUser || !newLevel) return alert("Vyber uživatele i level!");
  setSaving(true);
  try {
    const res = await fetch(`${API_BASE}/api/auth/updateLevel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: selectedUser, level: newLevel }),
    });
    const data = await res.json();
    console.log("🚀 Level změněn:", data);
    alert(`Level změněn pro ${selectedUser} → ${newLevel}`);
  } catch (err) {
    console.error("❌ Chyba při změně levelu:", err);
  }
  setSaving(false);
};

useEffect(() => {
  const warpUser = JSON.parse(localStorage.getItem("warpUser"));
  if (!warpUser || warpUser.role !== "admin") {
    alert("🚫 Warp access denied");
    window.location.href = "/";
  }
}, []);

  
  // 🔄 Načíst seznam uživatelů z backendu
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/users`);
        if (!res.ok) throw new Error("Nepodařilo se načíst uživatele");
        const data = await res.json();
        setUsers(data);

        // 📊 Fake analytics data (zatím demo)
        const generated = data.slice(0, 6).map((u, i) => ({
          name: u.username,
          tokens: u.tokens || 0,
          level:
            u.tokens >= 500000
              ? "Warp Master"
              : u.tokens >= 100000
              ? "Legend"
              : u.tokens >= 5000
              ? "Innovator"
              : u.tokens >= 500
              ? "Creator"
              : "Explorer",
        }));
        setAnalytics(generated);
      } catch (err) {
        console.error("❌ Chyba při načítání uživatelů:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  return (
    <div className="min-h-screen bg-[#070713] text-white pt-24 px-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-300 bg-clip-text text-transparent mb-8">
        🧠 Warp Admin Dashboard
      </h1>

      {loading ? (
        <p className="text-gray-400 text-center mt-10">Načítání warp systému...</p>
      ) : (
        <>
          
          {/* 🕹️ Warp Control Panel */}
<div className="bg-[#0a0a18]/80 border border-fuchsia-500/30 rounded-2xl p-6 mb-10 shadow-[0_0_25px_rgba(217,70,239,0.2)]">
  <h2 className="text-xl font-semibold mb-4 text-fuchsia-400">🕹️ Warp Control Panel</h2>

<div className="flex flex-wrap justify-center items-center gap-4 max-w-[900px] mx-auto mt-2">

  <select
    value={selectedUser}
    onChange={(e) => setSelectedUser(e.target.value)}
    className="bg-[#111629] text-gray-200 rounded-lg px-3 py-2 border border-cyan-500/30"
  >
    <option value="">Vyber uživatele</option>
    {users.map((u) => (
      <option key={u._id} value={u.username}>
        {u.username}
      </option>
    ))}
  </select>

  <input
    type="number"
    value={tokenChange}
    onChange={(e) => setTokenChange(Number(e.target.value))}
    className="w-24 bg-[#111629] text-gray-200 rounded-lg px-2 py-2 border border-cyan-500/30 text-center"
  />

  <button
    onClick={() => handleTokenUpdate("add")}
    disabled={saving}
    className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-sm text-white shadow-md transition"
  >
    ➕ Přidat
  </button>

  <button
    onClick={() => handleTokenUpdate("remove")}
    disabled={saving}
    className="px-4 py-2 rounded-md bg-fuchsia-600 hover:bg-fuchsia-500 text-sm text-white shadow-md transition"
  >
    ➖ Odebrat
  </button>

  <select
    value={newLevel}
    onChange={(e) => setNewLevel(e.target.value)}
    className="bg-[#111629] text-gray-200 rounded-lg px-3 py-2 border border-fuchsia-500/30"
  >
    <option value="">Změnit level</option>
    <option value="Explorer">Explorer</option>
    <option value="Creator">Creator</option>
    <option value="Innovator">Innovator</option>
    <option value="Legend">Legend</option>
    <option value="Warp Master">Warp Master</option>
  </select>

  <button
    onClick={handleLevelChange}
    disabled={saving}
    className="px-5 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-fuchsia-500 
               hover:from-cyan-400 hover:to-fuchsia-400 text-sm font-semibold text-white 
               shadow-[0_0_10px_rgba(217,70,239,0.4)] transition"
  >
    🔄 Uložit Level
  </button>
</div>
</div>
{/* 📊 Statistiky tokenů */}
          <div className="bg-[#0a0a18]/70 border border-cyan-500/20 rounded-2xl p-6 mb-10">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">
              📈 Token Analytics
            </h2>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a0a18",
                      border: "1px solid #06b6d4",
                      borderRadius: "10px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tokens"
                    stroke="#f472b6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 👥 Seznam uživatelů */}
          <div className="bg-[#0a0a18]/70 border border-cyan-500/20 rounded-2xl p-6 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">
              👥 Registrovaní uživatelé
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-cyan-400 border-b border-cyan-500/20">
                    <th className="text-left py-2 px-3">Uživatel</th>
                    <th className="text-left py-2 px-3">E-mail</th>
                    <th className="text-left py-2 px-3">Tokeny</th>
                    <th className="text-left py-2 px-3">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-700/50 hover:bg-[#0f0f1f] transition"
                    >
                      <td className="py-2 px-3 font-medium">{user.username}</td>
                      <td className="py-2 px-3 text-gray-400">{user.email}</td>
                      <td className="py-2 px-3 text-yellow-400 font-semibold">
                        {user.tokens}
                      </td>
                      <td className="py-2 px-3 text-fuchsia-400">
                        {user.tokens >= 500000
                          ? "Warp Master"
                          : user.tokens >= 100000
                          ? "Legend"
                          : user.tokens >= 5000
                          ? "Innovator"
                          : user.tokens >= 500
                          ? "Creator"
                          : "Explorer"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WarpAdminDashboard;