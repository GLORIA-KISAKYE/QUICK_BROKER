/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#495057',
        secondary: '#6c757d',
        accent: '#f8f9fa',
        border: '#dee2e6',
        text: '#212529',
        muted: '#6c757d',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
      }
    },
  },
  plugins: [],
};
