// shared/tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '../student-app/src/**/*.{js,jsx,ts,tsx}',
    '../admin-app/src/**/*.{js,jsx,ts,tsx}',
    '../delivery-app/src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2A7F9E',
        secondary: '#F5A623',
        neutral: '#212121'
      },
      spacing: {
        1: '8px',
        2: '16px',
        3: '24px',
        4: '32px'
      },
      borderRadius: {
        DEFAULT: '4px'
      }
    }
  },
  plugins: []
};
