/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'malumz-orange': '#CC5500',
        'malumz-orange-dark': '#A04000',
        'malumz-brown': '#5C4033',
        'malumz-gold': '#DAA520',
        'malumz-cream': '#F9F7F2',
        'malumz-paper': '#F0EBE0',
        'malumz-text-primary': '#2D241E',
        'malumz-text-secondary': '#5C4033',
        'malumz-text-muted': '#8C7B70',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
        'accent': ['Merriweather', 'serif'],
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