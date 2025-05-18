const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}", "!./node_modules/**/*"],
  theme: {
    extend: {
      colors: {
        primary: "#FAF9F5",
        secondary: "#E8E6DC",
        headers: "#3d3929",
      },
      fontFamily: {
        sans: ["Cardo", ...defaultTheme.fontFamily.sans],
        syne: ["Cardo", "sans-serif"],
      },
    },
  },
  plugins: [],
};
