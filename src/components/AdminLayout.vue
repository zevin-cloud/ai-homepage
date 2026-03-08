<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  Users, 
  BarChart3, 
  Home, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isCollapsed = ref(false);
const isMobileOpen = ref(false);

const menuItems = [
  {
    name: '用户管理',
    path: '/admin',
    icon: Users,
    id: 'users'
  },
  {
    name: '用量分析',
    path: '/admin/analytics',
    icon: BarChart3,
    id: 'analytics'
  }
];

const currentPath = computed(() => route.path);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Mobile Backdrop -->
    <div 
      v-if="isMobileOpen" 
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="isMobileOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-20' : 'w-64',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo Header -->
      <div class="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <BarChart3 class="w-5 h-5 text-white" />
          </div>
          <span v-if="!isCollapsed" class="font-bold text-lg text-gray-900 truncate">AI Portal Admin</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        <router-link 
          v-for="item in menuItems" 
          :key="item.id"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
            currentPath === item.path 
              ? 'bg-blue-50 text-blue-600 font-medium' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          ]"
          @click="isMobileOpen = false"
        >
          <component :is="item.icon" :class="['w-5 h-5 shrink-0', currentPath === item.path ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600']" />
          <span v-if="!isCollapsed" class="whitespace-nowrap">{{ item.name }}</span>
          
          <!-- Tooltip for collapsed mode -->
          <div v-if="isCollapsed" class="fixed left-20 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity ml-2 z-[60]">
            {{ item.name }}
          </div>
        </router-link>
      </nav>

      <!-- Bottom Actions -->
      <div class="p-4 border-t border-gray-100 space-y-2 shrink-0">
        <button 
          @click="goHome"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-all overflow-hidden"
        >
          <Home class="w-5 h-5 shrink-0 text-gray-400" />
          <span v-if="!isCollapsed" class="whitespace-nowrap">返回前台</span>
        </button>
        
        <button 
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all overflow-hidden"
        >
          <LogOut class="w-5 h-5 shrink-0" />
          <span v-if="!isCollapsed" class="whitespace-nowrap">退出登录</span>
        </button>

        <!-- Collapse Toggle (Desktop) -->
        <button 
          @click="toggleSidebar"
          class="hidden lg:flex w-full mt-4 items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-all border border-gray-100"
        >
          <ChevronLeft v-if="!isCollapsed" class="w-5 h-5" />
          <ChevronRight v-else class="w-5 h-5" />
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      <!-- Mobile Header -->
      <header class="lg:hidden h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0">
        <button @click="isMobileOpen = true" class="p-2 -ml-2 text-gray-600">
          <Menu class="w-6 h-6" />
        </button>
        <span class="font-bold text-gray-900">AI Portal Admin</span>
        <div class="w-6"></div> <!-- Spacer -->
      </header>

      <main class="flex-1 overflow-y-auto p-4 lg:p-8">
        <div class="max-w-7xl mx-auto h-full">
          <slot></slot>
          <router-view v-if="!$slots.default"></router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Ensure the sidebar transitions smoothly */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
