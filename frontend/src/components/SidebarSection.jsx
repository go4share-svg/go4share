import React, { useEffect, useState } from "react";
import API_BASE from "../api";
import SidebarVideoCard from "./SidebarVideoCard";

const SidebarSection = ({ title, type, onSelectVideo }) => {
  console.log("onSelectVideo:", onSelectVideo);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/stats/sidebar?type=${type}`
        );
        const data = await res.json();
        setVideos(data);
      } catch (err) {
        console.error("❌ Sidebar load failed:", err);
      }
    };

    load();
  }, [type]);

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">
        {title}
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {videos.map((video) => (
          <SidebarVideoCard
            key={video._id}
            video={video}
            onSelectVideo={onSelectVideo} // ✅ STEJNÝ NÁZEV
          />
        ))}
      </div>
    </div>
  );
};

export default SidebarSection;
