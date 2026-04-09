// Tailwind CSS configuration — extends with Tailoryy brand tokens
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory:              '#FAF7F2',
        cream:              '#F5EFE6',
        terracotta:         '#C4704A',
        'terracotta-dark':  '#A3572F',
        'terracotta-light': '#F0D5C5',
        espresso:           '#2C1810',
        charcoal:           '#4A3728',
        muted:              '#9B8A7A',
        border:             '#E8DDD4',
        success:            '#3D7A4F',
        error:              '#C0392B',
        warning:            '#B8860B',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
      },
      boxShadow: {
        card:  '0 2px 16px rgba(44,24,16,0.08)',
        hover: '0 8px 32px rgba(44,24,16,0.14)',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
