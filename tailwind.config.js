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
        /*
         * PURO "Living Botanical Atelier" palette (PRD §7.2).
         *   Midnight Teal #173C40 · Luxury Pearl #F8F7F4 · Muted Rose #B9A5AC
         *   Soft Champagne #D8C6A0 · Platinum #D5D4D0 · Graphite #343B3B
         * Legacy token names (emerald, gold, ivory, mist, ink…) are mapped onto
         * the new palette so every page follows without a rewrite.
         */
        midnight: {
          DEFAULT: "#173C40",
          deep: "#0E272A",
          soft: "#2B5A5F",
          mist: "#DCE5E3",
        },
        blush: {
          DEFAULT: "#B9A5AC",
          soft: "#E8DFE2",
          deep: "#7E6670",
        },
        champagne: {
          DEFAULT: "#D8C6A0",
          soft: "#ECE2CC",
          deep: "#7A6544",
        },
        platinum: "#D5D4D0",
        graphite: "#343B3B",

        /*
         * Botanical accents — a brighter, multi-colour luxury palette drawn from
         * PURO's ingredients and packaging. Midnight teal anchors text and the
         * primary action; these colour the collections, ingredients and light.
         *   quartz (rose)  — face care · rose clay, wild rose
         *   apricot        — face care · glow, citrus
         *   saffron        — body care · turmeric, saffron
         *   lilac          — hair care · lavender, rosemary
         *   sage           — aloe, botanicals
         *   aqua           — hydration · Aquench, water
         *   terracotta     — clays, ubtan
         *   plum           — deep evening accent for dark grounds
         */
        quartz: { DEFAULT: "#E9C3C6", soft: "#F6E3E4", deep: "#B4707C" },
        apricot: { DEFAULT: "#F3C9A6", soft: "#FBE8D9", deep: "#C27A4A" },
        saffron: { DEFAULT: "#E9B55A", soft: "#F8E3B8", deep: "#A86F14" },
        lilac: { DEFAULT: "#CDBDE6", soft: "#ECE5F6", deep: "#7D68A8" },
        sage: { DEFAULT: "#B9CDB0", soft: "#E3ECDD", deep: "#5E7F55" },
        aqua: { DEFAULT: "#B8DEE0", soft: "#E1F2F2", deep: "#3F8589" },
        terracotta: { DEFAULT: "#DDA584", soft: "#F4DCCB", deep: "#9C5634" },
        plum: { DEFAULT: "#4A2C42", soft: "#6E4A63", deep: "#2B1827" },

        // ---- Legacy aliases ----
        ivory: "#F8F7F4", // Luxury Pearl (named ivory: .bg-pearl is the textured ground class)
        parchment: "#EFEDE8",
        sand: "#E4E2DD",
        line: "#D5D4D0",
        mist: {
          DEFAULT: "#F8F7F4",
          card: "#FBFAF8",
          deep: "#ECEAE5",
        },
        emerald: {
          DEFAULT: "#173C40",
          deep: "#0E272A",
          soft: "#2B5A5F",
        },
        gold: {
          DEFAULT: "#C8B48A",
          soft: "#D8C6A0",
          deep: "#7A6544",
        },
        peacock: "#2B5A5F",
        ink: "#343B3B",
        stone: "#5F6766",
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        caps: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
        sans: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.28em",
        label: "0.32em",
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
