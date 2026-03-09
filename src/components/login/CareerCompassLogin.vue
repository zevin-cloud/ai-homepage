<script setup lang="ts">
import { ref } from 'vue';
import { Eye, EyeOff, Mail } from 'lucide-vue-next';
import AnimatedCharacters from './AnimatedCharacters.vue';
import InteractiveHoverButton from './InteractiveHoverButton.vue';

interface Props {
  username: string;
  password?: string;
  error?: string;
  loading?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:username', 'update:password', 'login', 'cas-login', 'oidc-login']);

const showPassword = ref(false);
const isTyping = ref(false);

const handleLogin = () => {
  emit('login');
};
</script>

<template>
  <div class="min-h-screen max-h-screen overflow-hidden grid lg:grid-cols-2 bg-background text-foreground transition-colors duration-500">
    <!-- Left Content Section with Animated Characters -->
    <div class="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 dark:from-white/10 dark:via-white/5 dark:to-transparent p-12 text-white overflow-hidden">
      <div class="relative z-20">
        <div class="flex items-center gap-2 text-lg font-semibold cursor-default">
          <img
            src="https://i.postimg.cc/nLrDYrHW/icon.png"
            alt="Logo"
            width="32"
            height="32"
            class="bg-white/10 backdrop-blur-sm p-1 rounded-lg"
          />
          <span class="text-white">AI Platform</span>
        </div>
      </div>

      <div class="relative z-20 flex items-end justify-center h-[500px]">
        <AnimatedCharacters
          :is-typing="isTyping"
          :show-password="showPassword"
          :password-length="password?.length || 0"
        />
      </div>

      <div class="relative z-20 flex items-center gap-8 text-sm text-white/60">
        <a href="#" class="hover:text-white transition-colors">隐私政策</a>
        <a href="#" class="hover:text-white transition-colors">服务条款</a>
      </div>

      <!-- Decorative elements -->
      <div class="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
      <div class="absolute top-1/4 right-1/4 size-64 bg-white/5 rounded-full blur-3xl" />
      <div class="absolute bottom-1/4 left-1/4 size-96 bg-white/5 rounded-full blur-3xl" />
    </div>

    <!-- Right Login Section -->
    <div class="flex items-center justify-center p-8">
      <div class="w-full max-w-[420px] animate-in fade-in slide-in-from-right-8 duration-700">
        <!-- Mobile Logo -->
        <div class="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
          <img
            src="https://i.postimg.cc/nLrDYrHW/icon.png"
            alt="Logo"
            width="32"
            height="32"
            class="dark:bg-white dark:p-1 dark:rounded-md"
          />
          <span>AI Platform</span>
        </div>

        <!-- Header -->
        <div class="text-center mb-10">
          <h1 class="text-3xl font-bold tracking-tight mb-2">
            欢迎回来
          </h1>
          <p class="text-muted-foreground text-sm">
            请输入您的凭据以登录系统
          </p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div class="space-y-2">
            <label for="username" class="text-sm font-medium">用户名 / 邮箱</label>
            <div class="relative">
              <input
                id="username"
                type="text"
                :value="username"
                placeholder="admin"
                autocomplete="off"
                class="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all border-border/60 focus:border-primary"
                @input="emit('update:username', ($event.target as HTMLInputElement).value)"
                @focus="isTyping = true"
                @blur="isTyping = false"
              />
              <Mail class="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/50" />
            </div>
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium">密码</label>
            <div class="relative">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                :value="password"
                placeholder="••••••••"
                class="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all border-border/60 focus:border-primary pr-10"
                @input="emit('update:password', ($event.target as HTMLInputElement).value)"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="size-5" />
                <Eye v-else class="size-5" />
              </button>
            </div>
          </div>

          <div v-if="error" class="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg animate-in shake duration-300">
            {{ error }}
          </div>

          <InteractiveHoverButton
            type="submit"
            :disabled="loading"
            class="w-full h-12 text-base font-medium mt-4 border-none shadow-lg shadow-primary/20"
          >
            {{ loading ? '验证中...' : '登录系统' }}
          </InteractiveHoverButton>
        </form>

        <!-- Social Login -->
        <div class="mt-8">
          <div class="relative mb-6">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t border-border/60"></span>
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-background px-2 text-muted-foreground font-medium tracking-wider">SSO 身份验证</span>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <button 
              type="button"
              class="flex items-center justify-center gap-2 h-11 rounded-xl border border-border/60 bg-background hover:bg-muted/50 transition-colors text-sm font-medium"
              @click="emit('cas-login')"
            >
              CAS 登录
            </button>
            <button 
              type="button"
              class="flex items-center justify-center gap-2 h-11 rounded-xl border border-border/60 bg-background hover:bg-muted/50 transition-colors text-sm font-medium"
              @click="emit('oidc-login')"
            >
              OIDC 登录
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shake {
  animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
