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
        cyan: "#00B4D8",
        "tech-blue": "#1F3C88",
        charcoal: "#0F172A",
        "soft-gray": "#F1F5F9",
        orange: "#F97316",
        "soft-amber": "#FDBA74",
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e"
        },
        accent: {
          500: "#f97316",
          600: "#ea580c"
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
