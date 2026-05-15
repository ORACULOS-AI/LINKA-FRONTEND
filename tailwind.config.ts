import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--color-ink)',
        paper: 'var(--color-paper)',
        mint: {
          DEFAULT: 'var(--color-mint)',
          50: 'var(--color-mint-50)',
        },
        'selinka-blue': 'var(--color-blue)',
        purple: 'var(--color-purple)',
        orange: 'var(--color-orange)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-exo2)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      backgroundImage: {
        'pattern-mint-on-purple': "url('/selinka/pattern-mint-on-purple.png')",
        'pattern-purple-on-mint': "url('/selinka/pattern-purple-on-mint.png')",
        'pattern-orange-on-blue': "url('/selinka/pattern-orange-on-blue.png')",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
