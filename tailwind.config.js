/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./views/**/*.html`], // all .html files
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: ["fantasy","light","dark"] // Add your desired theme here (e.g., "fantasy", "light", "dark", etc.)
  }
}