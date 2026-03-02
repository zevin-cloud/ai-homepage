<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Category, Agent } from '@/data/categories';
import { Sparkles } from 'lucide-vue-next';
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

// 布局模式定义 - 固定高度，变化宽度
// 使用 12 列网格系统，确保每行都填满12列

type CardLayout = {
  colSpan: number;  // 跨多少列 (1-12)
};

// 计算每行的布局，确保每行总和为12列
const calculateRowLayouts = (totalAgents: number, layoutMode: string): CardLayout[] => {
  const layouts: CardLayout[] = [];
  let remainingAgents = totalAgents;
  let agentIndex = 0;

  // 定义行模式（每行总和为12）
  const rowPatterns = {
    '8-4': [{ colSpan: 8 }, { colSpan: 4 }],           // 8+4=12
    '4-4-4': [{ colSpan: 4 }, { colSpan: 4 }, { colSpan: 4 }],  // 4+4+4=12
    '6-6': [{ colSpan: 6 }, { colSpan: 6 }],           // 6+6=12
    '6-3-3': [{ colSpan: 6 }, { colSpan: 3 }, { colSpan: 3 }],  // 6+3+3=12
    '3-3-3-3': [{ colSpan: 3 }, { colSpan: 3 }, { colSpan: 3 }, { colSpan: 3 }],  // 3+3+3+3=12
    '12': [{ colSpan: 12 }],                           // 全宽
  };

  // 根据布局模式选择行模式序列
  let patternSequence: string[] = [];
  
  switch (layoutMode) {
    case 'compact':
      // 紧凑布局：全部4-4-4
      while (remainingAgents > 0) {
        patternSequence.push('4-4-4');
        remainingAgents -= 3;
      }
      break;

    case 'loose':
      // 宽松布局：第一行8-4，其余6-6
      if (remainingAgents > 0) {
        patternSequence.push('8-4');
        remainingAgents -= 2;
      }
      while (remainingAgents > 0) {
        patternSequence.push('6-6');
        remainingAgents -= 2;
      }
      break;

    case 'random':
      // 随机布局：混合多种模式
      const randomPatterns = ['8-4', '4-4-4', '6-6', '6-3-3'];
      while (remainingAgents > 0) {
        const randomPattern = randomPatterns[Math.floor(Math.random() * randomPatterns.length)];
        patternSequence.push(randomPattern);
        remainingAgents -= rowPatterns[randomPattern].length;
      }
      break;

    case 'masonry':
      // 瀑布流：交替8-4和4-4-4
      let useLarge = true;
      while (remainingAgents > 0) {
        if (useLarge && remainingAgents >= 2) {
          patternSequence.push('8-4');
          remainingAgents -= 2;
        } else {
          patternSequence.push('4-4-4');
          remainingAgents -= 3;
        }
        useLarge = !useLarge;
      }
      break;

    case 'auto':
    default:
      // 智能布局：第一行8-4，然后4-4-4，然后6-6
      if (remainingAgents >= 2) {
        patternSequence.push('8-4');
        remainingAgents -= 2;
      }
      while (remainingAgents >= 3) {
        patternSequence.push('4-4-4');
        remainingAgents -= 3;
      }
      if (remainingAgents === 2) {
        patternSequence.push('6-6');
      } else if (remainingAgents === 1) {
        patternSequence.push('12');
      }
      break;
  }

  // 将模式展开为单个卡片布局
  for (const pattern of patternSequence) {
    const cards = rowPatterns[pattern];
    for (const card of cards) {
      if (agentIndex < totalAgents) {
        layouts.push(card);
        agentIndex++;
      }
    }
  }

  return layouts;
};

// 获取卡片样式
const getCardStyle = (agentIndex: number, totalAgents: number) => {
  const layouts = calculateRowLayouts(totalAgents, themeStore.currentLayoutMode);
  const layout = layouts[agentIndex] || { colSpan: 4 };
  return {
    gridColumn: `span ${layout.colSpan}`,
  };
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

        <!-- Bento Grid Layout - 固定高度 200px -->
        <div class="bento-grid"
             :class="{
               'theme-organic-grid': themeStore.currentThemeId === 'organic-bento',
               'theme-cyberpunk-grid': themeStore.currentThemeId === 'cyberpunk-neon',
               'theme-luxury-grid': themeStore.currentThemeId === 'luxury-dark',
               'theme-cybertech-grid': themeStore.currentThemeId === 'cyber-tech',
               'theme-swiss-grid': themeStore.currentThemeId === 'swiss-minimalist',
               'theme-pastel-grid': themeStore.currentThemeId === 'pastel-dream'
             }"
             :style="{
               display: 'grid',
               gridTemplateColumns: 'repeat(12, 1fr)',
               gap: 'var(--theme-grid-gap)',
               gridAutoRows: '200px'
             }">

          <div
            v-for="(agent, agentIndex) in category.agents"
            :key="agent.id"
            @click="selectAgent(agent)"
            class="bento-card group cursor-pointer"
            :style="{
              ...getCardStyle(agentIndex, category.agents.length),
              backgroundColor: themeStore.getCardBackground(agentIndex) ? 'transparent' : getCardBgColor(agentIndex),
              backgroundImage: themeStore.getCardBackground(agentIndex) ? `url(${themeStore.getCardBackground(agentIndex)})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 'var(--theme-radius-card)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--theme-card-border)',
              minHeight: '200px'
            }"
          >
            <!-- 卡片背景遮罩 -->
            <div v-if="themeStore.getCardBackground(agentIndex)" 
                 class="absolute inset-0 rounded-inherit"
                 :style="{
                   backgroundColor: 'rgba(0, 0, 0, 0.4)',
                   borderRadius: 'var(--theme-radius-card)'
                 }"></div>
            
            <!-- 卡片内容 - 根据宽度自适应 -->
            <div class="relative z-10 flex flex-col h-full justify-between p-6">
              <!-- 头部：图标和标签 -->
              <div class="flex justify-between items-start">
                <div class="w-12 h-12 flex items-center justify-center"
                     :style="{
                       backgroundColor: 'var(--theme-card)',
                       border: 'var(--theme-border-width) var(--theme-border-style) var(--theme-card-border)',
                       borderRadius: 'var(--theme-radius-md)'
                     }">
                  <img v-if="agent.icon" :src="agent.icon" alt="" class="w-6 h-6 object-contain" />
                  <Sparkles v-else class="w-6 h-6" :style="{ color: 'var(--theme-primary)' }" />
                </div>
                <span v-if="agentIndex === 0" class="text-xs font-bold px-2 py-1 rounded-full"
                      :style="{
                        backgroundColor: 'var(--theme-text-main)',
                        color: 'var(--theme-card)'
                      }">
                  Featured
                </span>
              </div>

              <!-- 内容区 -->
              <div class="mt-4 flex-1 flex flex-col">
                <h3 class="text-lg font-bold mb-2 line-clamp-1"
                    :style="{ color: 'var(--theme-text-main)', fontFamily: 'var(--theme-font-secondary)' }">
                  {{ agent.title }}
                </h3>
                <p class="text-sm leading-relaxed line-clamp-2 flex-1"
                   :style="{ color: 'var(--theme-text-secondary)' }">
                  {{ agent.description || '暂无描述' }}
                </p>
              </div>

              <!-- 底部：点击提示 -->
              <div class="mt-4 pt-3 flex justify-between items-center"
                   :style="{ borderTop: '1px dashed var(--theme-card-border)' }">
                <span class="text-xs font-bold uppercase tracking-wide" :style="{ color: 'var(--theme-text-muted)' }">
                  Click to chat
                </span>
                <span class="text-sm" :style="{ color: 'var(--theme-text-muted)' }">→</span>
              </div>
            </div>
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
  grid-template-columns: repeat(12, 1fr);
  gap: var(--theme-grid-gap);
  grid-auto-rows: 200px;
}

/* Card Base Styles */
.bento-card {
  position: relative;
  overflow: hidden;
  transition: var(--theme-hover-transition);
  min-height: 200px;
}

.bento-card:hover {
  transform: var(--theme-hover-transform);
  box-shadow: var(--theme-shadow-card-hover);
}

/* Line clamp utility */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ============================================
   Theme Specific Styles
   ============================================ */

/* Cyberpunk Neon */
.theme-cyberpunk-grid .bento-card {
  background: linear-gradient(160deg, rgba(30, 20, 50, 0.6) 0%, rgba(10, 5, 20, 0.8) 100%);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.theme-cyberpunk-grid .bento-card:hover {
  border-color: rgba(188, 19, 254, 0.5);
  box-shadow: 0 0 30px rgba(188, 19, 254, 0.3);
}

/* Luxury Dark */
.theme-luxury-grid .bento-card {
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.theme-luxury-grid .bento-card:hover {
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.1);
}

/* Cyber Tech */
.theme-cybertech-grid .bento-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 240, 255, 0.3);
}

.theme-cybertech-grid .bento-card:hover {
  border-color: #00F0FF;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
}

/* Swiss Minimalist */
.theme-swiss-grid .bento-card {
  border-radius: 0;
  border: 2px solid var(--theme-card-border);
  box-shadow: none;
}

.theme-swiss-grid .bento-card:hover {
  transform: translateY(-2px);
  box-shadow: none;
}

/* Pastel Dream */
.theme-pastel-grid .bento-card {
  box-shadow: 0 20px 40px -10px rgba(216, 180, 254, 0.3);
}

.theme-pastel-grid .bento-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 25px 50px -10px rgba(216, 180, 254, 0.4);
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .bento-card {
    grid-column: span 3 !important;
  }
}

@media (max-width: 640px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
  
  .bento-card {
    grid-column: span 1 !important;
  }
}
</style>
