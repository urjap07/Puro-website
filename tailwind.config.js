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
        // "Quiet Luxury" — bone and linen grounds, forest green, a whisper of brass
        ivory: "#FBF9F5",
        parchment: "#EFE9DF",
        sand: "#E4DACB",
        line: "#DCD4C6",
        // Page grounds (token kept as "mist" so every page follows)
        mist: {
          DEFAULT: "#F5F1EA",
          card: "#FAF8F4",
          deep: "#ECE6DB",
        },
        // Royal peacock, from the peacock on the Puro gift boxes.
        // (Token kept as "emerald" so every component follows.)
        emerald: {
          DEFAULT: "#0C6670",
          deep: "#08323D",
          soft: "#13868C",
        },
        // Champagne gold
        gold: {
          DEFAULT: "#C59A55",
          soft: "#E8D2A2",
          deep: "#9A7139",
        },
        saffron: "#C9A574",
        peacock: "#13868C",
        ink: "#1B1C19",
        stone: "#6F6A61",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        caps: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
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
        kenburns: {
          from: { transform: "scale(1)" },
          to: { transform: "scale(1.12)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 50%" },
          to: { backgroundPosition: "-200% 50%" },
        },
        sweep: {
          "0%, 55%": { transform: "translateX(-130%) skewX(-18deg)" },
          "100%": { transform: "translateX(230%) skewX(-18deg)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "marquee-slow": "marquee 70s linear infinite",
        kenburns: "kenburns 24s ease-in-out infinite alternate",
        shimmer: "shimmer 9s linear infinite",
        sweep: "sweep 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
