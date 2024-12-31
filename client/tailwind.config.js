/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}', // Adjust the path to your Vue files
    './node_modules/primeui/**/*.{vue,js,ts,jsx,tsx}', // Include PrimeVue
  ],
  theme: {
    extend: {
      // Customize your Tailwind theme here, if needed
    },
  },
  plugins: [
    require('tailwindcss-primeui'), // Add PrimeVue TailwindCSS plugin
  ],
}
