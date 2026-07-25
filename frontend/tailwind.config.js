/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F1F0EB",
        ink: "#132339",
        "ink-soft": "#3A4A63",
        ledger: "#C9C4B4",
        forest: "#1F6F54",
        stamp: "#A6352C",
        mustard: "#B8860B",
      },
      fontFamily: {
        display: ["Zilla Slab", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
