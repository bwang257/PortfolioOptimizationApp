import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bce4ca',
          300: '#8fcea5',
          400: '#5cb078',
          500: '#38915a', // Deep forest green - primary
          600: '#2a7447',
          700: '#235c3a',
          800: '#1f4a31',
          900: '#1a3e29',
          950: '#0d2115',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98', // Trustworthy navy
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0a1c2e',
        },
      },
      borderRadius: {
        'card': '16px',
        'card-sm': '12px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};
export default config;