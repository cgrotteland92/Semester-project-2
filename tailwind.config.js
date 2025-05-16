const { headers } = require("./js/api");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}", "!./node_modules/**/*"],
  theme: {
    extend: {
      colors: {
        primary: "#EEECE2",
        secondary: "#F5F4ED",
        headers: "#3d3929",
      },
    },
  },
  plugins: [],
};
