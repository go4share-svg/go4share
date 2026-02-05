import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import API_BASE from "../api";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async () => {

    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
 if (res.ok) {
  alert("Heslo bylo změněno");
  navigate("/");
  return;
}

};

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-[#0b0b12] p-6 rounded-xl w-[360px] text-white">
        <h2 className="text-xl font-bold mb-4">Password reset</h2>

        <input
          type="password"
          placeholder="Nové heslo min.6 znaků"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-[#111] mb-4"
        />

        <button
          onClick={submit}
          className="w-full py-2 rounded bg-cyan-600"
        >
          Uložit nové heslo
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;

