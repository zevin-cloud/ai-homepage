<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Category, Agent } from '@/data/categories';
import { Sparkles, ArrowRight } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const categories = ref<Category[]>([]);
const loading = ref(true);
const authStore = useAuthStore();

const emit = defineEmits<{
  (e: 'select-agent', url: string): void
}>();

const selectAgent = (agent: Agent) => {
  emit('select-agent', agent.url);
};

// 根据描述长度和标题长度决定卡片大小
const getCardSize = (agent: Agent, index: number): 'large' | 'medium' | 'small' => {
  const descLength = agent.description?.length || 0;
  const titleLength = agent.title?.length || 0;
  
  // 优先根据描述长度判断
  if (descLength > 60) return 'large';
  if (descLength > 30) return 'medium';
  if (descLength === 0 && titleLength < 15) return 'small';
  
  // 根据位置交替布局，形成 Bento 效果
  const pattern = index % 6;
  if (pattern === 0 || pattern === 4) return 'large';
  if (pattern === 2 || pattern === 5) return 'small';
  return 'medium';
};

// 根据描述长度决定卡片高度类
const getCardHeightClass = (size: 'large' | 'medium' | 'small'): string => {
  if (size === 'large') {
    return 'row-span-2 min-h-[200px]';
  } else if (size === 'small') {
    return 'row-span-1 min-h-[100px]';
  } else {
    return 'row-span-1 min-h-[140px]';
  }
};

const fetchCategories = async () => {
  try {
    const headers: Record<string, string> = {};
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }
    
    const response = await fetch('/api/maxkb/categories', { headers });
    
    if (response.status === 401) {
      window.location.href = '/login';
      return;
    }
    
    const result = await response.json();
    if (result.success) {
      categories.value = result.data;
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div class="w-full max-w-[1200px] mx-auto mt-10 space-y-16 pb-20">
    <div v-if="loading" class="text-center text-text-secondary font-normal">Loading...</div>
    <div v-else-if="categories.length === 0" class="text-center text-text-secondary font-normal py-20">
      <p class="text-xl mb-4">暂无可用应用</p>
      <p class="text-sm">请联系管理员为您分配应用权限</p>
    </div>
    <div v-else v-for="category in categories" :key="category.id" :id="category.id">
      <!-- 分类标题 -->
      <div class="flex items-center gap-3 mb-6 px-2">
        <h2 class="text-2xl font-semibold text-text-main tracking-tight">{{ category.name }}</h2>
      </div>
      
      <!-- Bento Grid 布局