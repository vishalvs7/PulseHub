// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-manrope)', 'Manrope', 'sans-serif'],
      },
      colors: {
        // Primary Charcoal Black Theme
        primary: {
          50: '#f9f6f0',
          100: '#e7e5e1',
          200: '#d3d0ca',
          300: '#b5b1a8',
          400: '#8b877d',
          500: '#63605a',
          600: '#111827',  // Main brand color — Charcoal Black
          700: '#0b1019',
          800: '#06080d',
          900: '#030406',
        },
        // Secondary warm neutral colors
        secondary: {
          50: '#faf8f5',
          100: '#f2efe9',
          200: '#e5e0d8',
          300: '#cfc8bd',
          400: '#a49c8e',
          500: '#7a7263',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Accent — Warm Terracotta
        accent: {
          50: '#fef5f0',
          100: '#fde8dc',
          200: '#f9cdb5',
          300: '#f4aa83',
          400: '#ed7e4a',
          500: '#e25d22',
          600: '#c2410c',
          700: '#9f330c',
          800: '#802a10',
          900: '#6a2310',
        },
        // Accent 2 — Soft Sage Green
        sage: {
          50: '#ecf7f3',
          100: '#d1ece2',
          200: '#a5d8c8',
          300: '#6fbea8',
          400: '#3f9d86',
          500: '#1f826b',
          600: '#047857',
          700: '#036348',
          800: '#054e3b',
          900: '#044032',
        },
        // Semantic colors
        success: {
          50: '#f0fdf4',
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      backgroundImage: {
        'gradient-charcoal': 'linear-gradient(135deg, #111827 0%, #030406 100%)',
        'gradient-brand': 'linear-gradient(135deg, #111827 0%, #c2410c 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(17, 24, 39, 0.04), 0 4px 12px rgba(17, 24, 39, 0.06)',
        'medium': '0 4px 20px rgba(17, 24, 39, 0.08)',
        'glow': '0 0 20px rgba(194, 65, 12, 0.2)',
      },
    },
  },
  plugins: [],
}
