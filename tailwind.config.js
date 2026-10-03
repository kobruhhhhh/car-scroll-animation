/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#D1D1D1",
        fizz: "#45DB7D",
        road: "#1E1E1E",
        lime: "#DEF54F",
        charcoal: "#333333",
        sky: "#6AC9FF",
        blaze: "#FA7328",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
