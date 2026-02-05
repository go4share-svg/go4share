import React, { useEffect, useState, useCallback, useRef } from "react";
import VideoCard from "../components/VideoCard";
import API_BASE from "../api";
import { useUser } from "../context/UserContext";
import VideoModal from "./VideoModal";

const VideoFeed = ({ activeVideo, setActiveVideo }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { socket } = useUser();

    useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API_BASE}/api/feed`);
      const data = await res.json();
      setVideos(data);
    };

    load();
  }, []);

 useEffect(() => {
  if (!socket) return;

  socket.on("videoLiked", ({ videoId, likesCount }) => {
    setVideos((prev) =>
      prev.map((v) =>
        v._id === videoId ? { ...v, likesCount } : v
      )
    );
  });

  socket.on("videoDeleted", ({ videoId }) => {
    setVideos((prev) => prev.filter((v) => v._id !== videoId));
  });

  socket.on("videoUploaded", (video) => {
    setVideos((prev) => [video, ...prev]);
  });

  // 🚀 BOOST REALTIME
 socket.on("videoBoosted", (data) => {
  setVideos((prev) =>
    prev.map((v) =>
      v._id === data.videoId
        ? { ...v, boostExpiresAt: data.boostExpiresAt }
        : v
    )
  );
});

  return () => {
    socket.off("videoLiked");
    socket.off("videoDeleted");
    socket.off("videoUploaded");
    socket.off("videoBoosted");
  };
}, [socket]);

  // 🔑 sjednocený způsob jak získat aktuálního usera
  const getStoredUser = () => {
    try {
      return (
        JSON.parse(localStorage.getItem("warpUser")) ||
        JSON.parse(localStorage.getItem("user")) ||
        null
      );
    } catch {
      return null;
    }
  };

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const viewer = getStoredUser();

      const url = new URL(`${API_BASE}/api/feed`);
      if (viewer?.username) url.searchParams.set("username", viewer.username);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Feed fetch failed");

      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error("❌ Nelze načíst feed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const buyBoost = async (videoId, tokens) => {
    const viewer = getStoredUser();
    if (!viewer?.username) {
      alert("Nejsi přihlášen");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/boost/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: viewer.username,
          videoId,
          tokens,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Boost selhal");
        return;
      }

      fetchVideos();
    } catch (e) {
      console.error("❌ Boost error:", e);
      alert("Boost selhal");
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  if (loading) {
    return <p className="text-gray-400 text-center mt-20">🌀 Načítám videa...</p>;
  }

  if (!videos.length) {
    return <p className="text-gray-500 text-center mt-20">📭 Zatím žádná videa</p>;
  }

 return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 pt-28">
      {/* 🎬 MAPA VIDEÍ – TADY */}
      {videos.map((video) => (
        <VideoCard
          key={video._id}
          video={video}
        />
      ))}

      {/* 🎥 MODAL */}
      {activeVideo && (
        <VideoModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
};


export default VideoFeed;