import React from "react";

const ConversationList = ({ conversations, onSelect, currentUser }) => {
  return (
    <div className="w-1/3 bg-[#0e0e15] border-r border-cyan-500/20 overflow-y-auto rounded-l-xl">
      <h2 className="text-cyan-400 font-semibold p-3 border-b border-cyan-500/10">
        💬 Konverzace
      </h2>
      {conversations.length === 0 ? (
        <p className="text-gray-500 text-sm p-3 italic">Zatím žádné zprávy...</p>
      ) : (
        conversations.map((conv, i) => {
          const partner = conv.participants.find(p => p !== currentUser);
          return (
            <div
              key={i}
              onClick={() => onSelect(partner)}
              className={`p-3 cursor-pointer hover:bg-[#141420] transition ${
                conv.active ? "bg-[#141420]" : ""
              }`}
            >
              <div className="text-gray-200 font-medium">{partner}</div>
              <div className="text-gray-500 text-xs truncate">
                {conv.lastMessage}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ConversationList;
