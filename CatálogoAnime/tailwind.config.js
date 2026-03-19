/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        "primary-dim": "#c0adff",
        "primary-fixed-dim": "#dacdff",
        "background": "#0e0e0e",
        "on-background": "#e7e5e4",
        "surface-bright": "#2c2c2c",
        "on-surface-variant": "#acabaa",
        "tertiary-dim": "#cecfef",
        "on-tertiary-container": "#4c4e68",
        "on-secondary-fixed-variant": "#5d5b5f",
        "on-tertiary-fixed-variant": "#565873",
        "inverse-surface": "#fcf8f8",
        "error-container": "#7f2737",
        "on-primary": "#4800bf",
        "on-secondary-fixed": "#403e42",
        "on-error-container": "#ff97a3",
        "surface-container-highest": "#252626",
        "on-surface": "#e7e5e4",
        "outline": "#767575",
        "on-error": "#490013",
        "tertiary-fixed": "#ddddfe",
        "surface-container-lowest": "#000000",
        "surface-tint": "#cdbdff",
        "surface": "#0e0e0e",
        "tertiary-container": "#ddddfe",
        "surface-variant": "#252626",
        "inverse-on-surface": "#565554",
        "inverse-primary": "#6834eb",
        "surface-container-high": "#1f2020",
        "primary-container": "#4f00d0",
        "primary": "#cdbdff",
        "secondary-fixed": "#e6e1e6",
        "on-primary-fixed-variant": "#652fe7",
        "outline-variant": "#484848",
        "on-secondary-container": "#c2bec3",
        "on-tertiary-fixed": "#3a3c55",
        "secondary-dim": "#a09da1",
        "secondary-container": "#3c3b3e",
        "error": "#ec7c8a",
        "on-primary-container": "#d6c9ff",
        "tertiary": "#edecff",
        "surface-container-low": "#131313",
        "surface-container": "#191a1a",
        "secondary-fixed-dim": "#d8d3d8",
        "surface-dim": "#0e0e0e",
        "on-tertiary": "#555671",
        "on-secondary": "#211f23",
        "tertiary-fixed-dim": "#cecfef",
        "error-dim": "#b95463",
        "secondary": "#a09da1",
        "primary-fixed": "#e8deff",
        "on-primary-fixed": "#4700bd"
      },
      fontFamily: {
        headline: ["Manrope"],
        body: ["Inter"],
        label: ["Inter"]
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        full: "9999px"
      },
      boxShadow: {
        elevated: "0 16px 40px rgba(0,0,0,0.35)",
        card: "0 10px 24px rgba(0,0,0,0.28)"
      },
      transitionTimingFunction: {
        snappy: "cubic-bezier(0.2,0,0,1)"
      }
    }
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")]
};
