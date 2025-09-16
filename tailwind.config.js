/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#1e40af',
          600: '#1d4ed8',
          700: '#1e3a8a',
        },
        secondary: {
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
        },
        accent: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        success: {
          500: '#059669',
          600: '#047857',
        },
        warning: {
          500: '#d97706',
          600: '#b45309',
        },
        error: {
          500: '#dc2626',
          600: '#b91c1c',
        },
        info: {
          500: '#0284c7',
          600: '#0369a1',
        },
        surface: '#ffffff',
        background: '#f8fafc',
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'focus': '0 0 0 3px rgba(59, 130, 246, 0.1)',
      },
    },
  },
  plugins: [],
};