/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        kanri: {
          bg: '#0f1117',
          surface: '#1a1d27',
          border: 'rgba(255,255,255,0.08)',
        },
      },
      animation: {
        'spin': 'spin 0.8s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-kanri': 'linear-gradient(to right, #6366f1, #8b5cf6)',
        'gradient-kanri-radial': 'radial-gradient(ellipse at top, #1a1d27, #0f1117)',
      },
      boxShadow: {
        'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.3)',
      },
    },
  },
  plugins: [],
};
