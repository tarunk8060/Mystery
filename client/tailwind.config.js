/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        detective: {
          bg: "#0B0D12",
          surface: "#121722",
          card: "#181E2A",
          border: "#2A3241",
          text: "#F4F5F7",
          muted: "#A2ABBA",
          gold: "#D6B36A",
          'gold-hover': "#E2C37E",
          blue: "#769BDA",
          'blue-hover': "#8DB0EB",
          error: "#E16D70",
          success: "#70C49B",
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        serif: ['Cinzel', 'Georgia', 'serif'],
      },
      boxShadow: {
        'detective-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(214, 179, 106, 0.1)',
        'detective-gold': '0 0 15px rgba(214, 179, 106, 0.25)',
        'detective-blue': '0 0 15px rgba(118, 155, 218, 0.25)',
      },
    },
  },
  plugins: [],
};
