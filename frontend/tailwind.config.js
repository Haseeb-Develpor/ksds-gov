/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eefbf3',
          100: '#d6f5e1',
          200: '#b0e9c7',
          300: '#7bd6a5',
          400: '#43bb7e',
          500: '#1f9e61',
          600: '#127f4d',
          700: '#0e6540',
          800: '#0c5035',
          900: '#0a422d',
          950: '#04251a',
        },
        gold: {
          50: '#fbf8ef',
          100: '#f5edd2',
          200: '#ebd9a3',
          300: '#dfbf6c',
          400: '#d4a843',
          500: '#c69128',
          600: '#a8721f',
          700: '#86541d',
          800: '#70441f',
          900: '#5f391e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        arabic: ['"Noto Kufi Arabic"', 'Tajawal', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(4, 37, 26, 0.12)',
        soft: '0 4px 24px rgba(0, 0, 0, 0.06)',
        gold: '0 6px 24px rgba(198, 145, 40, 0.25)',
      },
      backgroundImage: {
        'hero-radial': 'radial-gradient(circle at 30% 20%, rgba(31,158,97,0.18), transparent 60%)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
