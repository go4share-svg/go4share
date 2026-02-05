import React from "react";
import API_BASE from "../api";
import { formatNumber } from "../utils/formatNumber";
import { useNavigate } from "react-router-dom";

const SidebarVideoCard = ({ video, onSelectVideo }) => {



  return (
    <div
      onClick={() => onSelectVideo(video)}
      className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition"
    >
      <video
        src={`${API_BASE}/${video.filePath}`}
        muted
        preload="metadata"
        className="w-full h-20 object-cover rounded-md"
      />

      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
        <p className="text-xs text-white truncate">
          {video.title}
        </p>
      </div>
    </div>
  );
};

export default SidebarVideoCard;