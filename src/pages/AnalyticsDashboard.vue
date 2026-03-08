<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  ChevronRight
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import ChatLogViewer from '@/components/ChatLogViewer.vue';

const authStore = useAuthStore();
const loading = ref(true);
const showLogViewer = ref(false);
const selectedLogId = ref<string | undefined>(undefined);
const selectedAppId = ref<string | undefined>(undefined);

const stats = ref({
  totalQuestions: 0,
  totalTokens: 0,
  totalUsers: 0,
  appCount: 0
});

const categories = ref<any[]>([]);
const recentLogs = ref<any[]>([]);

const fetchOverview = async () => {
  try {
    const res = await fetch('/api/analytics/overview', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (data.success) {
      stats.value = data.data;
    }
  } catch (e) {
    console.error('Failed to fetch overview', e);
  }
};

const fetchAppList = async () => {
  try {
    const res = await fetch('/api/maxkb/categories', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (data.success) {
      categories.value = data.data;
    }
  } catch (e) {
    console.error('Failed to fetch apps', e);
  }
};

const fetchRecentLogsForAllApps = async () => {
  try {
    const apps = flattenedApps.value;
    if (apps.length === 0) return;
    
    // 我们在这里仅作为示例，抓取前两个应用的数据并合并展示
    // 在真实生产中，如果有很多应用，我们应当调整专门聚合展示的接口
    let allLogs: any[] = [];
    for (let i = 0; i < Math.min(2, apps.length); i++) {
      const app = apps[i];
      try {
        const res = await fetch(`/api/analytics/app/${app.id}/logs?page=1&size=5`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        const logData = await res.json();
        if (logData.success && logData.data?.records) {
          allLogs = allLogs.concat(
             logData.data.records.map((r: any) => ({
                 ...r,
                 appName: app.title,
                 appId: app.id
             }))
          );
        }
      } catch(er) {}
    }
    
    // Sort by create_time desc
    allLogs.sort((a,b) => new Date(b.create_time).getTime() - new Date(a.create_time).getTime());
    recentLogs.value = allLogs.slice(0, 10);
  } catch(e) {
    console.error('Failed to fetch recent logs', e);
  }
};

onMounted(async () => {
  loading.value = true;
  await fetchOverview();
  await fetchAppList();
  await fetchRecentLogsForAllApps();
  loading.value = false;
});

const cards = computed(() => [
  {
    title: '总提问数',
    value: stats.value.totalQuestions.toLocaleString(),
    icon: MessageSquare,
    trend: '+12.5%',
    trendUp: true,
    color: 'from-blue-500 to-cyan-400',
    shadow: 'shadow-blue-200'
  },
  {
    title: 'Token 消耗',
    value: stats.value.totalTokens.toLocaleString(),
    icon: Zap,
    trend: '+8.2%',
    trendUp: true,
    color: 'from-purple-500 to-pink-500',
    shadow: 'shadow-purple-200'
  },
  {
    title: '活跃用户',
    value: stats.value.totalUsers.toLocaleString(),
    icon: Users,
    trend: '-2.4%',
    trendUp: false,
    color: 'from-orange-400 to-red-500',
    shadow: 'shadow-orange-200'
  },
  {
    title: '已接入应用',
    value: stats.value.appCount.toString(),
    icon: TrendingUp,
    trend: '+2',
    trendUp: true,
    color: 'from-emerald-400 to-teal-500',
    shadow: 'shadow-emerald-200'
  }
]);

// 展平所有应用以进行排序
const flattenedApps = computed(() => {
  const apps: any[] = [];
  categories.value.forEach(cat => {
    cat.agents.forEach((agent: any) => {
      apps.push({
        ...agent,
        categoryName: cat.name
      });
    });
  });
  // 这里可以根据实际统计数据排序，POC 中模拟一些热度数据
  return apps.slice(0, 5); 
});

const openLogDetails = (appId: string, logId: string) => {
  selectedAppId.value = appId;
  selectedLogId.value = logId;
  showLogViewer.value = true;
};
</script>

<template>
  <div class="space-y-8 animate-fade-in">
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">数据概览</h2>
          <p class="text-gray-500 mt-1">欢迎回来，以下是您 MaxKB 应用的运行数据分析。</p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-sm font-medium text-gray-600">实时同步中</span>
        </div>
      </div>

      <!-- Metric Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="card in cards" 
          :key="card.title"
          class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
        >
          <!-- Gradient Background Hint -->
          <div :class="['absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity', card.color]"></div>
          
          <div class="flex items-start justify-between">
            <div :class="['p-3 rounded-xl bg-gradient-to-br text-white shadow-lg', card.color, card.shadow]">
              <component :is="card.icon" class="w-6 h-6" />
            </div>
            <div :class="['flex items-center gap-1 text-sm font-medium', card.trendUp ? 'text-emerald-500' : 'text-red-500']">
              <span>{{ card.trend }}</span>
              <ArrowUpRight v-if="card.trendUp" class="w-4 h-4" />
              <ArrowDownRight v-else class="w-4 h-4" />
            </div>
          </div>
          
          <div class="mt-4">
            <h3 class="text-gray-500 text-sm font-medium">{{ card.title }}</h3>
            <div class="text-2xl font-bold text-gray-900 mt-1">{{ card.value }}</div>
          </div>
        </div>
      </div>

      <!-- Main Analytics Area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 text-gray-600">
        <!-- Growth Chart Placeholder / Usage Heatmap -->
        <div class="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-lg font-bold text-gray-900">使用热度趋势</h3>
            <select class="text-sm border-none bg-gray-50 rounded-lg px-3 py-1.5 focus:ring-0">
              <option>最近 7 天</option>
              <option>最近 30 天</option>
            </select>
          </div>
          
          <!-- Mock Chart -->
          <div class="h-64 flex items-end justify-between gap-4 px-2">
            <div v-for="i in 7" :key="i" class="flex-1 flex flex-col items-center gap-4 group">
              <div class="w-full bg-blue-50 rounded-lg relative overflow-hidden flex flex-col justify-end" style="height: 100%">
                <div 
                  class="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-1000 ease-out"
                  :style="{ height: `${[40, 65, 50, 85, 95, 75, 60][i-1]}%` }"
                >
                  <div class="absolute top-0 left-0 w-full h-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
              <span class="text-xs text-gray-400 font-medium">03/0{{ i }}</span>
            </div>
          </div>
        </div>

        <!-- Right Side: Top Apps -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-gray-900">热门应用</h3>
            <button class="text-blue-600 text-sm font-medium hover:underline">查看全部</button>
          </div>

          <div class="space-y-6">
            <div v-for="(app, idx) in flattenedApps" :key="app.id" class="flex items-center gap-4 group cursor-pointer">
              <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {{ idx + 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-gray-900 truncate">{{ app.title }}</h4>
                <p class="text-xs text-gray-400 truncate">{{ app.categoryName }}</p>
              </div>
              <div class="text-right">
                <div class="text-sm font-bold text-gray-900">{{ (1000 - idx * 150) }}</div>
                <div class="text-[10px] text-gray-400 uppercase tracking-wider">对话数</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recent Chat Logs Area -->
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-8 pb-4 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900">最新对话审计</h3>
          <div class="flex items-center gap-2">
            <div class="relative">
              <input 
                type="text" 
                placeholder="搜索日志..." 
                class="pl-4 pr-10 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                <th class="px-8 py-4">时间</th>
                <th class="px-8 py-4">应用</th>
                <th class="px-8 py-4">提问摘要</th>
                <th class="px-8 py-4">Token 消耗</th>
                <th class="px-8 py-4">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr 
                v-for="log in recentLogs" 
                :key="log.id" 
                class="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                @click="openLogDetails(log.appId, log.id)"
              >
                <td class="px-8 py-5 text-sm text-gray-500">{{ log.create_time || '未知时间' }}</td>
                <td class="px-8 py-5">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span class="text-sm font-bold text-gray-900">{{ log.appName }}</span>
                  </div>
                </td>
                <td class="px-8 py-5 text-sm text-gray-900 max-w-xs truncate">
                  {{ log.abstract || '对话记录...' }}
                </td>
                <td class="px-8 py-5">
                  <span class="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">{{ log.tokens_num || 0 }}</span>
                </td>
                <td class="px-8 py-5">
                  <button class="p-2 bg-transparent rounded-lg transition-all text-gray-400 group-hover:text-blue-600 group-hover:bg-white group-hover:shadow-sm group-hover:border-gray-100 border border-transparent">
                    <ChevronRight class="w-4 h-4" />
                  </button>
                </td>
              </tr>
              <tr v-if="recentLogs.length === 0">
                 <td colspan="5" class="px-8 py-10 text-center text-gray-400 text-sm">今日暂无对话日志</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="p-6 bg-gray-50/30 text-center border-t border-gray-100">
          <button class="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
            查看所有历史日志
          </button>
        </div>
      </div>
    </div>

    <!-- Chat Log Viewer Drawer -->
    <ChatLogViewer 
      :is-open="showLogViewer"
      :app-id="selectedAppId"
      :session-id="selectedLogId"
      @close="showLogViewer = false"
    />
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
