import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const StripeSuccess = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (!user?.username) return;

    const timer = setTimeout(() => {
      navigate(`/profile/${user.username}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, user?.username]);

  return (
    <div className="text-center mt-32 text-cyan-400">
      ✅ Payment successful<br />
      Redirecting to your profile…
    </div>
  );
};

export default StripeSuccess;