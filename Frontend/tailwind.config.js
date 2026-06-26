/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#0f0f0f',
        card: '#1a1a1a',
        editor: '#242424',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
