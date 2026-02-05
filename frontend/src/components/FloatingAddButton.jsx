import React from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FloatingAddButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/add");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-primary hover:bg-primary-light text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 dark:bg-accent dark:hover:bg-orange-500"
      title="Přidat příspěvek"
    >
      <Plus size={26} />
    </button>
  );
};

export default FloatingAddButton;

