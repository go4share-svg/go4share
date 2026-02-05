import React, { useEffect } from "react";
import API_BASE from "../api";

const VideoModal = ({ video, onClose }) => {
  if (!video) return null;

  // ESC zavře modal
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur
                 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[#0b0b12] rounded-2xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ❌ CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        {/* 🎬 VIDEO */}
        <video
          src={`${API_BASE}/${video.filePath}`}
          controls
          autoPlay
          className="w-full max-h-[70vh] rounded-xl bg-black"
        />

        {/* INFO */}
        <div className="mt-3 text-sm text-gray-300">
          <b>{video.title}</b> · 👁 {video.views}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;