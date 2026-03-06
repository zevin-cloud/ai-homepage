<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Category, Agent } from '@/data/categories';
import { ChevronDown, Sparkles, LogOut, Settings, Palette } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const categories = ref<Category[]>([]);

const emit = defineEmits<{
  (e: 'select-agent', url: string): void;
  (e: 'go-home'): void;
  (e: 'open-settings'): void;
}>();

const openDropdownId = ref<string | null>(null);
const headerRef = ref<HTMLElement | null>(null);

const VISIBLE_LIMIT = 5;
const visibleCategories = computed(() => categories.value.slice(0, VISIBLE_LIMIT));
const moreCategories = computed(() => categories.value.slice(VISIBLE_LIMIT));
const hasMore = computed(() => categories.value.length > VISIBLE_LIMIT);

const fetchCategories = async () => {
  try {
    const headers: Record<string, string> = {};
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }
    
    const response = await fetch('/api/maxkb/categories', { headers });
    
    if (response.status === 401) {
      // 未授权，不显示错误，只是没有分类数据
      console.log('User not authenticated, skipping categories fetch');
      return;
    }
    
    const result = await response.json();
    if (result.success) {
      categories.value = result.data;
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
};

const toggleDropdown = (id: string) => {
  if (openDropdownId.value === id) {
    openDropdownId.value = null;
  } else {
    openDropdownId.value = id;
  }
};

const selectAgent = (agent: Agent) => {
  emit('select-agent', agent.url);
  openDropdownId.value = null;
};

const goHome = () => {
  emit('go-home');
  openDropdownId.value = null;
};

const scrollToCategory = (id: string) => {
  const element = document.getElementById(`category-${id}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  openDropdownId.value = null;
};

const handleClickOutside = (event: MouseEvent) => {
  if (headerRef.value && !headerRef.value.contains(event.target as Node)) {
    openDropdownId.value = null;
  }
};

onMounted(() => {
  fetchCategories();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <header ref="headerRef" class="sticky top-4 z-50 flex items-center justify-between w-[98%] md:w-[95%] max-w-[1200px] px-4 md:px-6 py-2.5 md:py-3 mx-auto mt-2 md:mt-4 bg-white/40 backdrop-blur-xl border border-white/40 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] shrink-0 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/50">
    <div class="flex items-center cursor-pointer gap-3 transition-transform duration-300 hover:scale-105" @click="goHome">
      <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-sm flex items-center justify-center">
        <Sparkles class="w-5 h-5 text-white" />
      </div>
      <span class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 tracking-tight">FIT2CLOUD</span>
    </div>

    <nav class="hidden md:flex items-center space-x-6">
      <div
        v-for="category in visibleCategories"
        :key="category.id"
        class="relative"
      >
        <div class="flex items-center">
          <button
            @click="scrollToCategory(category.id)"
            class="text-sm font-semibold text-theme-text-main hover:text-theme-primary transition-colors tracking-tight px-2 py-1 rounded-full hover:bg-theme-primary/10"
          >
            {{ category.name }}
          </button>
          <button
            @click.stop="toggleDropdown(category.id)"
            class="ml-0.5 p-1 rounded-full hover:bg-theme-primary/10 transition-colors focus:outline-none"
          >
            <ChevronDown class="w-3.5 h-3.5 text-theme-text-secondary transition-transform duration-300" :class="{ 'rotate-180': openDropdownId === category.id }" />
          </button>
        </div>

        <transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-2 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-2 scale-95"
        >
          <div
            v-if="openDropdownId === category.id"
            class="absolute top-full left-0 mt-3 w-64 bg-theme-card border border-theme-card-border rounded-theme-card shadow-theme-card py-2 overflow-hidden z-50 origin-top"
          >
            <div class="max-h-[300px] overflow-y-auto custom-scrollbar px-2 space-y-1">
              <button
                v-for="agent in category.agents"
                :key="agent.id"
                @click="selectAgent(agent)"
                class="w-full text-left px-3 py-2.5 rounded-theme-sm hover:bg-theme-card-hover flex items-center space-x-3 transition-all duration-200 group hover:shadow-sm"
              >
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-theme-primary/20 to-theme-primary/5 border border-theme-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <img v-if="agent.icon" :src="agent.icon" class="w-4 h-4 object-contain" />
                  <Sparkles v-else class="w-4 h-4 text-theme-primary" />
                </div>
                <span class="text-sm font-medium text-theme-text-main group-hover:text-theme-primary truncate transition-colors">{{ agent.title }}</span>
              </button>
            </div>
          </div>
        </transition>
      </div>

      <div v-if="hasMore" class="relative">
        <button
          @click.stop="toggleDropdown('more')"
          class="flex items-center text-sm font-semibold text-theme-text-main hover:text-theme-primary transition-colors focus:outline-none px-2 py-1 rounded-full hover:bg-theme-primary/10"
        >
          More
          <ChevronDown class="w-3.5 h-3.5 ml-1 transition-transform duration-300" :class="{ 'rotate-180': openDropdownId === 'more' }" />
        </button>

        <transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-2 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-2 scale-95"
        >
          <div
            v-if="openDropdownId === 'more'"
            class="absolute top-full right-0 mt-3 w-72 bg-theme-card border border-theme-card-border rounded-theme-card shadow-theme-card py-2 overflow-hidden z-50 origin-top"
          >
            <div class="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2">
              <div v-for="category in moreCategories" :key="category.id" class="px-2 py-1">
                <div
                  @click="scrollToCategory(category.id)"
                  class="px-3 py-1.5 text-[11px] font-bold text-theme-text-secondary uppercase tracking-widest cursor-pointer hover:text-theme-primary transition-colors"
                >
                  {{ category.name }}
                </div>
                <div class="space-y-1 mt-1">
                  <button
                    v-for="agent in category.agents"
                    :key="agent.id"
                    @click="selectAgent(agent)"
                    class="w-full text-left px-3 py-2.5 rounded-theme-sm hover:bg-theme-card-hover flex items-center space-x-3 transition-all duration-200 group hover:shadow-sm"
                  >
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-theme-primary/20 to-theme-primary/5 border border-theme-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <img v-if="agent.icon" :src="agent.icon" class="w-4 h-4 object-contain" />
                      <Sparkles v-else class="w-4 h-4 text-theme-primary" />
                    </div>
                    <span class="text-sm font-medium text-theme-text-main group-hover:text-theme-primary truncate transition-colors">{{ agent.title }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </nav>

    <div class="flex items-center space-x-1 md:space-x-2">
      <!-- 主题设置按钮 -->
      <button
        @click="$emit('open-settings')"
        class="p-2.5 text-gray-500 hover:text-primary hover:bg-black/5 rounded-full transition-all duration-300"
        title="Theme Settings"
      >
        <Palette class="w-4 h-4" />
      </button>

      <div class="h-4 w-px bg-gray-300 mx-1"></div>

      <div v-if="authStore.isAuthenticated" class="flex items-center gap-1">
        <span class="hidden sm:inline-block text-sm font-medium text-gray-600 px-2 py-1 bg-black/5 rounded-full mr-1">{{ authStore.user?.username }}</span>

        <router-link
          v-if="authStore.isAdmin"
          to="/admin"
          class="p-2.5 text-gray-500 hover:text-primary hover:bg-black/5 rounded-full transition-all duration-300"
          title="Admin Management"
        >
          <Settings class="w-4 h-4" />
        </router-link>

        <button
          @click="authStore.logout()"
          class="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300"
          title="Logout"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
      <div v-else class="ml-1">
        <router-link to="/login" class="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-full shadow-sm hover:shadow-md transition-all duration-300">
          Login
        </router-link>
      </div>
    </div>
  </header>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
