module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    colors: {
      black: "#000000",
      white: "#FFFFFF",
      green: "#9FD39D",
      lightGreen: "#a7cba6",
      darkGreen: "#339A31",
      blue: "#2d8eae",
      lightGrey: "#E8E8E8",
      grey: "#777777",
      orange: "#F1BD02",
      bizbaz: "#339A31"
    },
    fontFamily: {
      roboto: ["Roboto Condensed"],
      montserrat: ["Montserrat"],
      public: ["Public Sans"],
      grotesk: ["Space Grotesk"]
    },
    extend: {
      minWidth: {
        230: "14.3rem",
        320: "20rem",
        410: "22.6rem",
        575: "36rem",
        1100: "68.75rem"
      },
      fontWeight: {
        100: "100",
        200: "200",
        300: "300",
        400: "400",
        500: "500",
        600: "600",
        700: "700",
        800: "800",
        900: "900"
      }
    },
    screens: {
      mobile: "350px",
      // => @media (min-width: 350px) { ... }
      tablet: "750px",

      inBetween: "1024px",

      laptop: "1275px",

      desktop: "1600px",

      mobileN: { max: "449px" },
      tabletN: { min: "450px", max: "749px" },
      inBetweenN: { min: "750px", max: "1023px" },
      laptopN: { min: "1024px", max: "1274px" },
      desktopN: { min: "1275px" }
    }
  },
  plugins: [require("tailwindcss-debug-screens")]
};
