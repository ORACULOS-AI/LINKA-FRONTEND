import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
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
        bg: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          2: 'var(--color-surface-2)',
        },
        mint: {
          DEFAULT: 'var(--color-mint)',
          15: 'var(--color-mint-15)',
          '08': 'var(--color-mint-08)',
        },
        blue: {
          DEFAULT: 'var(--color-blue)',
          15: 'var(--color-blue-15)',
          '08': 'var(--color-blue-08)',
        },
        purple: {
          DEFAULT: 'var(--color-purple)',
          15: 'var(--color-purple-15)',
          '08': 'var(--color-purple-08)',
        },
        orange: {
          DEFAULT: 'var(--color-orange)',
          15: 'var(--color-orange-15)',
          '08': 'var(--color-orange-08)',
        },
        fg: {
          1: 'var(--color-fg-1)',
          2: 'var(--color-fg-2)',
          3: 'var(--color-fg-3)',
          4: 'var(--color-fg-4)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
          focus: 'var(--color-border-focus)',
        },
        success: 'var(--color-success)',
        info: 'var(--color-info)',
        warn: 'var(--color-warn)',
        danger: 'var(--color-danger)',
      },
      fontFamily: {
        sans: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        1: 'var(--shadow-1)',
        2: 'var(--shadow-2)',
        3: 'var(--shadow-3)',
        focus: 'var(--shadow-focus)',
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        base: 'var(--motion-base)',
        slow: 'var(--motion-slow)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
        out: 'var(--ease-out)',
      },
      maxWidth: {
        content: 'var(--content-max)',
        narrow: 'var(--content-narrow)',
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
