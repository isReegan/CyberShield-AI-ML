/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark:    "#0a0f1e",
          darker:  "#060b14",
          card:    "#0d1526",
          border:  "#1a2744",
          glow:    "#00d4ff",
          safe:    "#00ff88",
          scam:    "#ff3366",
          warn:    "#ffaa00",
          muted:   "#8892a4",
        },
      },
      fontFamily: {
        mono: ["'Courier New'", "Courier", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan": "scan 2s linear infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        scan: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 5px #00d4ff33" },
          "50%":      { boxShadow: "0 0 20px #00d4ff88, 0 0 40px #00d4ff33" },
        },
      },
      boxShadow: {
        "glow-blue":  "0 0 20px rgba(0, 212, 255, 0.3)",
        "glow-green": "0 0 20px rgba(0, 255, 136, 0.3)",
        "glow-red":   "0 0 20px rgba(255, 51, 102, 0.3)",
      },
    },
  },
  plugins: [],
};
