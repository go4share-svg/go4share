import React from "react";

const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all">
      <img
        src={post.image}
        alt={post.title}
        className="w-full h-56 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{post.description}</p>
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar}
            alt={post.author}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm text-gray-700">{post.author}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
