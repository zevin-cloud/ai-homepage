<script setup lang="ts">
import { ref, watch } from 'vue';
import { Maximize2, Minimize2, X } from 'lucide-vue-next';

const props = defineProps<{
  url?: string;
  isHeaderVisible?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'toggle-fullscreen'): void;
}>();

const isChatOpen = ref(false);

// If a URL is provided, automatically open the chat view
watch(() => props.url, (newUrl) => {
  if (newUrl) {
    isChatOpen.value = true;
  } else {
    isChatOpen.value = false;
  }
});

const closeChat = () => {
  isChatOpen.value = false;
  emit('close');
};
</script>

<template>
  <div class="flex flex-col items-center w-full mx-auto transition-all duration-500 ease-in-out pointer-events-none" 
       :class="{ 
         'mt-2 w-[98%] max-w-[1800px]': isChatOpen && isHeaderVisible,
         'w-full h-screen': isChatOpen && !isHeaderVisible,
         'h-[calc(100vh-100px)]': isChatOpen && isHeaderVisible,
         'mt-32 max-w-[800px]': !isChatOpen 
       }">
    
    <!-- Chat Interface (Iframe) -->
    <div v-if="isChatOpen" 
         class="w-full h-full bg-white/90 backdrop-blur-md border border-primary/20 shadow-lg overflow-hidden flex flex-col relative transition-all duration-300 pointer-events-auto"
         :class="{ 'rounded-[30px]': isHeaderVisible, 'rounded-none': !isHeaderVisible }"
    >
      <!-- Header/Controls for Chat -->
      <div class="absolute top-4 right-4 z-10 flex space-x-2">
        <!-- Fullscreen Toggle -->
        <button 
          @click="$emit('toggle-fullscreen')" 
          class="p-2 bg-white/50 hover:bg-white/80 rounded-full transition-colors text-text-secondary hover:text-primary"
          :title="isHeaderVisible ? 'Enter Fullscreen' : 'Exit Fullscreen'"
        >
          <Maximize2 v-if="isHeaderVisible" class="w-5 h-5" />
          <Minimize2 v-else class="w-5 h-5" />
        </button>

        <!-- Close Button -->
        <button @click="closeChat" class="p-2 bg-white/50 hover:bg-white/80 rounded-full transition-colors text-text-secondary hover:text-primary">
          <X class="w-5 h-5" />
        </button>
      </div>

      <iframe 
        v-if="url"
        :src="url" 
        style="width: 100%; height: 100%;"
        frameborder="0"
        allow="microphone"
      ></iframe>
      <div v-else class="w-full h-full flex items-center justify-center text-text-secondary">
        Select an application to start chatting
      </div>
    </div>


  </div>
</template>
