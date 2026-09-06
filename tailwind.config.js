/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neo': '3px 3px 0px 0px rgba(17,24,39,0.15)',
        'neo-strong': '4px 4px 0px 0px rgba(17,24,39,1)',
      }
    },
  },
  plugins: [],
}