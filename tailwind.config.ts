import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pb: {
          green: '#00ff6a',
          red: '#ff3b3b',
          orange: '#ff8c00',
          dark: '#0a0a0f',
          card: '#141420',
          border: '#1e1e30',
          muted: '#8888aa',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
