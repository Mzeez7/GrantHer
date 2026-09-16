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
          dark: '#160829',
          purple: {
            950: '#150628',
            900: '#1E0A3C',
            800: '#2A114B',
            700: '#3D1B68',
            600: '#55288B',
            500: '#753EAE',
            100: '#F1E9FA',
            50: '#F8F4FD',
          },
          gold: {
            600: '#C77D0A',
            500: '#E59819',
            400: '#F5A623',
            300: '#FBC263',
            100: '#FDF2DC',
            50: '#FEF9EE',
          },
          slate: {
            950: '#090D16',
            900: '#0F172A',
            800: '#1E293B',
            700: '#334155',
            600: '#475569',
            500: '#64748B',
            400: '#94A3B8',
            300: '#CBD5E1',
            200: '#E2E8F0',
            100: '#F1F5F9',
            50: '#F8F9FC',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'elevated': '0 4px 20px -2px rgba(42, 17, 75, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'executive': '0 10px 30px -4px rgba(30, 10, 60, 0.12), 0 4px 12px -2px rgba(30, 10, 60, 0.06)',
      }
    },
  },
  plugins: [],
}
