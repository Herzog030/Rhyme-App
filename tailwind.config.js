/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'sans-serif',
        ],
        display: [
          'Fraunces',
          'ui-serif',
          'Georgia',
          'serif',
        ],
      },
      colors: {
        // Warme Cremes als Haupt-Fläche
        cream: {
          50: '#fefdfa',
          100: '#faf7ef',
          200: '#f4efe1',
          300: '#ebe4d0',
          400: '#ddd2b5',
        },
        // Saftiges Grün als Akzent (inspiriert von frischem Moos / Limette)
        leaf: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Ruhige, warme Greytones für Text + Rahmen
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e0',
          300: '#d6d3ce',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(28, 25, 23, 0.04), 0 8px 24px rgba(28, 25, 23, 0.05)',
        pop: '0 12px 32px rgba(21, 128, 61, 0.18)',
      },
    },
  },
  plugins: [],
};
