<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Header from '@/components/Header.vue';
import AssistantCard from '@/components/AssistantCard.vue';
import ThemeFeatureTiles from '@/components/ThemeFeatureTiles.vue';
import Footer from '@/components/Footer.vue';
import ThemeProvider from '@/components/ThemeProvider.vue';
import SettingsModal from '@/components/SettingsModal.vue';
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();
const currentAgentUrl = ref<string | undefined>(undefined);
const isHeaderVisible = ref(true);
const isSyncing = ref(false);
const isSettingsOpen = ref(false);

// 判断是否为深色主题
const isDarkTheme = computed(() => {
  return ['cyberpunk-neon', 'luxury-dark', 'cyber-tech'].includes(themeStore.currentThemeId);
});

const handleAgentSelection = (url: string) => {
  currentAgentUrl.value = url;
  isHeaderVisible.value = true;
};

const toggleHeader = () => {
  isHeaderVisible.value = !isHeaderVisible.value;
};

const closeChat = () => {
  currentAgentUrl.value = undefined;
  isHeaderVisible.value = true;
};

const openSettings = () => {
  isSettingsOpen.value = true;
};

const closeSettings = () => {
  isSettingsOpen.value = false;
};

const syncData = async () => {
  if (isSyncing.value) return;
  isSyncing.value = true;
  try {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/maxkb/sync', {
      method: 'POST',
      headers
    });
    const result = await response.json();
    if (result.success) {
      window.location.reload();
    } else {
      console.error('Sync failed:', result.error);
    }
  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    isSyncing.value = false;
  }
};

const scrollContainer = ref<HTMLElement | null>(null);
const isDown = ref(false);
const startY = ref(0);
const scrollTop = ref(0);

const onMouseDown = (e: MouseEvent) => {
  if (!scrollContainer.value) return;
  isDown.value = true;
  startY.value = e.pageY - scrollContainer.value.offsetTop;
  scrollTop.value = scrollContainer.value.scrollTop;
};

const onMouseLeave = () => {
  isDown.value = false;
};

const onMouseUp = () => {
  isDown.value = false;
};

const onMouseMove = (e: MouseEvent) => {
  if (!isDown.value || !scrollContainer.value) return;
  e.preventDefault();
  const y = e.pageY - scrollContainer.value.offsetTop;
  const walk = (y - startY.value) * 2;
  scrollContainer.value.scrollTop = scrollTop.value - walk;
};

onMounted(() => {
  // 初始化主题
  themeStore.initTheme();
});
</script>

<template>
  <ThemeProvider>
    <div class="h-screen w-full flex flex-col overflow-hidden theme-page relative"
         :class="themeStore.themeClass"
         :style="{
           backgroundColor: themeStore.backgroundImage ? 'transparent' : 'var(--theme-bg)',
           backgroundImage: themeStore.backgroundImage ? `url(${themeStore.backgroundImage})` : 'none',
           backgroundSize: themeStore.backgroundImage ? 'cover' : undefined,
           backgroundPosition: themeStore.backgroundImage ? 'center' : undefined,
           backgroundAttachment: themeStore.backgroundImage ? 'fixed' : undefined,
           fontFamily: 'var(--theme-font-primary)'
         }">
      <!-- 背景遮罩 -->
      <div v-if="themeStore.backgroundImage" 
           class="absolute inset-0 pointer-events-none z-0"
           :style="{
             backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.85)',
             backdropFilter: `blur(${themeStore.backgroundBlur}px)`
           }"></div>
      
      <transition name="slide-down">
        <Header
          v-show="isHeaderVisible"
          @select-agent="handleAgentSelection"
          @go-home="closeChat"
          @open-settings="openSettings"
          class="shrink-0 transition-all duration-300 ease-in-out"
        />
      </transition>

      <main class="flex-1 flex flex-col w-full overflow-hidden relative transition-all duration-300">
        <div class="shrink-0 w-full z-10 h-full pointer-events-none">
          <div class="w-full h-full">
            <AssistantCard
              :url="currentAgentUrl"
              :is-header-visible="isHeaderVisible"
              @close="closeChat"
              @toggle-fullscreen="toggleHeader"
            />
          </div>
        </div>

        <div
          v-if="!currentAgentUrl"
          ref="scrollContainer"
          class="absolute inset-0 top-6 overflow-y-auto w-full scroll-smooth custom-scrollbar pb-10 cursor-grab active:cursor-grabbing"
          @mousedown="onMouseDown"
          @mouseleave="onMouseLeave"
          @mouseup="onMouseUp"
          @mousemove="onMouseMove"
        >
          <ThemeFeatureTiles @select-agent="handleAgentSelection" />
          <Footer :is-syncing="isSyncing" @sync="syncData" />
        </div>
      </main>

      <!-- 设置弹窗 -->
      <SettingsModal :is-open="isSettingsOpen" @close="closeSettings" />
    </div>
  </ThemeProvider>
</template>

<style>
/* 主题页面基础样式 */
.theme-page {
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--theme-text-muted);
  border-radius: 10px;
  opacity: 0.3;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  opacity: 0.5;
}

/* Header 动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* 主题特定样式覆盖 */
.theme-organic .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(44, 42, 38, 0.2);
}

.theme-cyberpunk .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(188, 19, 254, 0.3);
}

.theme-luxury .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.3);
}

.theme-cybertech .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.3);
}

.theme-swiss .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
}

.theme-pastel .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(147, 51, 234, 0.2);
}
</style>
