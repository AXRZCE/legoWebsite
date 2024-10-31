/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs',    // Watch for changes in .html files in the views folder
    './public/**/*.ejs',   // Watch for changes in .html files in the public folder (if any)
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'), 
    require('daisyui')
  ],
  daisyui: {
    themes: ["fantasy","light","dark"] // Add your desired theme here (e.g., "fantasy", "light", "dark", etc.)
  }
}