<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Category, Agent } from '@/data/categories';
import { Bot, Sparkles } from 'lucide-vue-next';

const categories = ref<Category[]>([]);
const loading = ref(true);

const emit = defineEmits<{
  (e: 'select-agent', url: string): void
}>();

const selectAgent = (agent: Agent) => {
  emit('select-agent', agent.url);
};

const fetchCategories = async () => {
  try {
    const response = await fetch('/api/maxkb/categories');
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
  <div class="w-full max-w-[1140px] mx-auto mt-10 space-y-16 pb-20">
    <div v-if="loading" class="text-center text-text-secondary font-normal">Loading...</div>
    <div v-else v-for="category in categories" :key="category.id" :id="category.id">
      <h2 class="text-2xl font-semibold text-text-main mb-6 px-2 tracking-tight">{{ category.name }}</h2>
      <div class="grid grid-cols-4 gap-6">
        <div
          v-for="agent in category.agents"
          :key="agent.id"
          @click="selectAgent(agent)"
          class="bg-white/90 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-start shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/20 group"
        >
          <div class="flex items-center gap-3 w-full mb-4">
            <!-- Icon Container with gradient background -->
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300">
              <img v-if="agent.icon" :src="agent.icon" alt="Icon" class="w-5 h-5 object-contain" />
              <Sparkles v-else class="w-5 h-5 text-primary" />
            </div>
            <span class="text-[15px] font-medium text-text-main truncate">{{ agent.title }}</span>
          </div>
          <p class="text-[13px] font-normal text-text-secondary/80 leading-relaxed line-clamp-2">
            {{ agent.description || '暂无描述' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
