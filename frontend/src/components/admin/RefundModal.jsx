import { motion } from "framer-motion";

const RefundModal = ({ purchase, onClose, onConfirm }) => {
  if (!purchase) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center
                 bg-black/70 backdrop-blur-sm
                 pointer-events-auto"
    >
      <div
        className="bg-[#0e0e20] rounded-xl p-6 w-[360px]
                   border border-cyan-500/30
                   pointer-events-auto"
      >
        <h3 className="text-lg font-semibold text-red-400 mb-3">
          💸 Refund purchase
        </h3>

        <div className="text-sm space-y-1 text-gray-300">
          <div>User: <b>{purchase.userId.username}</b></div>
          <div>Email: {purchase.userId.email}</div>
          <div>Tokens: {purchase.amount}</div>
          <div>Paid: {purchase.fiatAmount} {purchase.fiatCurrency}</div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(purchase)}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-500"
          >
            Confirm refund
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;