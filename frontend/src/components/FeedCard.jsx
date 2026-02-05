import React from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const FeedCard = ({ post }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-md mx-auto bg-[#141416] rounded-3xl shadow-lg overflow-hidden neon-glow"
    >
      <img
        src={post.image}
        alt={post.title}
        className="w-full h-[80vh] object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 via-transparent to-transparent">
        <h3 className="text-xl font-semibold text-white">{post.title}</h3>
        <p className="text-gray-300 text-sm mb-2">{post.description}</p>
        <div className="flex items-center gap-3">
          <Heart className="text-cyan-400 hover:scale-125 transition-transform cursor-pointer" />
          <span className="text-gray-400 text-sm">{post.likes || 0}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default FeedCard;
