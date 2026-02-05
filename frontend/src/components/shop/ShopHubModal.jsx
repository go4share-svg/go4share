import BuyTokens from "./BuyTokens";


const ShopHubModal = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm
                 flex items-start justify-center pt-32 z-[9999]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-[420px] bg-[#0b0b12]
                      border border-cyan-500/20
                      rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">
          🪙 Add Tokens
        </h2>

        <BuyTokens onDone={onClose} />

        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-gray-400 hover:text-gray-200"
        >
          Zavřít
        </button>
      </div>
    </div>
  );
};

export default ShopHubModal;
