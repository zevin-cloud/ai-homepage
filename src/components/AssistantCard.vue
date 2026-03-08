<script setup lang="ts">
import { ref, watch } from 'vue';
import { Maximize2, Minimize2, X, Loader2 } from 'lucide-vue-next';

const props = defineProps<{
  url?: string;
  isHeaderVisible?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'toggle-fullscreen'): void;
}>();

const isChatOpen = ref(false);
const iframeLoading = ref(true);

// If a URL is provided, automatically open the chat view
watch(() => props.url, (newUrl) => {
  if (newUrl) {
    isChatOpen.value = true;
    iframeLoading.value = true;
  } else {
    isChatOpen.value = false;
  }
});

const handleIframeLoad = () => {
  iframeLoading.value = false;
};

const closeChat = () => {
  isChatOpen.value = false;
  emit('close');
};
</script>

<template>
  <div class="flex flex-col items-center w-full mx-auto transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] pointer-events-none"
       :class="{
         'mt-2 w-[98%] max-w-[1800px] opacity-100 scale-100 translate-y-0': isChatOpen && isHeaderVisible,
         'w-full h-screen opacity-100 scale-100 translate-y-0': isChatOpen && !isHeaderVisible,
         'h-[calc(100vh-100px)]': isChatOpen && isHeaderVisible,
         'mt-32 max-w-[800px] opacity-0 scale-95 translate-y-10': !isChatOpen
       }">

    <!-- 聊天界面（Iframe） -->
    <div v-if="isChatOpen"
         class="w-full h-full bg-white/90 backdrop-blur-md border border-primary/20 shadow-2xl overflow-hidden flex flex-col relative transition-all duration-500 pointer-events-auto"
         :class="{ 'rounded-[30px]': isHeaderVisible, 'rounded-none': !isHeaderVisible }"
    >
      <!-- 聊天头部/控制按钮 -->
      <div class="absolute top-4 right-4 z-20 flex space-x-2">
        <!-- 全屏切换 -->
        <button
          @click="$emit('toggle-fullscreen')"
          class="p-2 bg-white/50 hover:bg-white/90 backdrop-blur-sm rounded-full transition-all duration-300 text-text-secondary hover:text-primary hover:scale-110 shadow-sm hover:shadow"
          :title="isHeaderVisible ? 'Enter Fullscreen' : 'Exit Fullscreen'"
        >
          <Maximize2 v-if="isHeaderVisible" class="w-5 h-5" />
          <Minimize2 v-else class="w-5 h-5" />
        </button>

        <!-- 关闭按钮 -->
        <button @click="closeChat" class="p-2 bg-white/50 hover:bg-red-500/90 backdrop-blur-sm rounded-full transition-all duration-300 text-text-secondary hover:text-white hover:scale-110 shadow-sm hover:shadow">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Loading Indicator -->
      <div v-if="iframeLoading && url" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md transition-opacity duration-300">
        <div class="loader mb-6">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span class="text-sm font-bold text-gray-500 tracking-widest uppercase">Initializing Agent...</span>
      </div>

      <iframe
        v-if="url"
        :src="url"
        style="width: 100%; height: 100%;"
        frameborder="0"
        allow="microphone"
        @load="handleIframeLoad"
        class="transition-opacity duration-500"
        :class="{ 'opacity-0': iframeLoading, 'opacity-100': !iframeLoading }"
      ></iframe>
      <div v-else class="w-full h-full flex items-center justify-center text-text-secondary">
        Select an application to start chatting
      </div>
    </div>
  </div>
</template>

<style scoped>
/* From Uiverse.io by cosnametv */ 
.loader {
  --color: var(--theme-primary, #a5a5b0);
  --size: 70px;
  width: var(--size);
  height: var(--size);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

.loader span {
  width: 100%;
  height: 100%;
  background-color: var(--color);
  animation: keyframes-blink 0.6s alternate infinite linear;
  border-radius: 4px; /* Slightly rounded edges for a better look */
}

.loader span:nth-child(1) {
  animation-delay: 0ms;
}

.loader span:nth-child(2) {
  animation-delay: 200ms;
}

.loader span:nth-child(3) {
  animation-delay: 300ms;
}

.loader span:nth-child(4) {
  animation-delay: 400ms;
}

.loader span:nth-child(5) {
  animation-delay: 500ms;
}

.loader span:nth-child(6) {
  animation-delay: 600ms;
}

@keyframes keyframes-blink {
  0% {
    opacity: 0.3;
    transform: scale(0.5) rotate(5deg);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
