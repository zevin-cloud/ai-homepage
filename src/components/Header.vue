<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Category, Agent } from '@/data/categories';
import { ChevronDown, Sparkles, LogOut, Settings } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const categories = ref<Category[]>([]);

const emit = defineEmits<{
  (e: 'select-agent', url: string): void;
  (e: 'go-home'): void;
}>();

const openDropdownId = ref<string | null>(null);
const headerRef = ref<HTMLElement | null>(null);

const VISIBLE_LIMIT = 5;
const visibleCategories = computed(() => categories.value.slice(0, VISIBLE_LIMIT));
const moreCategories = computed(() => categories.value.slice(VISIBLE_LIMIT));
const hasMore = computed(() => categories.value.length > VISIBLE_LIMIT);

const fetchCategories = async () => {
  try {
    const response = await fetch('/api/maxkb/categories');
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
  const element = document.getElementById(id);
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
  <header ref="headerRef" class="sticky top-0 z-50 flex items-center justify-between w-full max-w-[1440px] px-8 py-3 mx-auto mt-4 bg-white/20 backdrop-blur-sm border-2 border-white rounded-full shadow-sm shrink-0">
    <div class="flex items-center cursor-pointer gap-2" @click="goHome">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
        <Sparkles class="w-5 h-5 text-white" />
      </div>
      <span class="text-lg font-semibold text-text-main tracking-tight">FIT2CLOUD</span>
    </div>

    <nav class="flex items-center space-x-6">
      <div 
        v-for="category in visibleCategories" 
        :key="category.id"
        class="relative group"
      >
        <div class="flex items-center">
          <button
            @click="scrollToCategory(category.id)"
            class="text-sm font-medium text-text-main hover:text-primary transition-colors tracking-tight"
          >
            {{ category.name }}
          </button>
          <button 
            @click.stop="toggleDropdown(category.id)"
            class="ml-1 p-1 rounded-full hover:bg-black/5 transition-colors focus:outline-none"
          >
            <ChevronDown class="w-3 h-3 text-text-secondary transition-transform duration-200" :class="{ 'rotate-180': openDropdownId === category.id }" />
          </button>
        </div>

        <div 
          v-if="openDropdownId === category.id"
          class="absolute top-full left-0 mt-4 w-56 bg-white/95 backdrop-blur-md border border-white/50 rounded-2xl shadow-xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50"
        >
          <div class="max-h-[300px] overflow-y-auto custom-scrollbar px-2">
            <button
              v-for="agent in category.agents"
              :key="agent.id"
              @click="selectAgent(agent)"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/5 flex items-center space-x-3 transition-colors group"
            >
              <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center flex-shrink-0">
                <img v-if="agent.icon" :src="agent.icon" class="w-3.5 h-3.5 object-contain" />
                <Sparkles v-else class="w-3.5 h-3.5 text-primary" />
              </div>
              <span class="text-sm font-normal text-text-main group-hover:text-primary truncate">{{ agent.title }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="relative">
        <button 
          @click.stop="toggleDropdown('more')"
          class="flex items-center text-sm font-medium text-text-main hover:text-primary transition-colors focus:outline-none"
        >
          More
          <ChevronDown class="w-4 h-4 ml-1 transition-transform duration-200" :class="{ 'rotate-180': openDropdownId === 'more' }" />
        </button>

        <div 
          v-if="openDropdownId === 'more'"
          class="absolute top-full right-0 mt-4 w-64 bg-white/95 backdrop-blur-md border border-white/50 rounded-2xl shadow-xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50"
        >
          <div class="max-h-[400px] overflow-y-auto custom-scrollbar">
            <div v-for="category in moreCategories" :key="category.id" class="px-2 py-2">
              <div 
                @click="scrollToCategory(category.id)"
                class="px-3 py-1 text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-primary"
              >
                {{ category.name }}
              </div>
              <button
                v-for="agent in category.agents"
                :key="agent.id"
                @click="selectAgent(agent)"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/5 flex items-center space-x-3 transition-colors group"
              >
                <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center flex-shrink-0">
                  <img v-if="agent.icon" :src="agent.icon" class="w-3.5 h-3.5 object-contain" />
                  <Sparkles v-else class="w-3.5 h-3.5 text-primary" />
                </div>
                <span class="text-sm font-normal text-text-main group-hover:text-primary truncate">{{ agent.title }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex items-center space-x-4">
      <div v-if="authStore.isAuthenticated" class="flex items-center gap-3">
        <span class="text-sm text-gray-600">{{ authStore.user?.username }}</span>
        
        <router-link 
          v-if="authStore.isAdmin" 
          to="/admin" 
          class="p-2 text-gray-600 hover:text-primary transition-colors"
          title="Admin Management"
        >
          <Settings class="w-5 h-5" />
        </router-link>

        <button 
          @click="authStore.logout()" 
          class="p-2 text-gray-600 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut class="w-5 h-5" />
        </button>
      </div>
      <div v-else>
        <router-link to="/login" class="text-sm font-medium text-primary hover:text-primary/80">
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
