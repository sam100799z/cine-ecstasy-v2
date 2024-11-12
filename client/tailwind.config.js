// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hero-pattern': "url('/src/assets/back.png')",
      },
      colors: {
        customYellow: '#ffd773',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        bungee: ['Bungee', 'sans-serif'],
        itim: ['Itim', 'sans-serif'],
        bungeeShade: ['Bungee Shade', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
