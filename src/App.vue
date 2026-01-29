<script setup lang="ts">
import { ref } from 'vue';
import Header from './components/Header.vue';
import AssistantCard from './components/AssistantCard.vue';
import FeatureTiles from './components/FeatureTiles.vue';
import Footer from './components/Footer.vue';

const currentAgentUrl = ref<string | undefined>(undefined);
const isHeaderVisible = ref(true);
const isSyncing = ref(false);

const handleAgentSelection = (url: string) => {
  currentAgentUrl.value = url;
  // 打开新助手时确保头部可见
  isHeaderVisible.value = true;
};

const toggleHeader = () => {
  isHeaderVisible.value = !isHeaderVisible.value;
};

const closeChat = () => {
  currentAgentUrl.value = undefined;
  isHeaderVisible.value = true;
};

const syncData = async () => {
  if (isSyncing.value) return;
  isSyncing.value = true;
  try {
    const response = await fetch('/api/maxkb/sync', { method: 'POST' });
    const result = await response.json();
    if (result.success) {
      // Refresh the page to reload data
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

// Drag to scroll logic
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
  const walk = (y - startY.value) * 2; // 快速滚动
  scrollContainer.value.scrollTop = scrollTop.value - walk;
};
</script>

<template>
  <div class="h-screen w-full bg-background bg-hero-pattern bg-cover bg-center bg-no-repeat flex flex-col overflow-hidden">
    <!-- 固定头部，带动画过渡 -->
    <transition name="slide-down">
      <Header 
        v-show="isHeaderVisible" 
        @select-agent="handleAgentSelection" 
        @go-home="closeChat"
        class="shrink-0 transition-all duration-300 ease-in-out" 
      />
    </transition>
    
    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col w-full overflow-hidden relative transition-all duration-300">
      <!-- 助手卡片（固定在主区域顶部） -->
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

      <!-- Scrollable Content Area (Only visible when no chat is active) -->
      <div
        v-if="!currentAgentUrl"
        ref="scrollContainer"
        class="absolute inset-0 top-6 overflow-y-auto w-full scroll-smooth custom-scrollbar pb-10 cursor-grab active:cursor-grabbing"
        @mousedown="onMouseDown"
        @mouseleave="onMouseLeave"
        @mouseup="onMouseUp"
        @mousemove="onMouseMove"
      >
        <FeatureTiles @select-agent="handleAgentSelection" />
        <Footer :is-syncing="isSyncing" @sync="syncData" />
      </div>
    </main>
  </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* 头部动画过渡 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
