import { useUser } from "../context/UserContext";
import UserStatsPanel from "../components/UserStatsPanel";

 
const UserStatsPage = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="p-6 text-gray-400">
        Pro zobrazení statistik se přihlas.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">
        📊 Statistiky uživatele
      </h1>
      <UserStatsPanel username={user.username} />
    </div>
  );
};

export default UserStatsPage;