import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light", "dark", "cupcake", "retro",
      "business", "coffee", "cyberpunk", "corporate", "dracula", 
      "emerald", "forest", "fantasy", "halloween", "luxury", 
      "night", "valentine", "wireframe", "lemonade", "lofi", 
      "garden", "winter", "aqua", "black", "luxury", "cmyk", 
      "autumn", "winter", "pastel", "vintage", "night", "synthwave",
      "acid", "solar", "midnight", "black", "cinnamon","neon"
    ]
  }
}
