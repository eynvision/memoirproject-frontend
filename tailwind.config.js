/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FBF7F1',
          deep: '#F4EDE2',
        },
        parchment: '#EFE4D3',
        ink: {
          DEFAULT: '#2A2521',
          soft: '#544C43',
        },
        clay: {
          50: '#FBF0E6',
          100: '#F3DBC0',
          300: '#DCA870',
          500: '#BD7A3C',
          600: '#A5652E',
          700: '#874F23',
        },
        navy: {
          DEFAULT: '#33415A',
          deep: '#232C3D',
        },
        gold: {
          200: '#E7D2A0',
          400: '#C79A4B',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Work Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(42, 37, 33, 0.28)',
        card: '0 12px 30px -12px rgba(42, 37, 33, 0.22)',
        frame: '0 1px 2px rgba(42,37,33,0.06), 0 20px 40px -18px rgba(42,37,33,0.35)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        photoIn: {
          '0%': { opacity: '0', transform: 'scale(0.96) rotate(0deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(var(--tilt, -2deg))' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(0.9)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-out both',
        photoIn: 'photoIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        sparkle: 'sparkle 2.4s ease-in-out infinite',
        toastIn: 'toastIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
