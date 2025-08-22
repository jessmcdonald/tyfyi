/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      // Override default colors to include black and white
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000000',
      white: '#ffffff',
      red: {
        500: '#ef4444',
        600: '#dc2626',
        800: '#991b1b',
      },
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
      },
      yellow: {
        100: '#fef3c7',
        500: '#eab308',
      },
      green: {
        50: '#f0fdf4',
        300: '#86efac',
        500: '#22c55e',
        800: '#166534',
      },
      blue: {
        500: '#3b82f6',
      },
    },
    extend: {},
  },
  plugins: [],
}
