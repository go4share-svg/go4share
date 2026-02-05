import React, { useState } from "react";
import InfoModal from "./InfoModal"; 

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

 const [termsAccepted, setTermsAccepted] = useState(
  localStorage.getItem("termsAccepted") === "true"
);
const [agreeTerms, setAgreeTerms] = useState(false);
const [agreeCookies, setAgreeCookies] = useState(false);
  


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


const handleSubmit = async (e) => {
  console.log("🔥 HANDLE SUBMIT REGISTER PAGE");
  e.preventDefault();

  const accepted = localStorage.getItem("termsAccepted");
  console.log("🧠 termsAccepted:", accepted);

 if (!agreeTerms || !agreeCookies) {
  setMessage("Musíš souhlasit s podmínkami a cookies");
  return;
}
  try {
    const res = await fetch("http://localhost:4000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Registrace úspěšná 🎉");
      setFormData({ username: "", email: "", password: "" });
    } else {
      setMessage(data.error || "Chyba při registraci");
    }
  } catch (err) {
    setMessage("Server nedostupný");
  }
};


  return (

    
 <div className="flex justify-center items-center min-h-screen bg-gray-100">
  <div className="bg-white p-8 rounded-xl shadow-md w-96">

    <h2 className="text-2xl font-bold mb-6 text-center">
      Registrace
    </h2>

    <input
      name="username"
      placeholder="Uživatelské jméno"
      value={formData.username}
      onChange={handleChange}
      className="w-full border p-2 mb-3 rounded"
      required
    />

    <input
      name="email"
      type="email"
      placeholder="E-mail"
      value={formData.email}
      onChange={handleChange}
      className="w-full border p-2 mb-3 rounded"
      required
    />

    <input
      name="password"
      type="password"
      placeholder="Heslo"
      value={formData.password}
      onChange={handleChange}
      className="w-full border p-2 mb-3 rounded"
      required
    />

    <div className="space-y-2 text-sm text-gray-700 mb-4">

  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={agreeTerms}
      onChange={(e) => setAgreeTerms(e.target.checked)}
    />
    <span>
      Souhlasím s <b>Obchodními podmínkami</b> (EN)
    </span>
  </label>

  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={agreeCookies}
      onChange={(e) => setAgreeCookies(e.target.checked)}
    />
    <span>
      Souhlasím se <b>zpracováním cookies</b>
    </span>
  </label>

</div>

    {/* JEDINÉ TLAČÍTKO */}
    <button
      onClick={handleRegisterClick}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
    >
      Registrovat se
    </button>

    {message && (
      <p className="mt-4 text-center text-sm text-gray-700">
        {message}
      </p>
    )}
  </div>

  {showInfo && (
    <InfoModal
      onAccept={() => {
        localStorage.setItem("termsAccepted", "true");
        setShowInfo(false);
        handleSubmit(new Event("submit"));
      }}
      onClose={() => setShowInfo(false)}
    />
  )}
</div>
);
  }

export default Register;
