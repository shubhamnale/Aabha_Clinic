/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        blush: '#E85D8E',
        plum: '#4A1D35',
        rosewash: '#FFF7FA',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 50px rgba(74, 29, 53, 0.18)',
      },
    },
  },
  plugins: [],
}
