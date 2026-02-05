import React, { useEffect, useState } from "react";
import API_BASE from "../api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { exchangeRates, formatCurrency } from "../config/tokenConfig";

// 🌌 Go4Share Token Levels
const levels = [
  {
    name: "Explorer",
    min: 0,
    max: 4999,
    color: "text-cyan-400",
    emoji: "🛻",
    desc: "Začátečník, který vstoupil do galaxie Go4Share.",
  },
  {
    name: "Creator",
    min: 5000,
    max: 49999,
    color: "text-blue-400",
    emoji: "🛰️",
    desc: "Aktivní člen, který objevuje nové hvězdy (feature, příspěvky…).",
  },
  {
    name: "Innovator",
    min: 50000,
    max: 99999,
    color: "text-indigo-400",
    emoji: "💡",
    desc: "Tvůrce, který přetváří svět kolem sebe — sdílí a inspiruje.",
  },
  {
    name: "Legend",
    min: 100000,
    max: 499999,
    color: "text-purple-400",
    emoji: "🛩️",
    desc: "Pokročilý builder s přístupem ke speciálním warp-nástrojům.",
  },
  {
    name: "Warp Master",
    min: 500000,
    max: Infinity,
    color: "text-yellow-400",
    emoji: "🛸",
    desc: "Elitní člen galaxie, ovládající warp energii a vesmírný tok.",
  },
];

// 🧮 Určí aktuální level a progress
const getLevel = (tokens) => {
  const current = levels.find((lvl) => tokens >= lvl.min && tokens <= lvl.max) || levels[0];
  const next = levels[levels.indexOf(current) + 1];
  const progress = next
    ? ((tokens - current.min) / (next.min - current.min)) * 100
    : 100;
  return { ...current, progress: Math.min(progress, 100) };
};

const TokenDashboard = ({ compact = false }) => {
  const [data, setData] = useState({ balance: 0, history: [] });
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "EUR");
  const username = localStorage.getItem("username") || "Jay Godson";

  // 👉 Kompaktní verze (např. BIO)
if (compact) {
  const level = getLevel(Number(localStorage.getItem("userTokens") || 0));

  return (
    <div className={`text-sm font-semibold ${level.color} flex items-center gap-1`}>
      <span>{level.emoji}</span>
      <span>{level.name}</span>
    </div>
  );
}


  // 🧠 Načíst tokeny
  const fetchTokens = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tokens/${encodeURIComponent(username)}`);
      const userData = await res.json();
      setData(userData);
    } catch (err) {
      console.error("❌ Nelze načíst tokeny:", err);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  // 🔁 Měna
  useEffect(() => {
    const handleCurrencyChange = () => {
      setCurrency(localStorage.getItem("currency") || "CZK");
    };
    window.addEventListener("currencyChange", handleCurrencyChange);
    return () => window.removeEventListener("currencyChange", handleCurrencyChange);
  }, []);

  // 💸 Výplata
  const handlePayout = async (amount) => {
    if (data.balance < amount) return alert("Nedostatek tokenů 💸");
    await fetch(`${API_BASE}/api/tokens/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, change: -amount, type: "payout" }),
    });
    fetchTokens();
  };

  // 📊 Data pro graf
  const chartData =
    Array.isArray(data.history) &&
    data.history.slice(-10).map((h, i) => ({
      name: `${new Date(h.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      value: data.history
        .slice(0, i + 1)
        .reduce((acc, cur) => acc + cur.amount, 0),
    }));

  // 💫 Level
  const level = getLevel(data.balance);

  return (
    <div className="bg-[#0b0b12] border border-cyan-500/10 rounded-xl shadow-[0_0_25px_rgba(34,211,238,0.15)] p-6 text-gray-200 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold text-cyan-400">Token Dashboard</h2>

      {/* 🌌 Level zóna */}
      <div className="text-center py-4">
        <h3 className={`text-2xl font-bold ${level.color}`}>
          {level.emoji} {level.name}
        </h3>
        <div className="w-full bg-[#141420] rounded-full h-3 mt-2 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-700"
            style={{
              width: `${level.progress}%`,
              background: `linear-gradient(to right, #06b6d4, #d946ef)`,
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1 italic">{level.desc}</p>
      </div>

      {/* 💰 Zůstatek */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Aktuální zůstatek</p>
          <h1 className="text-3xl font-bold text-yellow-400">🪙 {data.balance}</h1>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Hodnota v {currency}</p>
          <h1 className="text-2xl font-bold text-green-400">
            {formatCurrency ? formatCurrency(data.balance, currency) : (data.balance * 5).toLocaleString()}{" "}
            {currency}
          </h1>
        </div>
      </div>

      {/* 🪙 Tlačítka */}
      <div className="flex gap-3">
        <button
          onClick={() => handlePayout(100)}
          className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:scale-105 px-4 py-2 rounded-lg text-white font-semibold transition"
        >
          💸 Vybrat 100 tokenů
        </button>

<button
  onClick={() => setShowTokenShop(true)}
  className="mt-2 bg-gradient-to-r from-cyan-600 to-fuchsia-600
             hover:scale-105 px-4 py-2 rounded-lg
             text-white font-semibold transition"
>
  🪙 Koupit tokeny
</button>
      </div>

      {/* 📈 Graf */}
      <div className="h-48 bg-[#141420] rounded-lg p-2">
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#colorUv)"
                strokeWidth={3}
                dot={false}
              />
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center pt-14 italic">
            Zatím žádná data pro graf.
          </p>
        )}
      </div>

      {/* 🧾 Historie */}
      <h3 className="text-cyan-300 text-lg">Historie transakcí</h3>
      <div className="max-h-64 overflow-y-auto border-t border-cyan-500/10 pt-3 space-y-2">
        {Array.isArray(data.history) && data.history.length > 0 ? (
          data.history
            .slice()
            .reverse()
            .map((h, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-[#141420] rounded-lg px-3 py-2 text-sm hover:bg-[#1b1b24] transition"
              >
                <span className="capitalize text-gray-300">{h.type}</span>
                <span
                  className={`font-semibold ${
                    h.amount > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {h.amount > 0 ? "+" : ""}
                  {h.amount}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(h.timestamp).toLocaleString("cs-CZ")}
                </span>
              </div>
            ))
        ) : (
          <p className="text-gray-500 italic">Žádné transakce zatím nejsou.</p>
        )}
      </div>
    </div>
  );
};

export default TokenDashboard;




