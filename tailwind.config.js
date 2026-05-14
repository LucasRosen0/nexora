export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        nexora: {
          bg: 'rgb(var(--nx-bg) / <alpha-value>)',
          panel: 'rgb(var(--nx-panel) / <alpha-value>)',
          panel2: 'rgb(var(--nx-panel-2) / <alpha-value>)',
          text: 'rgb(var(--nx-text) / <alpha-value>)',
          muted: 'rgb(var(--nx-muted) / <alpha-value>)',
          line: 'rgb(var(--nx-line) / <alpha-value>)',
          primary: 'rgb(var(--nx-primary) / <alpha-value>)',
          accent: 'rgb(var(--nx-accent) / <alpha-value>)',
          glow: 'rgb(var(--nx-glow) / <alpha-value>)'
        }
      },
      boxShadow: {
        glow: '0 0 38px rgb(var(--nx-glow) / 0.34)',
        panel: '0 24px 80px rgb(0 0 0 / 0.28)'
      },
      backgroundImage: {
        'nexora-grid': 'linear-gradient(rgb(var(--nx-line) / .12) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--nx-line) / .12) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};
