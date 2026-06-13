module.exports = {
  darkMode: "class",
  content: [
    "./*.html",
    "./components/**/*.html",
    "./assets/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        cyan: "#C4C3C5",
        "brand-gray": "#C4C3C5",
        paper: "#FFFFFE",
        canvas: "#EBECEC",
        "tech-blue": "#1C2553",
        charcoal: "#1C2553",
        "soft-gray": "#EBECEC",
        orange: "#F17025",
        "soft-amber": "#F5A26D",
        primary: {
          50: "#EEF1F8",
          100: "#DDE3F0",
          200: "#BCC7DE",
          300: "#96A7CB",
          400: "#647CB0",
          500: "#3C5B8C",
          600: "#1C2553",
          700: "#181F46",
          800: "#131938",
          900: "#0D1128"
        },
        accent: {
          500: "#F17025",
          600: "#D95F1D"
        },
        dark: {
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        heading: ["var(--font-heading)", "sans-serif"]
      },
      boxShadow: {
        custom: "0 5px 15px rgba(39, 17, 9, 0.08)",
        "custom-hover": "0 15px 30px rgba(39, 17, 9, 0.15)"
      }
    }
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
    function ({ addVariant }) {
      addVariant("open", "&.active");
    }
  ]
};
