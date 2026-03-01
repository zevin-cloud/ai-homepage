<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();

// 监听系统主题变化（可选）
let mediaQuery: MediaQueryList | null = null;

onMounted(() => {
  // 初始化主题
  themeStore.initTheme();

  // 监听系统深色模式变化（可选功能）
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  // 注意：这里不自动切换，只是监听
});

onUnmounted(() => {
  // 清理
});

// 监听主题变化并应用
watch(() => themeStore.currentThemeId, () => {
  themeStore.applyThemeToDocument();
}, { immediate: true });
</script>

<template>
  <div class="theme-provider">
    <slot />
  </div>
</template>

<style scoped>
.theme-provider {
  width: 100%;
  height: 100%;
}
</style>
