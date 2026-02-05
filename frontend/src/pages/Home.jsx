import React, { useEffect, useState } from "react";
import FeedCard from "../components/FeedCard";

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    setPosts([
      {
        id: 1,
        title: "Lusinka",
        description: "test",
        image: "https://www.art-creative.cz/19480-large_default/kartonovy-pes.jpg",
        likes: 32,
      },
      {
        id: 2,
        title: "Příroda",
        description: "Kouzlo světla v pohybu.",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        likes: 47,
      },
    ]);
  }, []);

  return (
    <div className="pt-24 pb-16 flex flex-col items-center gap-12">
      {posts.map((post) => (
        <FeedCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default Home;
