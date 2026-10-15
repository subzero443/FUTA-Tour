/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: { colors: { ink: '#241347', violet: '#7144ed', lavender: '#f2edff' }, fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] } } },
  plugins: []
};
