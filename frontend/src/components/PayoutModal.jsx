import { useState } from "react";
import API_BASE from "../api";
import { useUser } from "../context/UserContext";

const EU_COUNTRIES = ["CZ","SK","DE","AT","PL","FR","IT","ES","NL","BE"];

const PayoutModal = ({ onClose }) => {
  const { user } = useUser();

  const [amount, setAmount] = useState(1000);
  const [country, setCountry] = useState("CZ");
  const [fullName, setFullName] = useState("");
  const [iban, setIban] = useState("");
  const [swift, setSwift] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEU = EU_COUNTRIES.includes(country);

  const submit = async () => {
    setError("");

    if (amount < 1000) return setError("Minimum payout is 1000 tokens");
    if (amount > user.tokens) return setError("Not enough tokens");
    if (!fullName || !iban || !country) return setError("Missing required fields");
    if (!isEU && (!swift || !address || !city || !zip)) {
      return setError("Address and SWIFT required for international payout");
    }

    setLoading(true);

    const res = await fetch(`${API_BASE}/api/payout/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.username,
        amount,
        payout: {
          fullName,
          iban,
          swift: isEU ? null : swift,
          country,
          address: isEU ? null : { address, city, zip }
        }
      })
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) onClose();
    else setError("Payout request failed");
  };

  const submitPayout = async () => {
  const res = await fetch(`${API_BASE}/api/payout/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: user.username,
      amount: payoutAmount, // např. 1000
      payout: {
        fullName,
        iban,
        swift,
        country,
        address,
        city,
        zip,
      },
    }),
  });

  const data = await res.json();

  if (data.success) {
    setHasPendingPayout(true);
    setShowPayout(false);
  }
};


  return (
   
        <div className="fixed inset-0 z-[9999] bg-black/60
                flex justify-center pt-36">
                    <div className="bg-[#0b0b19] rounded-xl w-96
                max-h-[75vh] overflow-y-auto
                p-6">
                    
     
        <h2 className="text-lg font-semibold mb-4">💸 Request payout</h2>

        <input
          type="number"
          min={1000}
          value={amount}
          onChange={(e) => setAmount(+e.target.value)}
          className="w-full mb-2 p-1 rounded bg-[#111629]"
          placeholder="Tokens amount"
        />

        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full mb-2 p-1 rounded bg-[#111629]"
          placeholder="Full name"
        />

        <input
          value={iban}
          onChange={(e) => setIban(e.target.value.toUpperCase())}
          className="w-full mb-2 p-1 rounded bg-[#111629]"
          placeholder="IBAN"
        />

        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full mb-2 p-1 rounded bg-[#111629]"
        >
          <option value="CZ">Czech Republic</option>
          <option value="SK">Slovakia</option>
          <option value="DE">Germany</option>
          <option value="US">United States</option>
        </select>

        {!isEU && (
          <>
            <input
              value={swift}
              onChange={(e) => setSwift(e.target.value.toUpperCase())}
              className="w-full mb-2 p-1 rounded bg-[#111629]"
              placeholder="SWIFT / BIC"
            />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full mb-2 p-1 rounded bg-[#111629]"
              placeholder="Address"
            />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full mb-2 p-1 rounded bg-[#111629]"
              placeholder="City"
            />
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full mb-2 p-1 rounded bg-[#111629]"
              placeholder="ZIP / Postal code"
            />
          </>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <p className="mt-2 text-xs text-gray-400">
         Payout request will be reviewed by our team.  
         Approved payouts are processed manually and transferred shortly
        </p>

        <div className="flex gap-2 mt-4">
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 py-2 rounded"
          >
            Confirm payout
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayoutModal;