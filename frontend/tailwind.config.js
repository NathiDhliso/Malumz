/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'e1-bg': '#FFFFFF',
        'e1-primary': '#C2491A',
        'e1-secondary': '#C8891E',
        'e1-highlight': '#E4BE6A',
        'e1-text': '#1A1A1A',
        'e1-text-muted': '#6B5B4F',
        'e1-surface': '#FFF8F0',
      },
      fontFamily: {
        'display': ['Fraunces', 'serif'],
        'sans': ['"DM Sans"', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
}
