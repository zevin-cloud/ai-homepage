import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { ThemeId, ThemeConfig, LayoutMode, CustomLayoutRow } from '@/types/theme';
import { getTheme, defaultThemeId, isValidThemeId } from '@/data/themes';

const STORAGE_KEY = 'ai-portal-theme';
const LAYOUT_STORAGE_KEY = 'ai-portal-layout';
const CUSTOM_LAYOUT_STORAGE_KEY = 'ai-portal-custom-layout';
const CUSTOM_LAYOUT_PRESET_STORAGE_KEY = 'ai-portal-custom-layout-preset';
const BACKGROUND_IMAGE_STORAGE_KEY = 'ai-portal-background-image';

// 布局模式配置
export const layoutModes: Record<LayoutMode | 'custom', { name: string; nameZh: string; description: string; icon: string }> = {
  'auto': {
    name: 'Auto',
    nameZh: '智能布局',
    description: '系统自动分配卡片大小，首图突出',
    icon: 'Sparkles'
  },
  'compact': {
    name: 'Compact',
    nameZh: '紧凑布局',
    description: '更多小卡片，信息密度高',
    icon: 'Grid3x3'
  },
  'loose': {
    name: 'Loose',
    nameZh: '宽松布局',
    description: '更多大卡片，视觉舒适',
    icon: 'LayoutGrid'
  },
  'random': {
    name: 'Random',
    nameZh: '随机布局',
    description: '每次刷新都不同的混合布局',
    icon: 'Shuffle'
  },
  'masonry': {
    name: 'Masonry',
    nameZh: '瀑布流布局',
    description: '错落有致的自然排列',
    icon: 'Columns'
  },
  'custom': {
    name: 'Custom',
    nameZh: '自定义布局',
    description: '自己制定每行卡片数量',
    icon: 'Settings'
  }
};

export const defaultLayoutMode: LayoutMode = 'auto';

// 自定义布局预设
export const customLayoutPresets: Record<string, { name: string; description: string; rows: CustomLayoutRow[] }> = {
  'two-per-row': {
    name: '双列布局',
    description: '每行显示2个卡片',
    rows: [{ cardCount: 2, pattern: 'equal' }, { cardCount: 2, pattern: 'equal' }]
  },
  'three-per-row': {
    name: '三列布局',
    description: '每行显示3个卡片',
    rows: [{ cardCount: 3, pattern: 'equal' }, { cardCount: 3, pattern: 'equal' }]
  },
  'four-per-row': {
    name: '四列布局',
    description: '每行显示4个卡片',
    rows: [{ cardCount: 4, pattern: 'equal' }, { cardCount: 4, pattern: 'equal' }]
  },
  'mixed-2-3': {
    name: '2+3混合',
    description: '第一行2个，第二行3个',
    rows: [{ cardCount: 2, pattern: 'equal' }, { cardCount: 3, pattern: 'equal' }]
  },
  'large-first': {
    name: '首图突出',
    description: '第一行1个大图，其余均分',
    rows: [{ cardCount: 1, pattern: 'full' }, { cardCount: 3, pattern: 'equal' }]
  }
};

export type CustomLayoutPresetKey = keyof typeof customLayoutPresets;

export const useThemeStore = defineStore('theme', () => {
  // 当前主题ID
  const currentThemeId = ref<ThemeId>(defaultThemeId);
  
  // 当前布局模式
  const currentLayoutMode = ref<LayoutMode>(defaultLayoutMode);
  
  // 当前自定义布局预设
  const currentCustomLayoutPreset = ref<CustomLayoutPresetKey>('two-per-row');
  
  // 背景图片
  const backgroundImage = ref<string>('');
  
  // 字体加载状态
  const fontsLoaded = ref(false);

  // 获取当前主题配置
  const currentTheme = computed<ThemeConfig>(() => {
    return getTheme(currentThemeId.value);
  });

  // 获取CSS变量对象（用于动态样式绑定）
  const cssVariables = computed(() => {
    const theme = currentTheme.value;
    return {
      // 背景
      '--theme-bg': theme.colors.background,
      '--theme-bg-gradient': theme.colors.backgroundGradient || 'none',
      
      // 卡片
      '--theme-card': theme.colors.card,
      '--theme-card-hover': theme.colors.cardHover || theme.colors.card,
      '--theme-card-border': theme.colors.cardBorder,
      
      // 主色调
      '--theme-primary': theme.colors.primary,
      '--theme-primary-light': theme.colors.primaryLight || theme.colors.primary,
      '--theme-primary-dark': theme.colors.primaryDark || theme.colors.primary,
      
      // 强调色
      '--theme-accent-1': theme.colors.accent1,
      '--theme-accent-2': theme.colors.accent2,
      '--theme-accent-3': theme.colors.accent3,
      '--theme-accent-4': theme.colors.accent4 || theme.colors.accent1,
      
      // 文字
      '--theme-text-main': theme.colors.textMain,
      '--theme-text-secondary': theme.colors.textSecondary,
      '--theme-text-muted': theme.colors.textMuted,
      
      // 状态色
      '--theme-success': theme.colors.success,
      '--theme-warning': theme.colors.warning,
      '--theme-error': theme.colors.error,
      '--theme-info': theme.colors.info,
      
      // 圆角
      '--theme-radius-sm': theme.borderRadius.small,
      '--theme-radius-md': theme.borderRadius.medium,
      '--theme-radius-lg': theme.borderRadius.large,
      '--theme-radius-xl': theme.borderRadius.xl,
      '--theme-radius-card': theme.borderRadius.card,
      '--theme-radius-button': theme.borderRadius.button,
      '--theme-radius-avatar': theme.borderRadius.avatar,
      
      // 阴影
      '--theme-shadow-sm': theme.shadows.small,
      '--theme-shadow-md': theme.shadows.medium,
      '--theme-shadow-lg': theme.shadows.large,
      '--theme-shadow-card': theme.shadows.card,
      '--theme-shadow-card-hover': theme.shadows.cardHover,
      '--theme-shadow-glow': theme.shadows.glow || 'none',
      
      // 边框
      '--theme-border-width': theme.border.width,
      '--theme-border-style': theme.border.style,
      '--theme-border-color': theme.border.color,
      
      // 布局
      '--theme-header-height': theme.layout.headerHeight,
      '--theme-max-width': theme.layout.maxWidth,
      '--theme-grid-gap': theme.layout.gridGap,
      '--theme-card-padding': theme.layout.cardPadding,
      '--theme-section-spacing': theme.layout.sectionSpacing,
      
      // 动画
      '--theme-duration': theme.animation.duration,
      '--theme-easing': theme.animation.easing,
      '--theme-hover-transform': theme.animation.hoverTransform,
      '--theme-hover-transition': theme.animation.hoverTransition,
      
      // 字体
      '--theme-font-primary': theme.fonts.primary,
      '--theme-font-secondary': theme.fonts.secondary || theme.fonts.primary,
      '--theme-font-mono': theme.fonts.mono || 'monospace',
    };
  });

  // 获取主题类名
  const themeClass = computed(() => {
    return currentTheme.value.classPrefix;
  });

  // 设置主题
  function setTheme(themeId: ThemeId) {
    if (isValidThemeId(themeId)) {
      currentThemeId.value = themeId;
      saveThemeToStorage(themeId);
      loadThemeFonts();
      applyThemeToDocument();
    }
  }

  // 切换到下一个主题
  function nextTheme() {
    const themeIds: ThemeId[] = [
      'organic-bento',
      'cyberpunk-neon',
      'luxury-dark',
      'cyber-tech',
      'swiss-minimalist',
      'pastel-dream',
    ];
    const currentIndex = themeIds.indexOf(currentThemeId.value);
    const nextIndex = (currentIndex + 1) % themeIds.length;
    setTheme(themeIds[nextIndex]);
  }

  // 从localStorage加载主题
  function loadThemeFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isValidThemeId(stored)) {
        currentThemeId.value = stored;
      }
    } catch (e) {
      console.warn('Failed to load theme from storage:', e);
    }
  }

  // 保存主题到localStorage
  function saveThemeToStorage(themeId: ThemeId) {
    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch (e) {
      console.warn('Failed to save theme to storage:', e);
    }
  }

  // 设置布局模式
  function setLayoutMode(mode: LayoutMode) {
    if (mode in layoutModes) {
      currentLayoutMode.value = mode;
      saveLayoutToStorage(mode);
    }
  }

  // 从localStorage加载布局
  function loadLayoutFromStorage() {
    try {
      const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (stored && stored in layoutModes) {
        currentLayoutMode.value = stored as LayoutMode;
      }
    } catch (e) {
      console.warn('Failed to load layout from storage:', e);
    }
  }

  // 保存布局到localStorage
  function saveLayoutToStorage(mode: LayoutMode) {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Failed to save layout to storage:', e);
    }
  }

  // 设置自定义布局预设
  function setCustomLayoutPreset(preset: CustomLayoutPresetKey) {
    if (preset in customLayoutPresets) {
      currentCustomLayoutPreset.value = preset;
      saveCustomLayoutPresetToStorage(preset);
    }
  }

  // 从localStorage加载自定义布局预设
  function loadCustomLayoutPresetFromStorage() {
    try {
      const stored = localStorage.getItem(CUSTOM_LAYOUT_PRESET_STORAGE_KEY);
      if (stored && stored in customLayoutPresets) {
        currentCustomLayoutPreset.value = stored as CustomLayoutPresetKey;
      }
    } catch (e) {
      console.warn('Failed to load custom layout preset from storage:', e);
    }
  }

  // 保存自定义布局预设到localStorage
  function saveCustomLayoutPresetToStorage(preset: CustomLayoutPresetKey) {
    try {
      localStorage.setItem(CUSTOM_LAYOUT_PRESET_STORAGE_KEY, preset);
    } catch (e) {
      console.warn('Failed to save custom layout preset to storage:', e);
    }
  }

  // 设置背景图片
  function setBackgroundImage(imageUrl: string) {
    backgroundImage.value = imageUrl;
    saveBackgroundImageToStorage(imageUrl);
    applyBackgroundImage();
  }

  // 从localStorage加载背景图片
  function loadBackgroundImageFromStorage() {
    try {
      const stored = localStorage.getItem(BACKGROUND_IMAGE_STORAGE_KEY);
      if (stored) {
        backgroundImage.value = stored;
        applyBackgroundImage();
      }
    } catch (e) {
      console.warn('Failed to load background image from storage:', e);
    }
  }

  // 保存背景图片到localStorage
  function saveBackgroundImageToStorage(imageUrl: string) {
    try {
      localStorage.setItem(BACKGROUND_IMAGE_STORAGE_KEY, imageUrl);
    } catch (e) {
      console.warn('Failed to save background image to storage:', e);
    }
  }

  // 应用背景图片
  function applyBackgroundImage() {
    const html = document.documentElement;
    if (backgroundImage.value) {
      html.style.setProperty('--theme-custom-bg-image', `url(${backgroundImage.value})`);
      html.classList.add('has-custom-bg');
    } else {
      html.style.removeProperty('--theme-custom-bg-image');
      html.classList.remove('has-custom-bg');
    }
  }

  // 加载主题字体
  function loadThemeFonts() {
    const theme = currentTheme.value;
    if (!theme.fonts.googleFontsUrl) {
      fontsLoaded.value = true;
      return;
    }

    // 检查字体是否已加载
    const existingLink = document.querySelector(`link[href="${theme.fonts.googleFontsUrl}"]`);
    if (existingLink) {
      fontsLoaded.value = true;
      return;
    }

    // 创建新的link元素加载字体
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = theme.fonts.googleFontsUrl;
    link.onload = () => {
      fontsLoaded.value = true;
    };
    link.onerror = () => {
      console.warn('Failed to load theme fonts');
      fontsLoaded.value = true; // 即使失败也继续
    };
    document.head.appendChild(link);
  }

  // 应用主题到document
  function applyThemeToDocument() {
    const html = document.documentElement;
    const theme = currentTheme.value;
    
    // 移除旧的主题类
    html.classList.forEach((className) => {
      if (className.startsWith('theme-')) {
        html.classList.remove(className);
      }
    });
    
    // 添加新的主题类
    html.classList.add(theme.classPrefix);
    
    // 应用CSS变量
    const vars = cssVariables.value;
    Object.entries(vars).forEach(([key, value]) => {
      if (value && value !== 'none') {
        html.style.setProperty(key, value);
      }
    });

    // 应用背景样式
    if (theme.colors.backgroundGradient) {
      html.style.setProperty('--theme-bg-gradient', theme.colors.backgroundGradient);
    }

    // 应用特殊效果
    if (theme.effects.scanlines) {
      html.classList.add('has-scanlines');
    } else {
      html.classList.remove('has-scanlines');
    }

    if (theme.effects.glassmorphism) {
      html.classList.add('has-glassmorphism');
    } else {
      html.classList.remove('has-glassmorphism');
    }
  }

  // 初始化主题
  function initTheme() {
    loadThemeFromStorage();
    loadLayoutFromStorage();
    loadCustomLayoutPresetFromStorage();
    loadBackgroundImageFromStorage();
    loadThemeFonts();
    applyThemeToDocument();
  }

  // 监听主题变化
  watch(currentThemeId, () => {
    applyThemeToDocument();
  });

  return {
    currentThemeId,
    currentTheme,
    currentLayoutMode,
    currentCustomLayoutPreset,
    backgroundImage,
    cssVariables,
    themeClass,
    fontsLoaded,
    layoutModes,
    customLayoutPresets,
    setTheme,
    setLayoutMode,
    setCustomLayoutPreset,
    setBackgroundImage,
    nextTheme,
    initTheme,
    loadThemeFromStorage,
    saveThemeToStorage,
    loadLayoutFromStorage,
    saveLayoutToStorage,
    loadCustomLayoutPresetFromStorage,
    saveCustomLayoutPresetToStorage,
    loadBackgroundImageFromStorage,
    saveBackgroundImageToStorage,
    loadThemeFonts,
    applyThemeToDocument,
    applyBackgroundImage,
  };
});
