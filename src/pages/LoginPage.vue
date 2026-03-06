<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLocalLogin = async () => {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const res = await fetch('/api/auth/local-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    });
    
    const data = await res.json();
    
    if (data.success) {
      window.location.href = `/login/callback?token=${data.token}`;
    } else {
      error.value = data.error || '登录失败';
    }
  } catch (e) {
    error.value = '登录失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

const handleCasLogin = () => {
  window.location.href = '/api/auth/cas/login';
};

const handleOidcLogin = () => {
  window.location.href = '/api/auth/login';
};
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#020202] font-sans selection:bg-primary/40">
    <!-- 1. 核心流光背景层 -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <!-- 动态变幻的流光 -->
      <div class="moving-glow absolute inset-0 opacity-70 scale-125"></div>
      
      <!-- 模拟截图中的巨大发光 Logo 效果 (左侧圆盘) -->
      <div class="absolute -left-[10%] top-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-500/20 blur-[120px] animate-pulse-slow"></div>
      
      <!-- 超强磨砂模糊层 -->
      <div class="absolute inset-0 backdrop-blur-[140px]"></div>
      
      <!-- 2. 极致颗粒噪点层 (对标截图的粒子效果) -->
      <div class="absolute inset-0 opacity-[0.25] mix-blend-overlay noise-overlay"></div>
      
      <!-- 顶部环境光 -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)]"></div>
    </div>

    <!-- 3. 主布局内容 -->
    <div class="relative z-10 w-full max-w-[1400px] mx-auto px-10 md:px-20 flex flex-col lg:flex-row items-center justify-between gap-16">
      
      <!-- 左侧：完全复刻截图 Slogan -->
      <div class="flex-1 text-left hidden lg:block animate-fade-in-up">
        <div class="inline-flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-10">
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-1">人工智能应用基座</span>
        </div>
        
        <h1 class="text-[5.5rem] xl:text-[6.8rem] font-bold text-white leading-[1.05] tracking-tighter mb-12">
          承载 AI 应用，<br />
          管理数字资产，<br />
          连接 <span class="gradient-text">未来.</span>
        </h1>
        
        <div class="flex items-center gap-6 mt-16 opacity-80">
          <div class="h-px w-14 bg-white/20"></div>
          <p class="text-xl text-gray-400 max-w-lg font-light leading-relaxed">
            承载所有 AI 应用，管理你的数字资产，连接未来的统一基础设施平台。快速部署，轻松扩展。
          </p>
        </div>
      </div>

      <!-- 右侧：极致精简登录框 (靠右对齐) -->
      <div class="w-full max-w-[360px] lg:max-w-[320px] lg:mr-6 animate-fade-in mx-auto lg:mx-0" style="animation-delay: 0.2s">
        <div class="bg-[#0a0a0a]/30 backdrop-blur-[40px] border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] p-6 lg:p-8 relative overflow-hidden">
          <!-- 顶部装饰线 -->
          <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          
          <div class="mb-10">
            <h2 class="text-xl font-bold text-white tracking-tight">欢迎回来</h2>
            <p class="text-gray-300 text-[11px] mt-2 font-medium">请登录以管理您的 AI 基础设施</p>
          </div>
          
          <form @submit.prevent="handleLocalLogin" class="space-y-4">
            <div class="group relative">
              <input 
                v-model="username"
                type="text" 
                placeholder="用户名"
                class="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-gray-500 text-sm focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all group-hover:bg-white/[0.06]"
              />
            </div>
            
            <div class="group relative">
              <input 
                v-model="password"
                type="password" 
                placeholder="密码"
                class="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-gray-500 text-sm focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all group-hover:bg-white/[0.06]"
              />
            </div>
            
            <div v-if="error" class="text-red-400 text-[10px] text-center py-2 bg-red-400/5 border border-red-400/10 rounded-xl animate-shake">
              {{ error }}
            </div>
            
            <button 
              type="submit"
              :disabled="loading"
              class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
            >
              {{ loading ? '验证中...' : '登录系统' }}
            </button>
          </form>
          
          <!-- 第三方登录 -->
          <div class="mt-10">
            <div class="flex items-center gap-3 mb-6">
              <div class="h-px flex-1 bg-white/5"></div>
              <span class="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">SSO Auth</span>
              <div class="h-px flex-1 bg-white/5"></div>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <button @click="handleCasLogin" class="sso-btn">CAS登录</button>
              <button @click="handleOidcLogin" class="sso-btn">OIDC登录</button>
            </div>
          </div>
        </div>
        
        <div class="mt-8 flex flex-col items-center gap-4 opacity-40">
          <p class="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">New API AI Gateway Project</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 极致粒子噪点实现 */
.noise-overlay {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* 核心背景动画 (更鲜艳、更动态) */
@keyframes glow-move {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.moving-glow {
  animation: glow-move 12s ease-in-out infinite;
  background-image: linear-gradient(
    -45deg, 
    #00f2ff 0%, 
    #b026ff 25%, 
    #ff2d55 50%, 
    #007aff 75%,
    #00f2ff 100%
  );
  background-size: 400% 400%;
  filter: saturate(2.5);
}

/* 截图中的 未来. 渐变文本 */
.gradient-text {
  background: linear-gradient(to right, #fb7185, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

.sso-btn {
  @apply flex items-center justify-center bg-white/[0.02] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 text-gray-300 text-[10px] font-bold py-2.5 px-3 rounded-xl transition-all active:scale-95;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.animate-pulse-slow {
  animation: pulse-slow 8s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.animate-shake {
  animation: shake 0.3s ease-in-out;
}

/* 强制 Inter 字体或类似系统字体以对标质感 */
:deep(*) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
</style>
