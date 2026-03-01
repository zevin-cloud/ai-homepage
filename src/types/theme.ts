// 主题ID枚举
export type ThemeId =
  | 'organic-bento'
  | 'cyberpunk-neon'
  | 'luxury-dark'
  | 'cyber-tech'
  | 'swiss-minimalist'
  | 'pastel-dream';

// 字体配置
export interface FontConfig {
  primary: string;
  secondary?: string;
  mono?: string;
  googleFontsUrl: string;
}

// 颜色配置
export interface ColorConfig {
  // 背景色
  background: string;
  backgroundGradient?: string;
  backgroundPattern?: string;

  // 卡片颜色
  card: string;
  cardHover?: string;
  cardBorder: string;

  // 主色调
  primary: string;
  primaryLight?: string;
  primaryDark?: string;

  // 强调色
  accent1: string;
  accent2: string;
  accent3: string;
  accent4?: string;

  // 文字颜色
  textMain: string;
  textSecondary: string;
  textMuted: string;

  // 状态色
  success: string;
  warning: string;
  error: string;
  info: string;
}

// 圆角配置
export interface BorderRadiusConfig {
  small: string;
  medium: string;
  large: string;
  xl: string;
  card: string;
  button: string;
  avatar: string;
}

// 阴影配置
export interface ShadowConfig {
  small: string;
  medium: string;
  large: string;
  card: string;
  cardHover: string;
  glow?: string;
}

// 边框配置
export interface BorderConfig {
  width: string;
  style: string;
  color: string;
}

// 布局配置
export interface LayoutConfig {
  headerHeight: string;
  maxWidth: string;
  gridGap: string;
  cardPadding: string;
  sectionSpacing: string;
}

// 动画配置
export interface AnimationConfig {
  duration: string;
  easing: string;
  hoverTransform: string;
  hoverTransition: string;
}

// 特殊效果配置
export interface EffectsConfig {
  glassmorphism?: boolean;
  scanlines?: boolean;
  neonGlow?: boolean;
  gradientText?: boolean;
  borderAccent?: boolean;
}

// 完整主题配置
export interface ThemeConfig {
  id: ThemeId;
  name: string;
  nameZh: string;
  description: string;
  previewImage: string;
  fonts: FontConfig;
  colors: ColorConfig;
  borderRadius: BorderRadiusConfig;
  shadows: ShadowConfig;
  border: BorderConfig;
  layout: LayoutConfig;
  animation: AnimationConfig;
  effects: EffectsConfig;
  // CSS类名前缀
  classPrefix: string;
}

// 主题预览信息
export interface ThemePreview {
  id: ThemeId;
  name: string;
  nameZh: string;
  description: string;
  previewImage: string;
  colors: {
    primary: string;
    background: string;
    accent: string;
  };
}

// 布局模式ID
export type LayoutMode = 'auto' | 'compact' | 'loose' | 'random' | 'masonry';

// 布局配置
export interface LayoutModeConfig {
  id: LayoutMode;
  name: string;
  nameZh: string;
  description: string;
  icon: string;
}

// 卡片大小类型
export type CardSize = 'large' | 'medium' | 'small' | 'wide' | 'tall';

// 布局模式预览
export interface LayoutModePreview {
  id: LayoutMode;
  name: string;
  nameZh: string;
  description: string;
  icon: string;
}

// 自定义布局行模式
export type RowPattern = 'equal' | 'large-small' | 'small-large' | 'large-medium' | 'medium-large' | 'full';

// 自定义布局行配置
export interface CustomLayoutRow {
  cardCount: number;      // 卡片数量 (1-4)
  pattern: RowPattern;    // 排列模式
}

// 自定义布局配置
export interface CustomLayoutConfig {
  rows: CustomLayoutRow[];
}

// 布局模式扩展
export type ExtendedLayoutMode = LayoutMode | 'custom';
