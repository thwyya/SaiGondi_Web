/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'ml': '480px',     
        '1.5xl': '1440px', 
      },
      animation: {
        'spin-slow': 'spin 10s linear infinite', // quay 1 vòng trong 10 giây
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}
