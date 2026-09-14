/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#0F6265',
          'teal-dark': '#094749',
          'teal-deep': '#063335',
          'teal-light': '#178589',
          'teal-soft': '#E6F4F4',
          coral: '#F43F5E',
          'coral-accent': '#FF6B6B',
          'coral-soft': '#FFF1F2',
          'slate-bg': '#F8FAFC',
          'card-border': '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Newsreader"', 'Georgia', 'serif'],
      },
      aspectRatio: {
        '16/10': '16 / 10',
        '16/9': '16 / 9',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

