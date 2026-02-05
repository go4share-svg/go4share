import React from "react";

const ConversationItem = ({ name, last, time, active, online }) => {
  return (
    <div
      className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-cyan-600/40 to-fuchsia-600/40 shadow-[0_0_8px_rgba(217,70,239,0.3)]"
          : "hover:bg-[#141420]"
      }`}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{name}</span>
          {online && <span className="text-green-400 text-xs">● online</span>}
        </div>
        <p className="text-sm text-gray-400">{last}</p>
      </div>
      <span className="text-[11px] text-gray-500">{time}</span>
    </div>
  );
};

export default ConversationItem;

