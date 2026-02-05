/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          light: "#3b82f6",
          dark: "#1e40af",
        },
        accent: {
          DEFAULT: "#f97316",
        },
        bgLight: "#f9fafb",
        bgDark: "#111827",
        cardLight: "#ffffff",
        cardDark: "#1f2937",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.08)",
      },

      // 🌌 animace galaxie
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: 0.6 },
          "50%": { opacity: 1 },
        },
        twinkle: {
          "0%, 100%": { opacity: 0.2 },
          "50%": { opacity: 0.4 },
        },
      },
      animation: {
        pulse: "pulse 6s ease-in-out infinite",
        twinkle: "twinkle 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

