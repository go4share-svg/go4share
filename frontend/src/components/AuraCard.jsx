import { auraClasses } from "../utils/auraClasses";

const AuraCard = ({ aura, children }) => {
  console.log("🎨 aura:", aura, auraClasses[aura]);
  if (!aura || aura === "none") {
    return (
      <div className="relative inline-block">
        {children}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      {/* 🔮 AURA */}
      {auraClasses[aura] && (
        <div
          className={`absolute inset-0 rounded-full pointer-events-none
            ${auraClasses[aura]}`}
        />
      )}

      {/* 👤 AVATAR */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AuraCard;
