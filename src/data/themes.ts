import type { ThemeConfig, ThemePreview, ThemeId } from '@/types/theme';

// 主题1: Organic Bento (有机便当风)
const organicBentoTheme: ThemeConfig = {
  id: 'organic-bento',
  name: 'Organic Bento',
  nameZh: '有机便当',
  description: '温暖的大地色调，圆角卡片，手绘感设计',
  previewImage: '/model/ai_portal_dashboard_dark_mode_1/screen.png',
  classPrefix: 'theme-organic',
  fonts: {
    primary: '"DM Sans", sans-serif',
    secondary: '"Playfair Display", serif',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap',
  },
  colors: {
    background: '#F7F5EE',
    backgroundGradient: 'radial-gradient(#E6DCC8 1px, transparent 1px)',
    backgroundPattern: 'background-size: 32px 32px;',
    card: '#FFFFFF',
    cardHover: '#FDFCF8',
    cardBorder: '#2C2A26',
    primary: '#8FB6C8',
    primaryLight: '#DAE8EE',
    primaryDark: '#6B9AB0',
    accent1: '#E89A80',
    accent2: '#A8C6AA',
    accent3: '#E8C56B',
    accent4: '#E6DCC8',
    textMain: '#2C2A26',
    textSecondary: '#595650',
    textMuted: '#8B8680',
    success: '#A8C6AA',
    warning: '#E8C56B',
    error: '#E89A80',
    info: '#8FB6C8',
  },
  borderRadius: {
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
    xl: '2rem',
    card: '1.5rem',
    button: '2rem',
    avatar: '50%',
  },
  shadows: {
    small: '0 2px 8px rgba(44, 42, 38, 0.06)',
    medium: '0 4px 16px rgba(44, 42, 38, 0.08)',
    large: '0 10px 30px -10px rgba(44, 42, 38, 0.12)',
    card: '0 4px 20px rgba(44, 42, 38, 0.08)',
    cardHover: '6px 6px 0px 0px rgba(44, 42, 38, 1)',
  },
  border: {
    width: '2px',
    style: 'solid',
    color: '#2C2A26',
  },
  layout: {
    headerHeight: '80px',
    maxWidth: '1280px',
    gridGap: '1.5rem',
    cardPadding: '1.5rem',
    sectionSpacing: '4rem',
  },
  animation: {
    duration: '0.3s',
    easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
    hoverTransform: 'translateY(-4px)',
    hoverTransition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  },
  effects: {
    glassmorphism: false,
    scanlines: false,
    neonGlow: false,
    gradientText: false,
    borderAccent: true,
  },
};

// 主题2: Cyberpunk Neon (赛博朋克霓虹)
const cyberpunkNeonTheme: ThemeConfig = {
  id: 'cyberpunk-neon',
  name: 'Cyberpunk Neon',
  nameZh: '赛博霓虹',
  description: '深色背景，霓虹发光效果，科技感十足',
  previewImage: '/model/ai_portal_dashboard_dark_mode_2/screen.png',
  classPrefix: 'theme-cyberpunk',
  fonts: {
    primary: '"Space Grotesk", sans-serif',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
  },
  colors: {
    background: '#050408',
    backgroundGradient: `
      radial-gradient(circle at 10% 20%, rgba(188, 19, 254, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 40%)
    `,
    card: 'rgba(20, 15, 30, 0.7)',
    cardHover: 'rgba(30, 20, 50, 0.8)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    primary: '#BC13FE',
    primaryLight: '#D946EF',
    primaryDark: '#9333EA',
    accent1: '#00FFFF',
    accent2: '#FF00FF',
    accent3: '#00FF88',
    accent4: '#FF6B35',
    textMain: '#F0F0F0',
    textSecondary: '#A0A0B0',
    textMuted: '#6B7280',
    success: '#00FF88',
    warning: '#FFB800',
    error: '#FF003C',
    info: '#00FFFF',
  },
  borderRadius: {
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
    xl: '2rem',
    card: '1.5rem',
    button: '2rem',
    avatar: '50%',
  },
  shadows: {
    small: '0 0 10px rgba(188, 19, 254, 0.3)',
    medium: '0 0 20px rgba(188, 19, 254, 0.2)',
    large: '0 0 40px rgba(188, 19, 254, 0.15)',
    card: '0 4px 20px rgba(0,0,0,0.3)',
    cardHover: '0 0 30px rgba(188, 19, 254, 0.3)',
    glow: '0 0 20px rgba(188, 19, 254, 0.4)',
  },
  border: {
    width: '1px',
    style: 'solid',
    color: 'rgba(255, 255, 255, 0.1)',
  },
  layout: {
    headerHeight: '80px',
    maxWidth: '1280px',
    gridGap: '1.5rem',
    cardPadding: '1.5rem',
    sectionSpacing: '4rem',
  },
  animation: {
    duration: '0.4s',
    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    hoverTransform: 'translateY(-5px) scale(1.02)',
    hoverTransition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  effects: {
    glassmorphism: true,
    scanlines: false,
    neonGlow: true,
    gradientText: true,
    borderAccent: true,
  },
};

// 主题3: Luxury Dark (奢华暗黑)
const luxuryDarkTheme: ThemeConfig = {
  id: 'luxury-dark',
  name: 'Luxury Dark',
  nameZh: '奢华暗黑',
  description: '高端商务感，金色点缀，优雅排版',
  previewImage: '/model/ai_portal_dashboard_dark_mode_3/screen.png',
  classPrefix: 'theme-luxury',
  fonts: {
    primary: '"DM Sans", sans-serif',
    secondary: '"Playfair Display", serif',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap',
  },
  colors: {
    background: '#121212',
    backgroundGradient: 'radial-gradient(circle at 50% -20%, #2A2A2A 0%, #121212 100%)',
    card: '#1A1A1A',
    cardHover: '#222222',
    cardBorder: 'rgba(212, 175, 55, 0.2)',
    primary: '#D4AF37',
    primaryLight: '#F1E5AC',
    primaryDark: '#B8960C',
    accent1: '#B87333',
    accent2: '#804A00',
    accent3: '#E5E4E2',
    accent4: '#C0C0C0',
    textMain: '#E5E4E2',
    textSecondary: '#A0A0A0',
    textMuted: '#666666',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  },
  borderRadius: {
    small: '0.25rem',
    medium: '0.5rem',
    large: '0.75rem',
    xl: '1rem',
    card: '0.5rem',
    button: '0.25rem',
    avatar: '50%',
  },
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.4)',
    large: '0 8px 32px rgba(0, 0, 0, 0.5)',
    card: '0 4px 20px rgba(0, 0, 0, 0.3)',
    cardHover: '0 0 20px rgba(212, 175, 55, 0.1)',
  },
  border: {
    width: '1px',
    style: 'solid',
    color: 'rgba(212, 175, 55, 0.2)',
  },
  layout: {
    headerHeight: '80px',
    maxWidth: '1280px',
    gridGap: '1.5rem',
    cardPadding: '2rem',
    sectionSpacing: '5rem',
  },
  animation: {
    duration: '0.4s',
    easing: 'ease',
    hoverTransform: 'translateY(-2px)',
    hoverTransition: 'all 0.4s ease',
  },
  effects: {
    glassmorphism: false,
    scanlines: false,
    neonGlow: false,
    gradientText: true,
    borderAccent: true,
  },
};

// 主题4: Cyber-Tech (赛博科技)
const cyberTechTheme: ThemeConfig = {
  id: 'cyber-tech',
  name: 'Cyber Tech',
  nameZh: '赛博科技',
  description: '硬核科技风，扫描线效果，等宽字体',
  previewImage: '/model/ai_portal_dashboard_dark_mode_4/screen.png',
  classPrefix: 'theme-cybertech',
  fonts: {
    primary: '"Rajdhani", sans-serif',
    mono: '"Share Tech Mono", monospace',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap',
  },
  colors: {
    background: '#050A14',
    backgroundGradient: `
      linear-gradient(rgba(5, 10, 20, 0.9), rgba(5, 10, 20, 0.95)),
      url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-opacity='0.05' fill='%2300F0FF' fill-rule='evenodd'/%3E%3C/svg%3E")
    `,
    card: 'rgba(15, 23, 42, 0.6)',
    cardHover: 'rgba(30, 41, 59, 0.7)',
    cardBorder: 'rgba(0, 240, 255, 0.3)',
    primary: '#00F0FF',
    primaryLight: '#5CF2FF',
    primaryDark: '#00B8C4',
    accent1: '#FF003C',
    accent2: '#0AFF60',
    accent3: '#BD00FF',
    accent4: '#FFB800',
    textMain: '#E2E8F0',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    success: '#0AFF60',
    warning: '#FFB800',
    error: '#FF003C',
    info: '#00F0FF',
  },
  borderRadius: {
    small: '0.25rem',
    medium: '0.5rem',
    large: '0.5rem',
    xl: '0.5rem',
    card: '0.5rem',
    button: '0.25rem',
    avatar: '0.25rem',
  },
  shadows: {
    small: '0 0 5px rgba(0, 240, 255, 0.3)',
    medium: '0 0 10px rgba(0, 240, 255, 0.2)',
    large: '0 0 20px rgba(0, 240, 255, 0.15)',
    card: '0 4px 20px rgba(0, 0, 0, 0.4)',
    cardHover: '0 0 15px rgba(0, 240, 255, 0.4)',
    glow: '0 0 10px rgba(0, 240, 255, 0.5)',
  },
  border: {
    width: '1px',
    style: 'solid',
    color: 'rgba(0, 240, 255, 0.3)',
  },
  layout: {
    headerHeight: '80px',
    maxWidth: '1280px',
    gridGap: '1.5rem',
    cardPadding: '1.5rem',
    sectionSpacing: '4rem',
  },
  animation: {
    duration: '0.3s',
    easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
    hoverTransform: 'translateY(-2px)',
    hoverTransition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  },
  effects: {
    glassmorphism: true,
    scanlines: true,
    neonGlow: true,
    gradientText: false,
    borderAccent: true,
  },
};

// 主题5: Swiss Minimalist (瑞士极简)
const swissMinimalistTheme: ThemeConfig = {
  id: 'swiss-minimalist',
  name: 'Swiss Minimalist',
  nameZh: '瑞士极简',
  description: '包豪斯风格，大胆色块，几何图形',
  previewImage: '/model/ai_portal_dashboard_dark_mode_5/screen.png',
  classPrefix: 'theme-swiss',
  fonts: {
    primary: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap',
  },
  colors: {
    background: '#F2F2F2',
    card: '#FFFFFF',
    cardHover: '#FFFFFF',
    cardBorder: '#000000',
    primary: '#007AFF',
    primaryLight: '#5AC8FA',
    primaryDark: '#0051D5',
    accent1: '#FF3B30',
    accent2: '#FFCC00',
    accent3: '#000000',
    accent4: '#8E8E93',
    textMain: '#000000',
    textSecondary: '#8E8E93',
    textMuted: '#D1D1D6',
    success: '#34C759',
    warning: '#FFCC00',
    error: '#FF3B30',
    info: '#007AFF',
  },
  borderRadius: {
    small: '0',
    medium: '0',
    large: '0',
    xl: '0',
    card: '0',
    button: '0',
    avatar: '0',
  },
  shadows: {
    small: 'none',
    medium: 'none',
    large: 'none',
    card: 'none',
    cardHover: 'none',
  },
  border: {
    width: '2px',
    style: 'solid',
    color: '#000000',
  },
  layout: {
    headerHeight: '80px',
    maxWidth: '1280px',
    gridGap: '1rem',
    cardPadding: '2rem',
    sectionSpacing: '5rem',
  },
  animation: {
    duration: '0.2s',
    easing: 'ease',
    hoverTransform: 'translateY(-2px)',
    hoverTransition: 'transform 0.2s ease',
  },
  effects: {
    glassmorphism: false,
    scanlines: false,
    neonGlow: false,
    gradientText: false,
    borderAccent: false,
  },
};

// 主题6: Pastel Dream (梦幻粉彩)
const pastelDreamTheme: ThemeConfig = {
  id: 'pastel-dream',
  name: 'Pastel Dream',
  nameZh: '梦幻粉彩',
  description: '柔和粉彩，圆润设计，友好亲切',
  previewImage: '/model/ai_portal_dashboard_dark_mode_6/screen.png',
  classPrefix: 'theme-pastel',
  fonts: {
    primary: '"Quicksand", "Nunito", sans-serif',
    secondary: '"Nunito", sans-serif',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap',
  },
  colors: {
    background: '#FFFDF9',
    backgroundGradient: `
      radial-gradient(at 10% 10%, rgba(243, 232, 255, 0.7) 0px, transparent 50%),
      radial-gradient(at 90% 90%, rgba(204, 251, 241, 0.7) 0px, transparent 50%),
      radial-gradient(at 50% 50%, rgba(254, 249, 195, 0.4) 0px, transparent 50%)
    `,
    card: '#FFFFFF',
    cardHover: '#FFFFFF',
    cardBorder: 'rgba(255, 255, 255, 0.6)',
    primary: '#9333EA',
    primaryLight: '#D8B4FE',
    primaryDark: '#7E22CE',
    accent1: '#FECDD3',
    accent2: '#CCFBF1',
    accent3: '#BAE6FD',
    accent4: '#FEF9C3',
    textMain: '#475569',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    success: '#6EE7B7',
    warning: '#FCD34D',
    error: '#FCA5A5',
    info: '#93C5FD',
  },
  borderRadius: {
    small: '1rem',
    medium: '1.5rem',
    large: '2rem',
    xl: '2.5rem',
    card: '2rem',
    button: '2rem',
    avatar: '50%',
  },
  shadows: {
    small: '0 4px 12px rgba(0, 0, 0, 0.05)',
    medium: '0 8px 24px rgba(0, 0, 0, 0.08)',
    large: '0 20px 40px -10px rgba(216, 180, 254, 0.5)',
    card: '0 20px 40px -10px rgba(216, 180, 254, 0.3)',
    cardHover: '0 25px 50px -10px rgba(216, 180, 254, 0.4)',
  },
  border: {
    width: '1px',
    style: 'solid',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  layout: {
    headerHeight: '80px',
    maxWidth: '1280px',
    gridGap: '2rem',
    cardPadding: '2rem',
    sectionSpacing: '5rem',
  },
  animation: {
    duration: '0.4s',
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    hoverTransform: 'translateY(-8px) scale(1.01)',
    hoverTransition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  effects: {
    glassmorphism: true,
    scanlines: false,
    neonGlow: false,
    gradientText: true,
    borderAccent: false,
  },
};

// 所有主题配置映射
export const themes: Record<ThemeId, ThemeConfig> = {
  'organic-bento': organicBentoTheme,
  'cyberpunk-neon': cyberpunkNeonTheme,
  'luxury-dark': luxuryDarkTheme,
  'cyber-tech': cyberTechTheme,
  'swiss-minimalist': swissMinimalistTheme,
  'pastel-dream': pastelDreamTheme,
};

// 默认主题
export const defaultThemeId: ThemeId = 'organic-bento';

// 获取主题配置
export function getTheme(themeId: ThemeId): ThemeConfig {
  return themes[themeId] || themes[defaultThemeId];
}

// 获取所有主题预览信息
export function getThemePreviews(): ThemePreview[] {
  return Object.values(themes).map((theme) => ({
    id: theme.id,
    name: theme.name,
    nameZh: theme.nameZh,
    description: theme.description,
    previewImage: theme.previewImage,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      accent: theme.colors.accent1,
    },
  }));
}

// 获取所有主题ID列表
export function getAllThemeIds(): ThemeId[] {
  return Object.keys(themes) as ThemeId[];
}

// 验证主题ID是否有效
export function isValidThemeId(themeId: string): themeId is ThemeId {
  return themeId in themes;
}
