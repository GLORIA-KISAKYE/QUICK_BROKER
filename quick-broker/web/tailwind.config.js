/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#B07D4F',
        secondary: '#D4A574',
        accent: '#f5f5f5',
        border: '#e0e0e0',
        text: '#1a1a1a',
        muted: '#888888',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
      }
    },
  },
  plugins: [],
};
