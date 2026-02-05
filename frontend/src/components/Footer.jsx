import React from "react";

const Footer = () => {
  return (
    <footer className="w-full py-6 text-center border-t border-gray-800 bg-[#0a0a0d]/90">
      <p className="text-sm text-gray-400 tracking-wide">
        <span className="text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.7)] font-semibold">
          Go4
        </span>
        <span className="text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.7)] font-semibold">
          Share
        </span>{" "}
        © {new Date().getFullYear()} — Made with 💙 by Jay & Team
      </p>
    </footer>
  );
};

export default Footer;
