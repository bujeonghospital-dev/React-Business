// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      height: {
        // Support svh (small viewport height) units
        "[55svh]": "55svh",
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      desk1600: "1600px", // 👈 เพิ่มจุดนี้
    },
  },
};
