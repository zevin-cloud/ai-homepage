<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next';

defineProps<{
  isSyncing?: boolean;
}>();

const emit = defineEmits<{
  (e: 'sync'): void;
}>();
</script>

<template>
  <footer class="w-full max-w-[1140px] mx-auto mt-32 pb-8">
    <div class="flex items-center justify-between px-4">
      <p class="text-[13px] font-medium text-text-secondary">
        Copyright © 2026 FIT2CLOUD. All rights reserved.
      </p>
      <button
        @click="emit('sync')"
        class="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-white/50"
        :class="{ 'animate-spin': isSyncing }"
        title="同步数据"
      >
        <RefreshCw class="w-4 h-4" />
        <span>Sync</span>
      </button>
    </div>
  </footer>
</template>
