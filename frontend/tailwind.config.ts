import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '475px',      // Extra small devices (large phones)
      'sm': '640px',      // Small devices (tablets)
      'md': '768px',      // Medium devices (small laptops)
      'lg': '1024px',     // Large devices (laptops/desktops)
      'xl': '1280px',     // Extra large devices (large desktops)
      '2xl': '1536px',    // 2X large devices (larger desktops)

      // Custom breakpoints for specific use cases
      'tablet': '768px',     // Tablet portrait
      'laptop': '1024px',    // Laptop
      'desktop': '1280px',   // Desktop
      'wide': '1440px',      // Wide screens
      'ultrawide': '1920px', // Ultra-wide screens

      // Max-width breakpoints (mobile-first approach)
      'max-xs': { 'max': '474px' },
      'max-sm': { 'max': '639px' },
      'max-md': { 'max': '767px' },
      'max-lg': { 'max': '1023px' },
      'max-xl': { 'max': '1279px' },
    },
    extend: {
      colors: {
        primary: '#2563eb',    // Main brand blue (was primary)
        secondary: '#334155',  // Dark text (was secondary)
        light: '#f8fafc',      // Light background (was light)
        muted: '#94a3b8',

        //new color theme
        flamingo: '#ED553B',
        minsk: '#393280', //dark one 
        alto: '#D1D1D1',
        silver: '#C4C4C4'

      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config