/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        background: "#f9f4f1",
        primary: "#2563eb",
        "text-main": "#111827",
        "text-secondary": "#6b7280",
      },
      fontFamily: {
        sans: ['Inter', '"Noto Sans SC"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'SimHei', 'Arial', 'Helvetica', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('/src/assets/images/mkqz1zx0-eigpxf4.png')",
      }
    },
  },
  plugins: [],
};
