<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Category, Agent } from '@/data/categories';
import { Sparkles, Database, Download, CloudUpload, Bot, Search, FileCheck, FileText, Mail, HelpCircle } from 'lucide-vue-next';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';

const categories = ref<Category[]>([]);
const loading = ref(true);
const themeStore = useThemeStore();
const authStore = useAuthStore();

const emit = defineEmits<{
  (e: 'select-agent', url: string): void
}>();

const selectAgent = (agent: Agent) => {
  emit('select-agent', agent.url);
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

// 根据布局模式和应用索引确定卡片大小
const getCardSize = (agentIndex: number, totalAgents: number): 'large' | 'medium' | 'small' | 'wide' => {
  const layoutMode = themeStore.currentLayoutMode;

  switch (layoutMode) {
    case 'compact':
      // 紧凑布局：全部小卡片
      return 'small';

    case 'loose':
      // 宽松布局：前2个大卡片，其余中等
      if (agentIndex < 2) return 'large';
      return 'medium';

    case 'random':
      // 随机布局：伪随机分配
      const patterns = [
        ['large', 'medium', 'medium', 'small', 'small', 'small'],
        ['large', 'large', 'medium', 'medium', 'small', 'small'],
        ['wide', 'wide', 'medium', 'medium', 'medium'],
        ['large', 'medium', 'small', 'small', 'small', 'small', 'small'],
      ];
      const patternIndex = (agentIndex + totalAgents) % patterns.length;
      const pattern = patterns[patternIndex];
      return pattern[agentIndex % pattern.length] as 'large' | 'medium' | 'small' | 'wide';

    case 'masonry':
      // 瀑布流布局：交替大小
      if (agentIndex % 3 === 0) return 'large';
      if (agentIndex % 3 === 1) return 'medium';
      return 'small';

    case 'auto':
    default:
      // 智能布局：第一个突出，接下来2-3个中等，其余小
      if (agentIndex === 0) return 'large';
      if (agentIndex <= 2) return 'medium';
      return 'small';
  }
};

// 获取卡片样式类
const getCardClass = (agentIndex: number, totalAgents: number): string => {
  const size = getCardSize(agentIndex, totalAgents);
  return `card-${size}`;
};

// 获取背景颜色（根据索引轮换）
const getCardBgColor = (agentIndex: number): string => {
  const colors = [
    'var(--theme-primary-light)',
    'var(--theme-card)',
    'var(--theme-accent-1-light, var(--theme-accent-1))',
    'var(--theme-accent-2-light, var(--theme-accent-2))',
    'var(--theme-accent-3-light, var(--theme-accent-3))',
    'var(--theme-accent-4-light, var(--theme-accent-4))',
  ];
  return colors[agentIndex % colors.length];
};

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
       :class="`theme-layout-${themeStore.currentThemeId}`">

    <div v-if="loading" class="text-center py-20" :style="{ color: 'var(--theme-text-muted)' }">
      Loading...
    </div>

    <div v-else-if="categories.length === 0" class="text-center py-20" :style="{ color: 'var(--theme-text-muted)' }">
      <p class="text-xl mb-4">暂无可用应用</p>
      <p class="text-sm">请联系管理员为您分配应用权限</p>
    </div>

    <div v-else>
      <div v-for="(category, categoryIndex) in categories" :key="category.id" :id="`category-${category.id}`" class="mb-16">
        <!-- Section Title -->
        <div class="flex items-end gap-4 mb-8">
          <div class="relative">
            <h2 class="text-4xl font-bold relative z-10"
                :style="{
                  color: 'var(--theme-text-main)',
                  fontFamily: 'var(--theme-font-secondary)'
                }">
              {{ category.name }}
            </h2>
            <div class="absolute -bottom-2 -left-2 w-full h-4 -rotate-1 rounded-full -z-0"
                 :style="{ backgroundColor: getCardBgColor(categoryIndex) }"></div>
          </div>
        </div>

        <!-- Bento Grid Layout -->
        <div class="bento-grid"
             :class="{
               'theme-organic-grid': themeStore.currentThemeId === 'organic-bento',
               'theme-cyberpunk-grid': themeStore.currentThemeId === 'cyberpunk-neon',
               'theme-luxury-grid': themeStore.currentThemeId === 'luxury-dark',
               'theme-cybertech-grid': themeStore.currentThemeId === 'cyber-tech',
               'theme-swiss-grid': themeStore.currentThemeId === 'swiss-minimalist',
               'theme-pastel-grid': themeStore.currentThemeId === 'pastel-dream'
             }">

          <div
            v-for="(agent, agentIndex) in category.agents"
            :key="agent.id"
            @click="selectAgent(agent)"
            class="bento-card group cursor-pointer"
            :class="getCardClass(agentIndex, category.agents.length)"
            :style="{
              backgroundColor: getCardBgColor(agentIndex),
              borderRadius: 'var(--theme-radius-card)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--theme-card-border)'
            }"
          >
            <!-- Large Card Layout -->
            <template v-if="getCardSize(agentIndex, category.agents.length) === 'large'">
              <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <img v-if="agent.icon" :src="agent.icon" alt="" class="w-32 h-32 object-contain" />
                <Sparkles v-else class="w-32 h-32" :style="{ color: 'var(--theme-primary)' }" />
              </div>
              <div class="relative z-10 flex flex-col h-full justify-between p-8">
                <div class="flex justify-between items-start">
                  <div class="w-16 h-16 flex items-center justify-center"
                       :style="{
                         backgroundColor: 'var(--theme-card)',
                         border: 'var(--theme-border-width) var(--theme-border-style) var(--theme-card-border)',
                         borderRadius: 'var(--theme-radius-md)'
                       }">
                    <img v-if="agent.icon" :src="agent.icon" alt="" class="w-8 h-8 object-contain" />
                    <Sparkles v-else class="w-8 h-8" :style="{ color: 'var(--theme-primary)' }" />
                  </div>
                  <span v-if="agentIndex === 0" class="text-xs font-bold px-3 py-1.5 rounded-full"
                        :style="{
                          backgroundColor: 'var(--theme-text-main)',
                          color: 'var(--theme-card)'
                        }">
                    Featured
                  </span>
                </div>
                <div class="mt-8">
                  <h3 class="text-2xl font-bold mb-3"
                      :style="{ color: 'var(--theme-text-main)', fontFamily: 'var(--theme-font-secondary)' }">
                    {{ agent.title }}
                  </h3>
                  <p class="font-medium text-lg leading-relaxed max-w-xl"
                     :style="{ color: 'var(--theme-text-secondary)' }">
                    {{ agent.description || '暂无描述' }}
                  </p>
                </div>
              </div>
            </template>

            <!-- Medium Card Layout -->
            <template v-else-if="getCardSize(agentIndex, category.agents.length) === 'medium'">
              <div class="p-6 flex flex-col h-full">
                <div class="flex justify-between items-start mb-4">
                  <div class="w-12 h-12 flex items-center justify-center"
                       :style="{
                         backgroundColor: 'var(--theme-card)',
                         border: 'var(--theme-border-width) var(--theme-border-style) var(--theme-card-border)',
                         borderRadius: 'var(--theme-radius-md)'
                       }">
                    <img v-if="agent.icon" :src="agent.icon" alt="" class="w-6 h-6 object-contain" />
                    <Sparkles v-else class="w-6 h-6" :style="{ color: 'var(--theme-primary)' }" />
                  </div>
                </div>
                <h3 class="text-lg font-bold mb-2"
                    :style="{ color: 'var(--theme-text-main)', fontFamily: 'var(--theme-font-secondary)' }">
                  {{ agent.title }}
                </h3>
                <p class="text-sm leading-relaxed flex-grow" :style="{ color: 'var(--theme-text-secondary)' }">
                  {{ agent.description || '暂无描述' }}
                </p>
                <div class="mt-auto pt-4 flex justify-between items-center"
                     :style="{ borderTop: '1px dashed var(--theme-card-border)' }">
                  <span class="text-xs font-bold uppercase tracking-wide" :style="{ color: 'var(--theme-text-muted)' }">
                    Click to chat
                  </span>
                  <span class="text-sm" :style="{ color: 'var(--theme-text-muted)' }">→</span>
                </div>
              </div>
            </template>

            <!-- Wide Card Layout -->
            <template v-else-if="getCardSize(agentIndex, category.agents.length) === 'wide'">
              <div class="relative z-10 flex flex-col h-full justify-between p-8">
                <div class="flex justify-between items-start">
                  <div class="w-16 h-16 flex items-center justify-center"
                       :style="{
                         backgroundColor: 'var(--theme-card)',
                         border: 'var(--theme-border-width) var(--theme-border-style) var(--theme-card-border)',
                         borderRadius: 'var(--theme-radius-md)'
                       }">
                    <img v-if="agent.icon" :src="agent.icon" alt="" class="w-8 h-8 object-contain" />
                    <Sparkles v-else class="w-8 h-8" :style="{ color: 'var(--theme-primary)' }" />
                  </div>
                </div>
                <div class="mt-8">
                  <h3 class="text-2xl font-bold mb-3"
                      :style="{ color: 'var(--theme-text-main)', fontFamily: 'var(--theme-font-secondary)' }">
                    {{ agent.title }}
                  </h3>
                  <p class="font-medium text-lg leading-relaxed max-w-xl"
                     :style="{ color: 'var(--theme-text-secondary)' }">
                    {{ agent.description || '暂无描述' }}
                  </p>
                </div>
              </div>
            </template>

            <!-- Small Card Layout -->
            <template v-else>
              <div class="p-6 flex flex-col justify-center items-center text-center h-full">
                <div class="w-14 h-14 flex items-center justify-center mb-3"
                     :style="{
                       backgroundColor: 'var(--theme-card)',
                       border: 'var(--theme-border-width) var(--theme-border-style) var(--theme-card-border)',
                       borderRadius: '50%'
                     }">
                  <img v-if="agent.icon" :src="agent.icon" alt="" class="w-6 h-6 object-contain" />
                  <Sparkles v-else class="w-6 h-6" :style="{ color: 'var(--theme-primary)' }" />
                </div>
                <h3 class="text-base font-bold mb-1"
                    :style="{ color: 'var(--theme-text-main)', fontFamily: 'var(--theme-font-secondary)' }">
                  {{ agent.title }}
                </h3>
                <p class="text-xs line-clamp-2" :style="{ color: 'var(--theme-text-muted)' }">
                  {{ agent.description || '暂无描述' }}
                </p>
              </div>
            </template>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Base Bento Grid */
.bento-grid {
  display: grid;
  gap: var(--theme-grid-gap);
  grid-auto-rows: minmax(180px, auto);
}

/* Card Base Styles */
.bento-card {
  position: relative;
  overflow: hidden;
  transition: var(--theme-hover-transition);
}

.bento-card:hover {
  transform: var(--theme-hover-transform);
  box-shadow: var(--theme-shadow-card-hover);
}

/* ============================================
   Organic Bento Grid Layout
   ============================================ */
.theme-organic-grid {
  grid-template-columns: repeat(12, 1fr);
}

.theme-organic-grid .card-large {
  grid-column: span 8;
  grid-row: span 2;
  min-height: 380px;
}

.theme-organic-grid .card-medium {
  grid-column: span 4;
  min-height: 180px;
}

.theme-organic-grid .card-small {
  grid-column: span 3;
  min-height: 180px;
}

.theme-organic-grid .card-wide {
  grid-column: span 6;
  min-height: 200px;
}

/* ============================================
   Cyberpunk Neon Grid Layout
   ============================================ */
.theme-cyberpunk-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.theme-cyberpunk-grid .card-large {
  grid-column: span 2;
  grid-row: span 2;
  min-height: 320px;
}

.theme-cyberpunk-grid .card-medium,
.theme-cyberpunk-grid .card-small {
  min-height: 160px;
}

.theme-cyberpunk-grid .bento-card {
  background: linear-gradient(160deg, rgba(30, 20, 50, 0.6) 0%, rgba(10, 5, 20, 0.8) 100%);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.theme-cyberpunk-grid .bento-card:hover {
  border-color: rgba(188, 19, 254, 0.5);
  box-shadow: 0 0 30px rgba(188, 19, 254, 0.3);
}

/* ============================================
   Luxury Dark Grid Layout
   ============================================ */
.theme-luxury-grid {
  grid-template-columns: repeat(4, 1fr);
}

.theme-luxury-grid .card-large {
  grid-column: span 2;
  grid-row: span 2;
  min-height: 400px;
}

.theme-luxury-grid .card-medium,
.theme-luxury-grid .card-small {
  min-height: 200px;
}

.theme-luxury-grid .bento-card {
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.theme-luxury-grid .bento-card:hover {
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.1);
}

/* ============================================
   Cyber Tech Grid Layout
   ============================================ */
.theme-cybertech-grid {
  grid-template-columns: repeat(12, 1fr);
}

.theme-cybertech-grid .card-large {
  grid-column: span 8;
  grid-row: span 2;
  min-height: 360px;
}

.theme-cybertech-grid .card-medium {
  grid-column: span 4;
  min-height: 170px;
}

.theme-cybertech-grid .card-small {
  grid-column: span 3;
  min-height: 170px;
}

.theme-cybertech-grid .card-wide {
  grid-column: span 6;
  min-height: 170px;
}

.theme-cybertech-grid .bento-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 240, 255, 0.3);
}

.theme-cybertech-grid .bento-card:hover {
  border-color: #00F0FF;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
}

/* ============================================
   Swiss Minimalist Grid Layout
   ============================================ */
.theme-swiss-grid {
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

.theme-swiss-grid .card-large {
  grid-column: span 8;
  grid-row: span 2;
  min-height: 380px;
}

.theme-swiss-grid .card-medium {
  grid-column: span 4;
  min-height: 180px;
}

.theme-swiss-grid .card-small {
  grid-column: span 3;
  min-height: 180px;
}

.theme-swiss-grid .card-wide {
  grid-column: span 6;
  min-height: 180px;
}

.theme-swiss-grid .bento-card {
  border-radius: 0;
  border: 2px solid var(--theme-card-border);
  box-shadow: none;
}

.theme-swiss-grid .bento-card:hover {
  transform: translateY(-2px);
  box-shadow: none;
}

/* ============================================
   Pastel Dream Grid Layout
   ============================================ */
.theme-pastel-grid {
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
}

.theme-pastel-grid .card-large {
  grid-column: span 8;
  grid-row: span 2;
  min-height: 400px;
}

.theme-pastel-grid .card-medium {
  grid-column: span 4;
  min-height: 200px;
}

.theme-pastel-grid .card-small {
  grid-column: span 3;
  min-height: 200px;
}

.theme-pastel-grid .card-wide {
  grid-column: span 6;
  min-height: 200px;
}

.theme-pastel-grid .bento-card {
  box-shadow: 0 20px 40px -10px rgba(216, 180, 254, 0.3);
}

.theme-pastel-grid .bento-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 25px 50px -10px rgba(216, 180, 254, 0.4);
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .theme-organic-grid .card-large,
  .theme-cybertech-grid .card-large,
  .theme-swiss-grid .card-large,
  .theme-pastel-grid .card-large {
    grid-column: span 12;
  }

  .theme-organic-grid .card-medium,
  .theme-cybertech-grid .card-medium,
  .theme-swiss-grid .card-medium,
  .theme-pastel-grid .card-medium {
    grid-column: span 6;
  }

  .theme-organic-grid .card-small,
  .theme-cybertech-grid .card-small,
  .theme-swiss-grid .card-small,
  .theme-pastel-grid .card-small {
    grid-column: span 6;
  }

  .theme-luxury-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .theme-luxury-grid .card-large {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }

  .bento-grid .card-large,
  .bento-grid .card-medium,
  .bento-grid .card-small {
    grid-column: span 1;
  }
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
