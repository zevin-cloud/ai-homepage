<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Category, Agent } from '@/data/categories';
import { 
  Sparkles, Bot, Cpu, Zap, Brain, MessageSquare, 
  Terminal, Globe, Rocket, Lightbulb, Code, Database,
  Layers, Box, Compass, Fingerprint
} from 'lucide-vue-next';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';

const categories = ref<Category[]>([]);
const loading = ref(true);
const themeStore = useThemeStore();
const authStore = useAuthStore();

const defaultIcons = [
  Sparkles, Bot, Cpu, Zap, Brain, MessageSquare, 
  Terminal, Globe, Rocket, Lightbulb, Code, Database,
  Layers, Box, Compass, Fingerprint
];

const getDefaultIcon = (agent: Agent) => {
  const str = agent.id || agent.title || '';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % defaultIcons.length;
  return defaultIcons[index];
};

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

    case 'custom':
      // 自定义布局：使用用户配置的预设
      const preset = themeStore.customLayoutPresets[themeStore.currentCustomLayoutPreset];
      if (preset && preset.rows) {
        let patternCount = 0;
        while (remainingAgents > 0) {
          // 循环使用预设的行模式
          const rowPreset = preset.rows[patternCount % preset.rows.length];
          if (rowPreset.cardCount === 1) {
            patternSequence.push('12');
            remainingAgents -= 1;
          } else if (rowPreset.cardCount === 2) {
            patternSequence.push('6-6');
            remainingAgents -= 2;
          } else if (rowPreset.cardCount === 3) {
            patternSequence.push('4-4-4');
            remainingAgents -= 3;
          } else if (rowPreset.cardCount === 4) {
            patternSequence.push('3-3-3-3');
            remainingAgents -= 4;
          }
          patternCount++;
        }
      } else {
        // 退化到智能布局
        while (remainingAgents >= 3) {
          patternSequence.push('4-4-4');
          remainingAgents -= 3;
        }
        if (remainingAgents === 2) {
          patternSequence.push('6-6');
        } else if (remainingAgents === 1) {
          patternSequence.push('12');
        }
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
  // 赛博科技、奢华暗黑、霓虹赛博、梦幻粉彩 保持特定背景色，不轮换实色
  const fixedBgThemes = ['cyberpunk-neon', 'luxury-dark', 'cyber-tech', 'pastel-dream'];
  if (fixedBgThemes.includes(themeStore.currentThemeId)) {
    return 'var(--theme-card)';
  }

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

// 获取阴影类名（针对梦幻粉彩主题的轮换效果）
const getCardShadowClass = (agentIndex: number): string => {
  if (themeStore.currentThemeId !== 'pastel-dream') return '';
  
  const classes = [
    'shadow-soft-purple',
    'shadow-soft-blue',
    'shadow-soft-mint',
    'shadow-soft-peach',
  ];
  return classes[agentIndex % classes.length];
};

// 获取边框颜色（针对深色主题的霓虹/金色点缀）
const getCardBorderColor = (agentIndex: number): string => {
  const darkThemes = ['cyberpunk-neon', 'luxury-dark', 'cyber-tech'];
  if (!darkThemes.includes(themeStore.currentThemeId)) {
    return 'var(--theme-card-border)';
  }

  // 这里的颜色对应主题中的 accent1 - accent4
  const colors = [
    'var(--theme-primary)',
    'var(--theme-accent-1)',
    'var(--theme-accent-2)',
    'var(--theme-accent-3)',
    'var(--theme-accent-4)',
  ];
  return colors[agentIndex % colors.length];
};

// 判断卡片背景是否为深色，针对浅色主题中穿插的黑色卡片
const isDarkBackground = (agentIndex: number): boolean => {
  // 如果当前已经是深色主题，则不需要进行硬编码的颜色反转，因为主题本身已经使用了浅色文字
  const isDarkTheme = ['cyberpunk-neon', 'luxury-dark', 'cyber-tech'].includes(themeStore.currentThemeId);
  if (isDarkTheme) return false;
  
  // 在非深色主题下，检查背景颜色变量名
  // accent-3 在默认主题下是黄/黑色，或者其他会被认为较深的颜色
  const bg = getCardBgColor(agentIndex);
  
  // 对于黑白极简主题，如果背景是黑色则需要白字
  if (themeStore.currentThemeId === 'swiss-minimalist' && bg.includes('accent-3')) {
    return true; // 极简主题中的 accentuate 往往是黑色
  }

  return false;
};

const expandedCategories = ref<Set<string>>(new Set());

const toggleCategory = (categoryId: string) => {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId);
  } else {
    expandedCategories.value.add(categoryId);
  }
};

const getVisibleAgents = (category: Category) => {
  if (!themeStore.collapseTiles || expandedCategories.value.has(category.id)) {
    return category.agents;
  }
  
  const layouts = calculateRowLayouts(category.agents.length, themeStore.currentLayoutMode);
  let totalCols = 0;
  const maxCols = 24; // 2 rows * 12 cols
  const visibleAgents: Agent[] = [];
  
  for (let i = 0; i < category.agents.length; i++) {
    const layout = layouts[i] || { colSpan: 4 };
    if (totalCols + layout.colSpan > maxCols) {
      break;
    }
    totalCols += layout.colSpan;
    visibleAgents.push(category.agents[i]);
  }
  
  return visibleAgents;
};

const hasHiddenAgents = (category: Category) => {
  if (!themeStore.collapseTiles) return false;
  return getVisibleAgents(category).length < category.agents.length;
};

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
       :class="`theme-layout-${themeStore.currentThemeId}`">

    <!-- Skeleton Loading State -->
    <div v-if="loading" class="py-12 space-y-16">
      <div v-for="i in 3" :key="i" class="space-y-8">
        <div class="h-10 w-48 rounded-lg skeleton"></div>
        <div class="bento-grid"
             :style="{
               gap: 'var(--theme-grid-gap)'
             }">
          <div v-for="j in 3" :key="j" class="skeleton rounded-2xl col-span-4 min-h-[200px]"></div>
        </div>
      </div>
    </div>

    <div v-else-if="categories.length === 0" class="text-center py-20" :style="{ color: 'var(--theme-text-muted)' }">
      <p class="text-xl mb-4">暂无可用应用</p>
      <p class="text-sm">请联系管理员为您分配应用权限</p>
    </div>

    <div v-else>
      <div v-for="(category, categoryIndex) in categories" :key="category.id" :id="`category-${category.id}`" class="mb-20 animate-fade-in-up" :style="{ animationDelay: `${categoryIndex * 0.1}s` }">
        <!-- Section Title -->
        <div class="flex items-end gap-4 mb-10">
          <div class="relative group cursor-default">
            <h2 class="text-3xl md:text-4xl font-bold relative z-10 transition-transform duration-300 group-hover:-translate-y-1"
                :style="{
                  color: 'var(--theme-text-main)',
                  fontFamily: 'var(--theme-font-secondary)'
                }">
              {{ category.name }}
            </h2>
            <div class="absolute -bottom-2 -left-2 w-full h-4 -rotate-2 rounded-full -z-0 transition-transform duration-300 group-hover:rotate-0 opacity-70"
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
               gap: 'var(--theme-grid-gap)'
             }">

          <div
            v-for="(agent, agentIndex) in getVisibleAgents(category)"
            :key="agent.id"
            @click="selectAgent(agent)"
            class="bento-card group cursor-pointer animate-fade-in-up hover:z-10"
            :style="{
              ...getCardStyle(agentIndex, category.agents.length),
              animationDelay: `${(categoryIndex * 0.1) + (agentIndex * 0.05)}s`,
            }">
            <div
              class="bento-card-inner relative h-full w-full overflow-hidden transition-all duration-500"
              :class="getCardShadowClass(agentIndex)"
              :style="{
                backgroundColor: getCardBgColor(agentIndex),
                border: ['organic-bento', 'pastel-dream'].includes(themeStore.currentThemeId)
                  ? 'var(--theme-border-width) var(--theme-border-style) var(--theme-card-border)'
                  : `var(--theme-border-width) var(--theme-border-style) ${getCardBorderColor(agentIndex)}`,
                borderRadius: 'var(--theme-radius-card)',
                boxShadow: themeStore.currentThemeId === 'organic-bento' ? '' : undefined,
                opacity: 0.95
              }">
              
              <!-- 只有在有机主题下才显示背景图逻辑（如果用户设置了） -->
              <div v-if="themeStore.currentThemeId === 'organic-bento' && themeStore.getCardBackground(agentIndex)" 
                   class="absolute inset-0 rounded-inherit"
                   :style="{
                     backgroundImage: `url(${themeStore.getCardBackground(agentIndex)})`,
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     opacity: 0.4
                   }"></div>

              <!-- 卡片内容 - 根据宽度自适应 -->
              <div class="relative z-10 flex flex-col h-full justify-between p-5" :class="{ 'text-white': isDarkBackground(agentIndex) }">
                <!-- 头部：图标和标签 -->
                <div class="flex justify-between items-start">
                  <div class="w-12 h-12 flex flex-shrink-0 items-center justify-center shadow-sm overflow-hidden transition-transform duration-300 group-hover:scale-105"
                       :style="{
                         backgroundColor: isDarkBackground(agentIndex) ? 'rgba(255,255,255,0.1)' : 'var(--theme-card)',
                         border: 'var(--theme-border-width) var(--theme-border-style) ' + (isDarkBackground(agentIndex) ? 'rgba(255,255,255,0.2)' : 'var(--theme-card-border)'),
                         borderRadius: 'var(--theme-radius-avatar)'
                       }">
                    <img v-if="agent.icon" :src="agent.icon" alt="" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <component v-else :is="getDefaultIcon(agent)" class="w-6 h-6 transition-all duration-300 group-hover:scale-110" :style="{ color: isDarkBackground(agentIndex) ? '#ffffff' : 'var(--theme-primary)' }" />
                  </div>
                  <span v-if="agentIndex === 0" class="text-xs font-bold px-2 py-1 rounded-full"
                        :style="{
                          backgroundColor: isDarkBackground(agentIndex) ? '#ffffff' : 'var(--theme-text-main)',
                          color: isDarkBackground(agentIndex) ? '#000000' : 'var(--theme-card)'
                        }">
                    Featured
                  </span>
                </div>

                <!-- 内容区 -->
                <div class="mt-4 flex-1 flex flex-col">
                  <h3 class="text-lg font-bold mb-2 line-clamp-1"
                      :style="{ color: isDarkBackground(agentIndex) ? '#ffffff' : 'var(--theme-text-main)', fontFamily: 'var(--theme-font-secondary)' }">
                    {{ agent.title }}
                  </h3>
                  <p class="text-sm leading-relaxed line-clamp-2 flex-1"
                     :style="{ color: isDarkBackground(agentIndex) ? 'rgba(255,255,255,0.7)' : 'var(--theme-text-secondary)' }">
                    {{ agent.description || '暂无描述' }}
                  </p>
                </div>

                <!-- 底部：点击提示 -->
                <div class="mt-4 pt-3 flex justify-between items-center"
                     :style="{ borderTop: '1px dashed ' + (isDarkBackground(agentIndex) ? 'rgba(255,255,255,0.2)' : 'var(--theme-card-border)') }">
                  <span class="text-xs font-bold uppercase tracking-wide" :style="{ color: isDarkBackground(agentIndex) ? 'rgba(255,255,255,0.5)' : 'var(--theme-text-muted)' }">
                    Click to chat
                  </span>
                  <span class="text-sm" :style="{ color: isDarkBackground(agentIndex) ? 'rgba(255,255,255,0.5)' : 'var(--theme-text-muted)' }">→</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- 展开/收起按钮 -->
        <div v-if="themeStore.collapseTiles && (hasHiddenAgents(category) || expandedCategories.has(category.id))" 
             class="mt-8 flex justify-center">
          <button 
            @click="toggleCategory(category.id)"
            class="px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md flex items-center gap-2"
            :style="{ 
              backgroundColor: 'var(--theme-card)',
              color: 'var(--theme-text-main)',
              border: 'var(--theme-border-width) var(--theme-border-style) var(--theme-card-border)'
            }"
          >
            <span>{{ expandedCategories.has(category.id) ? '收起卡片' : '展开全部' }}</span>
            <svg 
              class="w-4 h-4 transition-transform duration-300" 
              :class="{ 'rotate-180': expandedCategories.has(category.id) }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
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

/* Uiverse Card Circle Animation */
.bento-card::before {
  content: "";
  height: 100px;
  width: 100px;
  position: absolute;
  top: -40%;
  left: -20%;
  border-radius: 50%;
  border: 35px solid rgba(255, 255, 255, 0.102);
  transition: all .8s ease;
  filter: blur(.5rem);
  pointer-events: none;
  z-index: 0;
}

.bento-card:hover::before {
  width: 140px;
  height: 140px;
  top: -30%;
  left: 50%;
  filter: blur(0rem);
}

@media (max-width: 640px) {
  .bento-card {
    min-height: 140px;
  }
}

.bento-card:hover {
  transform: var(--theme-hover-transform);
  box-shadow: var(--theme-shadow-card-hover);
}

/* Line clamp utility */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
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
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
  }
  
  .bento-card {
    grid-column: 1 / -1 !important;
    min-height: 140px !important;
    height: auto !important;
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
