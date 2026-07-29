/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    // Design width 1440px. Custom breakpoints per spec.
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1440px',
      '2xl': '1920px',
    },
    extend: {
      fontSize: {
        display: ['clamp(2.75rem,7vw,6rem)', { lineHeight: '0.92' }],
        stat: ['clamp(2.75rem,6vw,4rem)', { lineHeight: '1' }],
        h2: ['clamp(2rem,5vw,3rem)', { lineHeight: '1.15' }],
        price: ['2rem', { lineHeight: '1' }],
        h3: ['clamp(1.25rem,3vw,1.5rem)', { lineHeight: '1.2' }],
        body: ['clamp(0.95rem,2.2vw,1rem)', { lineHeight: '1.5' }],
        small: ['0.875rem', { lineHeight: '1.5' }],
        eyebrow: ['clamp(0.75rem,1.6vw,0.875rem)', { lineHeight: '1.4' }],
        xs: ['0.75rem', { lineHeight: '1.4' }],
        nav: ['0.75rem', { lineHeight: '1' }],
      },
      colors: {
        bg: '#111111',
        'bg-card': 'rgba(22,22,22,0.85)',
        dark: '#161616',
        bitcoin: '#f7931a',
        blue: '#1a88f7',
        title: '#ebecf0',
        white: '#ffffff',
        muted: '#8b8a88',
        'muted-light': '#f5f5f5',
        invert: '#2f2f2f',
        border: '#3a3a3a',
        'border-card': '#e4e4e7',
      },
      fontFamily: {
        display: ["'Silkscreen'", 'monospace'],
        serif: ["'Instrument Serif'", 'serif'],
        sans: ["'Plus Jakarta Sans'", 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '128px',
        card: '30px',
      },
      backgroundImage: {
        'hero-overlay':
          'linear-gradient(180deg, rgba(0,0,0,0) 0.7%, #111 83%)',
      },
    },
  },
  plugins: [],
};
