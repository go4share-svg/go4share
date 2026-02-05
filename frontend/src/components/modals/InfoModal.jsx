
console.log("🟢 InfoModal MOUNTED");
import React from "react";

const InfoModal = ({ onAccept, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm
                 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0b0b12] border border-cyan-500/20
                      rounded-2xl p-6 w-[420px] max-w-[90%] text-white">

        <h2 className="text-xl font-bold text-cyan-400 mb-4">
          🚀 Welcome to Go4Share
        </h2>

        <ul className="text-sm text-gray-300 space-y-2 mb-6">
          <li>• Používáme cookies pro základní funkce a analytiku</li>
          <li>• Tvá data nikdy neprodáváme třetím stranám</li>
          <li>• Souhlasíš s našimi Terms & Privacy Policy (EN)</li>
          <li className="text-cyan-300">
            • Tokeny, boosty a aury jsou herní prvky – ne finanční produkt
          </li>
        </ul>

        <div className="flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 py-2 rounded-lg font-semibold
                       bg-gradient-to-r from-cyan-500 to-fuchsia-500
                       hover:opacity-90 transition"
          >
            Souhlasím & pokračovat
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            Zrušit
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;