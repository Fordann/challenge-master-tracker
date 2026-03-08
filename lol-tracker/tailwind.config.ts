import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0A0F',
        'bg-secondary': '#0F1923',
        'bg-card': '#1A1F2E',
        'accent-gold': '#C89B3C',
        'accent-gold-light': '#F0E6C8',
        'accent-blue': '#0BC4E3',
        'accent-red': '#D44B4B',
        'accent-green': '#3CB95E',
        'text-primary': '#F0E6C8',
        'text-secondary': '#A0A0B0',
        'flame-cold': '#606060',
        'flame-low': '#FF8C00',
        'flame-mid': '#FF4500',
        'flame-hot': '#FFD700',
      },
      fontFamily: {
        beaufort: ['Beaufort for LOL', 'Cinzel', 'serif'],
        spiegel: ['Spiegel', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
