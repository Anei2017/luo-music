/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        luo: {
          black: '#0d0d0d',
          ink: '#1a1a1a',
          yellow: '#facc15',
          'yellow-bright': '#fde047',
          red: '#ef233c',
          green: '#22c55e',
          cream: '#fef9e7',
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', '"Anton"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'mega': '-0.04em',
      },
    },
  },
  plugins: [],
};
