import React, { useState } from "react";
import { useUser } from "../../context/UserContext";
import API_BASE from "../../api";

console.log("🟢 RegisterModal MOUNTED");

const RegisterModal = ({ onClose }) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmittingGlow, setIsSubmittingGlow] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const { setUser } = useUser();

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!acceptedTerms) return;

  if (form.password !== form.confirm) {
    alert("Hesla se neshodují");
    return;
  }

   setIsSubmittingGlow(true); // ✨ START GLOW

  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: form.username,
      email: form.email,
      password: form.password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    setIsSubmittingGlow(false);
    alert(data.message || "Registrace selhala");
    return;
  }

  setUser(data.user);

  // ⏳ glow doběh
  setTimeout(() => {
    onClose();
  }, 350);
};


  return (
  <div
  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm
             flex items-center justify-center px-4"
  onClick={(e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }}
>
   <form
  onSubmit={handleSubmit}
  className={`
    relative
    w-full max-w-[380px]
    mt-20
    p-6
    rounded-2xl
    text-white

    bg-gradient-to-b from-[#0c0c18]/90 to-[#08080f]/90
    border border-cyan-400/20
    backdrop-blur-xl
    transition-all duration-300

   ${isSubmittingGlow
   ? "shadow-[0_0_80px_rgba(56,189,248,0.6)] scale-[1.01]"
   : "shadow-[0_0_40px_rgba(56,189,248,0.15)]"}
  `}
>
  
      <h2
        className="text-2xl font-bold text-center mb-2
                   bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-400
                   bg-clip-text text-transparent"
      >
        Create Warp Identity
      </h2>

      <p className="text-center text-sm text-gray-400 mb-6">
        Create new entry to Go4Share universe
      </p>

      {/* USERNAME */}
      <input
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Uživatelské jméno"
        autoComplete="off"
       className="
  w-full mb-3
  px-3 py-2
  text-sm leading-tight

  rounded-lg
  bg-[#0f0f1a]
  border border-cyan-500/20
  text-white placeholder-gray-500

  focus:outline-none
  focus:border-cyan-400/50
  focus:shadow-[0_0_12px_rgba(34,211,238,0.25)]
  transition
"
      />

      {/* EMAIL */}
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="E-mail"
        autoComplete="off"
       className="
  w-full mb-3
  px-3 py-2
  text-sm leading-tight

  rounded-lg
  bg-[#0f0f1a]
  border border-cyan-500/20
  text-white placeholder-gray-500

  focus:outline-none
  focus:border-cyan-400/50
  focus:shadow-[0_0_12px_rgba(34,211,238,0.25)]
  transition
"
      />

      {/* PASSWORD */}
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Heslo musí mít min.6 znaků"
        autoComplete="new-password"
       className="
  w-full mb-3
  px-3 py-2
  text-sm leading-tight

  rounded-lg
  bg-[#0f0f1a]
  border border-cyan-500/20
  text-white placeholder-gray-500

  focus:outline-none
  focus:border-cyan-400/50
  focus:shadow-[0_0_12px_rgba(34,211,238,0.25)]
  transition
"
      />


      {/* CONFIRM */}
      <input
        type="password"
        name="confirm"
        value={form.confirm}
        onChange={handleChange}
        placeholder="Potvrdit heslo"
        autoComplete="new-password"
        className="
  w-full mb-3
  px-3 py-2
  text-sm leading-tight

  rounded-lg
  bg-[#0f0f1a]
  border border-cyan-500/20
  text-white placeholder-gray-500

  focus:outline-none
  focus:border-cyan-400/50
  focus:shadow-[0_0_12px_rgba(34,211,238,0.25)]
  transition
"
      />

      {/* TERMS */}
      <label className="flex gap-3 text-sm text-gray-300 mt-4 leading-snug">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 accent-cyan-400 scale-110"
        />
        <span>
          Souhlasím s{" "}
          <a
            href="/terms"
            target="_blank"
            className="text-cyan-400 underline"
          >
            obchodními podmínkami
          </a>{" "}
          a{" "}
          <a
            href="/privacy"
            target="_blank"
            className="text-cyan-400 underline"
          >
            ochranou osobních údajů
          </a>
        </span>
      </label>

      {/* BUTTON */}
      <div className="flex">
        <button
          type="submit"
          disabled={!acceptedTerms}
          className={`w-full mt-6 py-1 rounded-xl font-medium
            transition-all duration-300
            ${
              acceptedTerms
                ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.35)] hover:opacity-90"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
        >
          Activate Warp Account
        </button>

      </div>
    </form>
  </div>
);
};
export default RegisterModal;

