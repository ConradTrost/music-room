/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}', // Adjust the path to your Vue files
    './node_modules/primeui/**/*.{vue,js,ts,jsx,tsx}', // Include PrimeVue
  ],
  theme: {
    colors: {
      primary: '#fff',
    },
    extend: {
      backgroundColor: '#fff',
    },
  },
  plugins: [
    require('tailwindcss-primeui'), // Add PrimeVue TailwindCSS plugin
  ],
}
