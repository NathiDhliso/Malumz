/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'e1-bg': '#09060A',
        'e1-primary': '#C2491A',
        'e1-secondary': '#C8891E',
        'e1-highlight': '#E4BE6A',
        'e1-text': '#F0E2CB',
        'e1-text-muted': '#907A61',
        'e1-surface': '#1E0D05',
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
