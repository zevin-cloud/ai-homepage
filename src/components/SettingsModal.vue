<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, Check, Palette, LayoutGrid, Sparkles, Grid3x3, Shuffle, Columns, Image, Upload, Trash2 } from 'lucide-vue-next';
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
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <!-- 弹窗内容 -->
        <div class="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
             :style="{
               backgroundColor: 'var(--theme-card)',
               borderRadius: 'var(--theme-radius-xl)',
               fontFamily: 'var(--theme-font-primary)'
             }">
          <!-- 头部 -->
          <div class="flex items-center justify-between p-6 border-b"
               :style="{
                 borderColor: 'var(--theme-card-border)',
                 borderWidth: '0 0 1px 0',
                 borderStyle: 'solid'
               }">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   :style="{
                     backgroundColor: 'var(--theme-primary)',
                     borderRadius: 'var(--theme-radius-md)'
                   }">
                <Palette class="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 class="text-xl font-semibold"
                    :style="{ color: 'var(--theme-text-main)' }">
                  界面设置
                </h2>
                <p class="text-sm"
                   :style="{ color: 'var(--theme-text-muted)' }">
                  自定义您的界面风格和布局
                </p>
              </div>
            </div>
            <button
              @click="closeModal"
              class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              :style="{
                color: 'var(--theme-text-secondary)',
                borderRadius: 'var(--theme-radius-button)'
              }"
              :class="{ 'hover:bg-gray-100': true }"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- 标签页切换 -->
          <div class="flex border-b"
               :style="{
                 borderColor: 'var(--theme-card-border)',
                 borderWidth: '0 0 1px 0',
                 borderStyle: 'solid'
               }">
            <button
              @click="activeTab = 'theme'"
              class="flex-1 py-4 text-sm font-medium transition-colors relative"
              :style="{
                color: activeTab === 'theme' ? 'var(--theme-primary)' : 'var(--theme-text-muted)'
              }"
            >
              <span class="flex items-center justify-center gap-2">
                <Palette class="w-4 h-4" />
                主题风格
              </span>
              <div
                v-if="activeTab === 'theme'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :style="{ backgroundColor: 'var(--theme-primary)' }"
              ></div>
            </button>
            <button
              @click="activeTab = 'layout'"
              class="flex-1 py-4 text-sm font-medium transition-colors relative"
              :style="{
                color: activeTab === 'layout' ? 'var(--theme-primary)' : 'var(--theme-text-muted)'
              }"
            >
              <span class="flex items-center justify-center gap-2">
                <LayoutGrid class="w-4 h-4" />
                布局设计
              </span>
              <div
                v-if="activeTab === 'layout'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :style="{ backgroundColor: 'var(--theme-primary)' }"
              ></div>
            </button>
            <button
              @click="activeTab = 'background'"
              class="flex-1 py-4 text-sm font-medium transition-colors relative"
              :style="{
                color: activeTab === 'background' ? 'var(--theme-primary)' : 'var(--theme-text-muted)'
              }"
            >
              <span class="flex items-center justify-center gap-2">
                <Image class="w-4 h-4" />
                背景设置
              </span>
              <div
                v-if="activeTab === 'background'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :style="{ backgroundColor: 'var(--theme-primary)' }"
              ></div>
            </button>
          </div>

          <!-- 主题列表 -->
          <div v-if="activeTab === 'theme'" class="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="theme in themePreviews"
                :key="theme.id"
                @click="selectTheme(theme.id)"
                class="relative cursor-pointer group overflow-hidden transition-all duration-300"
                :class="{
                  'ring-2 ring-offset-2': selectedTheme === theme.id,
                  'hover:scale-[1.02]': true
                }"
                :style="{
                  backgroundColor: theme.colors.background,
                  borderRadius: 'var(--theme-radius-card)',
                  borderColor: selectedTheme === theme.id ? theme.colors.primary : 'transparent',
                  borderWidth: selectedTheme === theme.id ? '2px' : '1px',
                  borderStyle: 'solid',
                  boxShadow: selectedTheme === theme.id ? '0 0 0 2px ' + theme.colors.primary : 'none'
                }"
              >
                <!-- 预览图 -->
                <div class="relative h-32 overflow-hidden">
                  <img
                    :src="theme.previewImage"
                    :alt="theme.name"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <!-- 选中标记 -->
                  <div
                    v-if="selectedTheme === theme.id"
                    class="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                    :style="{ backgroundColor: theme.colors.primary }"
                  >
                    <Check class="w-4 h-4 text-white" />
                  </div>
                </div>

                <!-- 主题信息 -->
                <div class="p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <div
                      class="w-4 h-4 rounded-full"
                      :style="{ backgroundColor: theme.colors.primary }"
                    ></div>
                    <h3 class="font-semibold text-base"
                        :style="{ color: theme.colors.background === '#121212' || theme.colors.background === '#050408' || theme.colors.background === '#050A14' ? '#ffffff' : '#000000' }">
                      {{ theme.nameZh }}
                    </h3>
                  </div>
                  <p class="text-sm line-clamp-2"
                     :style="{
                       color: theme.colors.background === '#121212' || theme.colors.background === '#050408' || theme.colors.background === '#050A14' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                     }">
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
          <div v-else-if="activeTab === 'layout'" class="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
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
                </div>
              </div>
            </div>
          </div>

          <!-- 背景设置 -->
          <div v-else-if="activeTab === 'background'" class="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
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

              <!-- 操作按钮 -->
              <div v-if="themeStore.backgroundImage" class="flex gap-3">
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
          <div class="flex items-center justify-between p-6 border-t"
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
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
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
