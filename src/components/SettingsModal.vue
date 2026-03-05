<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, Check, Palette, LayoutGrid, Sparkles, Grid3x3, Shuffle, Columns, Image, Upload, Trash2, Settings } from 'lucide-vue-next';
import { useThemeStore } from '@/stores/theme';
import { getThemePreviews } from '@/data/themes';
import type { ThemeId, LayoutMode } from '@/types/theme';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const themeStore = useThemeStore();
const themePreviews = computed(() => getThemePreviews());

const selectedTheme = ref<ThemeId>(themeStore.currentThemeId);
const selectedLayout = ref<LayoutMode>(themeStore.currentLayoutMode);
const activeTab = ref<'theme' | 'layout' | 'background'>('theme');
const uploadError = ref('');

// 选择主题
const selectTheme = (themeId: ThemeId) => {
  selectedTheme.value = themeId;
  themeStore.setTheme(themeId);
};

// 选择布局
const selectLayout = (layoutMode: LayoutMode) => {
  selectedLayout.value = layoutMode;
  themeStore.setLayoutMode(layoutMode);
};

// 处理图片上传
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    uploadError.value = '请选择图片文件';
    return;
  }
  
  // 验证文件大小（最大 2MB）
  if (file.size > 2 * 1024 * 1024) {
    uploadError.value = '图片大小不能超过 2MB';
    return;
  }
  
  uploadError.value = '';
  
  // 转换为 Base64
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    if (result) {
      themeStore.setBackgroundImage(result);
    }
  };
  reader.onerror = () => {
    uploadError.value = '图片读取失败';
  };
  reader.readAsDataURL(file);
};

// 清除背景图片
const clearBackgroundImage = () => {
  themeStore.setBackgroundImage('');
};

// 关闭弹窗
const closeModal = () => {
  emit('close');
};

// 点击外部关闭
const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal();
  }
};

// 获取布局图标
const getLayoutIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'Sparkles': Sparkles,
    'Grid3x3': Grid3x3,
    'LayoutGrid': LayoutGrid,
    'Shuffle': Shuffle,
    'Columns': Columns,
    'Settings': Settings,
  };
  return iconMap[iconName] || LayoutGrid;
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"></div>

        <!-- 弹窗内容 -->
        <div class="relative w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.4)] transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] border"
             :style="{
               backgroundColor: 'var(--theme-card)',
               borderRadius: 'var(--theme-radius-xl)',
               borderColor: 'var(--theme-card-border)',
               fontFamily: 'var(--theme-font-primary)'
             }">
          
          <!-- 头部与标签页区域融合设计 -->
          <div class="px-8 pt-8 pb-4 shrink-0 flex flex-col gap-6 border-b"
               :style="{ borderColor: 'var(--theme-card-border)' }">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 flex items-center justify-center shadow-sm"
                     :style="{
                       backgroundColor: 'var(--theme-primary)',
                       borderRadius: 'var(--theme-radius-lg)'
                     }">
                  <Palette class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 class="text-2xl font-bold tracking-tight"
                      :style="{ color: 'var(--theme-text-main)' }">
                    界面设置
                  </h2>
                  <p class="text-sm mt-0.5"
                     :style="{ color: 'var(--theme-text-secondary)' }">
                    自定义系统的主题风格、排版布局与动态背景
                  </p>
                </div>
              </div>
              <button
                @click="closeModal"
                class="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 hover:bg-black/5 dark:hover:bg-white/10"
                :style="{ color: 'var(--theme-text-secondary)' }"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- 胶囊形标签页切换 -->
            <div class="flex p-1 gap-2 rounded-2xl w-fit"
                 :style="{ backgroundColor: 'var(--theme-primary-light)', opacity: 0.8 }">
              <button
                @click="activeTab = 'theme'"
                class="px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2"
                :class="activeTab === 'theme' ? 'shadow-md scale-100' : 'scale-95 opacity-70 hover:opacity-100'"
                :style="{
                  backgroundColor: activeTab === 'theme' ? 'var(--theme-card)' : 'transparent',
                  color: activeTab === 'theme' ? 'var(--theme-primary)' : 'var(--theme-text-main)'
                }"
              >
                <Palette class="w-4 h-4" />
                主题风格
              </button>
              <button
                @click="activeTab = 'layout'"
                class="px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2"
                :class="activeTab === 'layout' ? 'shadow-md scale-100' : 'scale-95 opacity-70 hover:opacity-100'"
                :style="{
                  backgroundColor: activeTab === 'layout' ? 'var(--theme-card)' : 'transparent',
                  color: activeTab === 'layout' ? 'var(--theme-primary)' : 'var(--theme-text-main)'
                }"
              >
                <LayoutGrid class="w-4 h-4" />
                布局设计
              </button>
              <button
                @click="activeTab = 'background'"
                class="px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2"
                :class="activeTab === 'background' ? 'shadow-md scale-100' : 'scale-95 opacity-70 hover:opacity-100'"
                :style="{
                  backgroundColor: activeTab === 'background' ? 'var(--theme-card)' : 'transparent',
                  color: activeTab === 'background' ? 'var(--theme-primary)' : 'var(--theme-text-main)'
                }"
              >
                <Image class="w-4 h-4" />
                背景特效
              </button>
            </div>
          </div>

          <!-- 主题列表 -->
          <div v-if="activeTab === 'theme'" class="p-8 overflow-y-auto flex-1 custom-scrollbar">
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div
                v-for="theme in themePreviews"
                :key="theme.id"
                @click="selectTheme(theme.id)"
                class="relative cursor-pointer group overflow-hidden transition-all duration-400"
                :class="{
                  'scale-[1.02] shadow-xl': selectedTheme === theme.id,
                  'hover:-translate-y-1 hover:shadow-lg': selectedTheme !== theme.id
                }"
                :style="{
                  backgroundColor: theme.colors.background,
                  borderRadius: 'var(--theme-radius-card)',
                  borderColor: selectedTheme === theme.id ? theme.colors.primary : 'var(--theme-card-border)',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  boxShadow: selectedTheme === theme.id ? `0 0 20px ${theme.colors.primary}40` : 'none'
                }"
              >
                <!-- 预览图 -->
                <div class="relative h-40 overflow-hidden border-b-2" :style="{ borderColor: 'var(--theme-card-border)' }">
                  <img
                    :src="theme.previewImage"
                    :alt="theme.name"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <!-- 遮罩渐变 -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                  <!-- 选中标记 -->
                  <div
                    class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300"
                    :style="{ 
                      backgroundColor: theme.colors.primary,
                      transform: selectedTheme === theme.id ? 'scale(1)' : 'scale(0)',
                      boxShadow: `0 4px 12px ${theme.colors.primary}80`
                    }"
                  >
                    <Check class="w-5 h-5 text-white" />
                  </div>
                </div>

                <!-- 主题信息 -->
                <div class="p-5 relative">
                  <div class="flex items-center gap-3 mb-2">
                    <div
                      class="w-5 h-5 rounded-full shadow-inner"
                      :style="{ backgroundColor: theme.colors.primary }"
                    ></div>
                    <h3 class="font-bold text-lg tracking-tight"
                        :style="{ color: theme.colors.textMain }">
                      {{ theme.nameZh }}
                    </h3>
                  </div>
                  <p class="text-sm line-clamp-2 mt-1 font-medium"
                     :style="{ color: theme.colors.textSecondary }">
                    {{ theme.description }}
                  </p>

                  <!-- 颜色预览 -->
                  <div class="flex gap-2 mt-3">
                    <div
                      class="w-6 h-6 rounded-full border-2"
                      :style="{
                        backgroundColor: theme.colors.primary,
                        borderColor: 'rgba(0,0,0,0.1)'
                      }"
                      :title="'主色调'"
                    ></div>
                    <div
                      class="w-6 h-6 rounded-full border-2"
                      :style="{
                        backgroundColor: theme.colors.accent,
                        borderColor: 'rgba(0,0,0,0.1)'
                      }"
                      :title="'强调色'"
                    ></div>
                    <div
                      class="w-6 h-6 rounded-full border-2"
                      :style="{
                        backgroundColor: theme.colors.background,
                        borderColor: 'rgba(0,0,0,0.1)'
                      }"
                      :title="'背景色'"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 布局列表 -->
          <div v-else-if="activeTab === 'layout'" class="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="(layout, layoutId) in themeStore.layoutModes"
                :key="layoutId"
                @click="selectLayout(layoutId as LayoutMode)"
                class="relative cursor-pointer group p-6 transition-all duration-300"
                :class="{
                  'ring-2': selectedLayout === layoutId,
                  'hover:scale-[1.02]': true
                }"
                :style="{
                  backgroundColor: selectedLayout === layoutId ? 'var(--theme-primary-light)' : 'var(--theme-card)',
                  borderRadius: 'var(--theme-radius-card)',
                  borderColor: selectedLayout === layoutId ? 'var(--theme-primary)' : 'var(--theme-card-border)',
                  borderWidth: selectedLayout === layoutId ? '2px' : '1px',
                  borderStyle: 'solid'
                }"
              >
                <div class="flex items-start gap-4">
                  <div
                    class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    :style="{
                      backgroundColor: selectedLayout === layoutId ? 'var(--theme-primary)' : 'var(--theme-primary-light)',
                      borderRadius: 'var(--theme-radius-md)'
                    }"
                  >
                    <component
                      :is="getLayoutIcon(layout.icon)"
                      class="w-6 h-6"
                      :style="{ color: selectedLayout === layoutId ? '#ffffff' : 'var(--theme-primary)' }"
                    />
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="font-semibold text-base"
                          :style="{ color: 'var(--theme-text-main)' }">
                        {{ layout.nameZh }}
                      </h3>
                      <span
                        v-if="selectedLayout === layoutId"
                        class="text-xs px-2 py-0.5 rounded-full"
                        :style="{
                          backgroundColor: 'var(--theme-primary)',
                          color: '#ffffff'
                        }"
                      >
                        当前
                      </span>
                    </div>
                    <p class="text-sm"
                       :style="{ color: 'var(--theme-text-secondary)' }">
                      {{ layout.description }}
                    </p>
                  </div>
                </div>

                <!-- 布局预览图示 -->
                <div class="mt-4 grid grid-cols-4 gap-2 opacity-60">
                  <!-- 智能布局预览 -->
                  <template v-if="layoutId === 'auto'">
                    <div class="col-span-2 row-span-2 h-16 rounded" :style="{ backgroundColor: 'var(--theme-primary)' }"></div>
                    <div class="col-span-1 h-7 rounded" :style="{ backgroundColor: 'var(--theme-accent-1)' }"></div>
                    <div class="col-span-1 h-7 rounded" :style="{ backgroundColor: 'var(--theme-accent-2)' }"></div>
                    <div class="col-span-1 h-7 rounded" :style="{ backgroundColor: 'var(--theme-accent-3)' }"></div>
                    <div class="col-span-1 h-7 rounded" :style="{ backgroundColor: 'var(--theme-accent-4)' }"></div>
                  </template>
                  <!-- 紧凑布局预览 -->
                  <template v-else-if="layoutId === 'compact'">
                    <div class="col-span-1 h-8 rounded" :style="{ backgroundColor: 'var(--theme-primary)' }"></div>
                    <div class="col-span-1 h-8 rounded" :style="{ backgroundColor: 'var(--theme-accent-1)' }"></div>
                    <div class="col-span-1 h-8 rounded" :style="{ backgroundColor: 'var(--theme-accent-2)' }"></div>
                    <div class="col-span-1 h-8 rounded" :style="{ backgroundColor: 'var(--theme-accent-3)' }"></div>
                    <div class="col-span-1 h-8 rounded" :style="{ backgroundColor: 'var(--theme-accent-4)' }"></div>
                    <div class="col-span-1 h-8 rounded" :style="{ backgroundColor: 'var(--theme-primary-light)' }"></div>
                    <div class="col-span-1 h-8 rounded" :style="{ backgroundColor: 'var(--theme-accent-1)' }"></div>
                    <div class="col-span-1 h-8 rounded" :style="{ backgroundColor: 'var(--theme-accent-2)' }"></div>
                  </template>
                  <!-- 宽松布局预览 -->
                  <template v-else-if="layoutId === 'loose'">
                    <div class="col-span-2 h-12 rounded" :style="{ backgroundColor: 'var(--theme-primary)' }"></div>
                    <div class="col-span-2 h-12 rounded" :style="{ backgroundColor: 'var(--theme-accent-1)' }"></div>
                    <div class="col-span-2 h-12 rounded" :style="{ backgroundColor: 'var(--theme-accent-2)' }"></div>
                    <div class="col-span-2 h-12 rounded" :style="{ backgroundColor: 'var(--theme-accent-3)' }"></div>
                  </template>
                  <!-- 随机布局预览 -->
                  <template v-else-if="layoutId === 'random'">
                    <div class="col-span-2 h-10 rounded" :style="{ backgroundColor: 'var(--theme-primary)' }"></div>
                    <div class="col-span-1 h-10 rounded" :style="{ backgroundColor: 'var(--theme-accent-1)' }"></div>
                    <div class="col-span-1 h-10 rounded" :style="{ backgroundColor: 'var(--theme-accent-2)' }"></div>
                    <div class="col-span-1 h-6 rounded" :style="{ backgroundColor: 'var(--theme-accent-3)' }"></div>
                    <div class="col-span-2 h-6 rounded" :style="{ backgroundColor: 'var(--theme-accent-4)' }"></div>
                    <div class="col-span-1 h-6 rounded" :style="{ backgroundColor: 'var(--theme-primary-light)' }"></div>
                  </template>
                  <!-- 瀑布流布局预览 -->
                  <template v-else-if="layoutId === 'masonry'">
                    <div class="col-span-1 h-12 rounded" :style="{ backgroundColor: 'var(--theme-primary)' }"></div>
                    <div class="col-span-1 h-8 rounded" :style="{ backgroundColor: 'var(--theme-accent-1)' }"></div>
                    <div class="col-span-1 h-10 rounded" :style="{ backgroundColor: 'var(--theme-accent-2)' }"></div>
                    <div class="col-span-1 h-6 rounded" :style="{ backgroundColor: 'var(--theme-accent-3)' }"></div>
                    <div class="col-span-1 h-8 rounded" :style="{ backgroundColor: 'var(--theme-accent-4)' }"></div>
                    <div class="col-span-1 h-12 rounded" :style="{ backgroundColor: 'var(--theme-primary-light)' }"></div>
                    <div class="col-span-1 h-6 rounded" :style="{ backgroundColor: 'var(--theme-accent-1)' }"></div>
                    <div class="col-span-1 h-10 rounded" :style="{ backgroundColor: 'var(--theme-accent-2)' }"></div>
                  </template>
                  <!-- 自定义布局预览 -->
                  <template v-else-if="layoutId === 'custom'">
                    <div class="col-span-2 h-10 rounded border-dashed border-2" :style="{ borderColor: 'var(--theme-primary)' }"></div>
                    <div class="col-span-2 h-10 rounded border-dashed border-2" :style="{ borderColor: 'var(--theme-primary)' }"></div>
                    <div class="col-span-2 h-10 rounded border-dashed border-2" :style="{ borderColor: 'var(--theme-primary)' }"></div>
                    <div class="col-span-2 h-10 rounded border-dashed border-2" :style="{ borderColor: 'var(--theme-primary)' }"></div>
                  </template>
                </div>

                <!-- 自定义布局的子选项 -->
                <div v-if="layoutId === 'custom' && selectedLayout === 'custom'" class="mt-4 pt-4 border-t" :style="{ borderColor: 'var(--theme-card-border)' }">
                  <h4 class="text-sm font-medium mb-2" :style="{ color: 'var(--theme-text-main)' }">选择预设</h4>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="(preset, presetKey) in themeStore.customLayoutPresets"
                      :key="presetKey"
                      @click.stop="themeStore.setCustomLayoutPreset(presetKey as any)"
                      class="px-3 py-1.5 text-xs rounded-lg transition-colors border"
                      :style="{
                        backgroundColor: themeStore.currentCustomLayoutPreset === presetKey ? 'var(--theme-primary)' : 'transparent',
                        color: themeStore.currentCustomLayoutPreset === presetKey ? '#ffffff' : 'var(--theme-text-main)',
                        borderColor: themeStore.currentCustomLayoutPreset === presetKey ? 'var(--theme-primary)' : 'var(--theme-card-border)'
                      }"
                    >
                      {{ preset.name }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 卡片折叠设置 -->
            <div class="mt-8 pt-6 border-t" :style="{ borderColor: 'var(--theme-card-border)' }">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold" :style="{ color: 'var(--theme-text-main)' }">卡片折叠展示</h3>
                  <p class="text-sm mt-1" :style="{ color: 'var(--theme-text-secondary)' }">当分类下的卡片超过两行时，自动折叠其余卡片以节省空间</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    class="sr-only peer" 
                    :checked="themeStore.collapseTiles"
                    @change="(e) => themeStore.setCollapseTiles((e.target as HTMLInputElement).checked)"
                  >
                  <div 
                    class="w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 transition-colors duration-300"
                    :style="{
                      backgroundColor: themeStore.collapseTiles ? 'var(--theme-primary)' : 'var(--theme-text-muted)',
                      borderColor: themeStore.collapseTiles ? 'var(--theme-primary)' : 'var(--theme-card-border)'
                    }"
                  ></div>
                  <div 
                    class="absolute left-[2px] top-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-all peer-checked:translate-x-full peer-checked:border-white"
                  ></div>
                </label>
              </div>
            </div>
          </div>

          <!-- 背景设置 -->
          <div v-else-if="activeTab === 'background'" class="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <div class="space-y-6">
              <!-- 当前背景预览 -->
              <div>
                <h3 class="text-lg font-semibold mb-4" :style="{ color: 'var(--theme-text-main)' }">
                  当前背景
                </h3>
                <div
                  class="w-full h-48 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden"
                  :style="{
                    borderColor: themeStore.backgroundImage ? 'var(--theme-primary)' : 'var(--theme-card-border)',
                    backgroundColor: 'var(--theme-bg)',
                    backgroundImage: themeStore.backgroundImage ? `url(${themeStore.backgroundImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }"
                >
                  <div v-if="!themeStore.backgroundImage" class="text-center">
                    <Image class="w-12 h-12 mx-auto mb-2" :style="{ color: 'var(--theme-text-muted)' }" />
                    <p :style="{ color: 'var(--theme-text-muted)' }">暂无背景图片</p>
                  </div>
                </div>
              </div>

              <!-- 上传区域 -->
              <div>
                <h3 class="text-lg font-semibold mb-4" :style="{ color: 'var(--theme-text-main)' }">
                  上传背景
                </h3>
                <label
                  class="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:opacity-80"
                  :style="{
                    borderColor: 'var(--theme-card-border)',
                    backgroundColor: 'var(--theme-primary-light)'
                  }"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload class="w-8 h-8 mb-2" :style="{ color: 'var(--theme-primary)' }" />
                    <p class="text-sm" :style="{ color: 'var(--theme-text-secondary)' }">
                      <span class="font-semibold">点击上传</span> 或拖拽图片到此处
                    </p>
                    <p class="text-xs mt-1" :style="{ color: 'var(--theme-text-muted)' }">
                      支持 JPG、PNG、GIF 格式，最大 2MB
                    </p>
                  </div>
                  <input
                    type="file"
                    class="hidden"
                    accept="image/*"
                    @change="handleImageUpload"
                  />
                </label>
                <p v-if="uploadError" class="text-sm mt-2 text-red-500">
                  {{ uploadError }}
                </p>
              </div>

              <!-- 模糊度调节 -->
              <div v-if="themeStore.backgroundImage">
                <h3 class="text-lg font-semibold mb-4" :style="{ color: 'var(--theme-text-main)' }">
                  背景模糊程度
                </h3>
                <div class="flex items-center gap-4">
                  <span class="text-sm" :style="{ color: 'var(--theme-text-muted)' }">清晰</span>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    :value="themeStore.backgroundBlur"
                    @input="(e) => themeStore.setBackgroundBlur(parseInt((e.target as HTMLInputElement).value))"
                    class="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                    :style="{
                      backgroundColor: 'var(--theme-primary-light)',
                      accentColor: 'var(--theme-primary)'
                    }"
                  />
                  <span class="text-sm" :style="{ color: 'var(--theme-text-muted)' }">模糊</span>
                </div>
                <p class="text-sm mt-2" :style="{ color: 'var(--theme-text-secondary)' }">
                  当前: {{ themeStore.backgroundBlur }}px
                </p>
              </div>

              <!-- 背景特效设置 -->
              <div class="mt-8 pt-6 border-t" :style="{ borderColor: 'var(--theme-card-border)' }">
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <h3 class="text-lg font-semibold" :style="{ color: 'var(--theme-text-main)' }">动态粒子与流光背景</h3>
                    <p class="text-sm mt-1" :style="{ color: 'var(--theme-text-secondary)' }">开启充满未来感的全屏流光发光效果与细微颗粒噪点（对标 New API）</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      class="sr-only peer" 
                      :checked="themeStore.enableNoise"
                      @change="(e) => themeStore.setEnableNoise((e.target as HTMLInputElement).checked)"
                    >
                    <div 
                      class="w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 transition-colors duration-300"
                      :style="{
                        backgroundColor: themeStore.enableNoise ? 'var(--theme-primary)' : 'var(--theme-text-muted)',
                        borderColor: themeStore.enableNoise ? 'var(--theme-primary)' : 'var(--theme-card-border)'
                      }"
                    ></div>
                    <div class="absolute left-[2px] top-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-all peer-checked:translate-x-full peer-checked:border-white"></div>
                  </label>
                </div>

                <div v-if="themeStore.enableNoise" class="animate-fade-in space-y-4">
                  <h4 class="text-sm font-medium" :style="{ color: 'var(--theme-text-main)' }">粒子颜色风格</h4>
                  <div class="grid grid-cols-3 gap-3">
                    <button 
                      @click="themeStore.setNoiseColor('rgba(255,255,255,0.25)')"
                      class="py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-all"
                      :style="{
                        borderColor: themeStore.noiseColor === 'rgba(255,255,255,0.25)' ? 'var(--theme-primary)' : 'var(--theme-card-border)',
                        backgroundColor: themeStore.noiseColor === 'rgba(255,255,255,0.25)' ? 'var(--theme-primary-light)' : 'transparent',
                        color: 'var(--theme-text-main)'
                      }"
                    >
                      <div class="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
                      <span class="text-sm">银白光斑</span>
                    </button>
                    
                    <button 
                      @click="themeStore.setNoiseColor('rgba(0,0,0,0.25)')"
                      class="py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-all"
                      :style="{
                        borderColor: themeStore.noiseColor === 'rgba(0,0,0,0.25)' ? 'var(--theme-primary)' : 'var(--theme-card-border)',
                        backgroundColor: themeStore.noiseColor === 'rgba(0,0,0,0.25)' ? 'var(--theme-primary-light)' : 'transparent',
                        color: 'var(--theme-text-main)'
                      }"
                    >
                      <div class="w-3 h-3 rounded-full bg-black border border-gray-600"></div>
                      <span class="text-sm">暗影颗粒</span>
                    </button>

                    <button 
                      @click="themeStore.setNoiseColor('var(--theme-primary)')"
                      class="py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-all"
                      :style="{
                        borderColor: themeStore.noiseColor === 'var(--theme-primary)' ? 'var(--theme-primary)' : 'var(--theme-card-border)',
                        backgroundColor: themeStore.noiseColor === 'var(--theme-primary)' ? 'var(--theme-primary-light)' : 'transparent',
                        color: 'var(--theme-text-main)'
                      }"
                    >
                      <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: 'var(--theme-primary)' }"></div>
                      <span class="text-sm">主题色彩</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div v-if="themeStore.backgroundImage" class="flex gap-3 mt-6">
                <button
                  @click="clearBackgroundImage"
                  class="flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  :style="{
                    backgroundColor: 'var(--theme-error)',
                    color: '#ffffff',
                    borderRadius: 'var(--theme-radius-button)'
                  }"
                >
                  <Trash2 class="w-4 h-4" />
                  清除背景
                </button>
              </div>

              <!-- 使用提示 -->
              <div class="p-4 rounded-lg" :style="{ backgroundColor: 'var(--theme-primary-light)' }">
                <p class="text-sm" :style="{ color: 'var(--theme-text-secondary)' }">
                  <strong>提示：</strong>上传的背景图片会应用到整个页面。建议使用浅色或模糊的背景图片，以确保文字可读性。
                </p>
              </div>
            </div>
          </div>

          <!-- 底部 -->
          <div class="flex items-center justify-between p-6 border-t shrink-0"
               :style="{
                 borderColor: 'var(--theme-card-border)',
                 borderWidth: '1px 0 0 0',
                 borderStyle: 'solid'
               }">
            <p class="text-sm" :style="{ color: 'var(--theme-text-muted)' }">
              <template v-if="activeTab === 'theme'">
                当前主题: <span class="font-medium" :style="{ color: 'var(--theme-text-main)' }">{{ themeStore.currentTheme.nameZh }}</span>
              </template>
              <template v-else-if="activeTab === 'layout'">
                当前布局: <span class="font-medium" :style="{ color: 'var(--theme-text-main)' }">{{ themeStore.layoutModes[themeStore.currentLayoutMode].nameZh }}</span>
              </template>
              <template v-else>
                背景图片: <span class="font-medium" :style="{ color: 'var(--theme-text-main)' }">{{ themeStore.backgroundImage ? '已设置' : '未设置' }}</span>
              </template>
            </p>
            <button
              @click="closeModal"
              class="px-6 py-2.5 rounded-lg font-medium transition-colors"
              :style="{
                backgroundColor: 'var(--theme-primary)',
                color: '#ffffff',
                borderRadius: 'var(--theme-radius-button)'
              }"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.4s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > .relative,
.modal-leave-active > .relative {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-enter-from > .relative,
.modal-leave-to > .relative {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--theme-text-muted);
  border-radius: 3px;
  opacity: 0.3;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
