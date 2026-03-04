/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spring-up': 'springUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'border-glow': 'borderGlow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        springUp: {
          '0%': { opacity: '0', transform: 'translateY(40px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        borderGlow: {
          '0%': { borderColor: 'rgba(143, 182, 200, 0.2)', boxShadow: '0 0 5px rgba(143, 182, 200, 0.1)' },
          '100%': { borderColor: 'rgba(143, 182, 200, 0.8)', boxShadow: '0 0 20px rgba(143, 182, 200, 0.4)' },
        }
      },
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
