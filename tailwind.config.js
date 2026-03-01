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
        // 原有颜色配置（向后兼容）
        background: "#f9f4f1",
        primary: "#2563eb",
        "text-main": "#111827",
        "text-secondary": "#6b7280",
        
        // 主题系统颜色 - 使用CSS变量
        'theme-bg': 'var(--theme-bg)',
        'theme-card': 'var(--theme-card)',
        'theme-card-hover': 'var(--theme-card-hover)',
        'theme-card-border': 'var(--theme-card-border)',
        'theme-primary': 'var(--theme-primary)',
        'theme-primary-light': 'var(--theme-primary-light)',
        'theme-primary-dark': 'var(--theme-primary-dark)',
        'theme-accent-1': 'var(--theme-accent-1)',
        'theme-accent-2': 'var(--theme-accent-2)',
        'theme-accent-3': 'var(--theme-accent-3)',
        'theme-accent-4': 'var(--theme-accent-4)',
        'theme-text-main': 'var(--theme-text-main)',
        'theme-text-secondary': 'var(--theme-text-secondary)',
        'theme-text-muted': 'var(--theme-text-muted)',
        'theme-success': 'var(--theme-success)',
        'theme-warning': 'var(--theme-warning)',
        'theme-error': 'var(--theme-error)',
        'theme-info': 'var(--theme-info)',
      },
      borderRadius: {
        'theme-sm': 'var(--theme-radius-sm)',
        'theme-md': 'var(--theme-radius-md)',
        'theme-lg': 'var(--theme-radius-lg)',
        'theme-xl': 'var(--theme-radius-xl)',
        'theme-card': 'var(--theme-radius-card)',
        'theme-button': 'var(--theme-radius-button)',
        'theme-avatar': 'var(--theme-radius-avatar)',
      },
      boxShadow: {
        'theme-sm': 'var(--theme-shadow-sm)',
        'theme-md': 'var(--theme-shadow-md)',
        'theme-lg': 'var(--theme-shadow-lg)',
        'theme-card': 'var(--theme-shadow-card)',
        'theme-card-hover': 'var(--theme-shadow-card-hover)',
        'theme-glow': 'var(--theme-shadow-glow)',
      },
      fontFamily: {
        sans: ['Inter', '"Noto Sans SC"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'SimHei', 'Arial', 'Helvetica', 'sans-serif'],
        'theme-primary': 'var(--theme-font-primary)',
        'theme-secondary': 'var(--theme-font-secondary)',
        'theme-mono': 'var(--theme-font-mono)',
      },
      spacing: {
        'theme-header': 'var(--theme-header-height)',
        'theme-gap': 'var(--theme-grid-gap)',
        'theme-card-padding': 'var(--theme-card-padding)',
        'theme-section': 'var(--theme-section-spacing)',
      },
      maxWidth: {
        'theme': 'var(--theme-max-width)',
      },
      transitionTimingFunction: {
        'theme': 'var(--theme-easing)',
      },
      transitionDuration: {
        'theme': 'var(--theme-duration)',
      },
      backgroundImage: {
        'hero-pattern': "url('/src/assets/images/mkqz1zx0-eigpxf4.png')",
      }
    },
  },
  plugins: [],
};
