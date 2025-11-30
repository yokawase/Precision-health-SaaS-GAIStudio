/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Helvetica Neue"', '"Hiragino Kaku Gothic ProN"', '"Noto Sans JP"', 'sans-serif'],
      },
      colors: {
        primary: '#0f172a',
        sidebar: '#1e293b', // The requested navy color
        accent: '#2563eb',  // Standard Blue
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        bg: '#f8fafc',
      }
    },
  },
  plugins: [],
}