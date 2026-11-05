/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Botanical Heritage" — drawn from the Puro packaging and gift boxes
        ivory: "#FAF7F0",
        parchment: "#F2ECE0",
        sand: "#E6DBC6",
        line: "#E2D8C5",
        emerald: {
          DEFAULT: "#123B30",
          deep: "#0B2A22",
          soft: "#1F4D3F",
        },
        gold: {
          DEFAULT: "#B4925A",
          soft: "#D9C49A",
          deep: "#8E6F3E",
        },
        ink: "#1B231F",
        stone: "#6B6E66",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.28em",
      },
      maxWidth: {
        site: "1440px",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};
