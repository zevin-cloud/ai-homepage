<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MessageSquare, X, User, Bot, Clock, Hash, Zap } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { computed, watch } from 'vue';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  create_time?: string;
  tokens_num?: number;
}

const props = defineProps<{
  isOpen: boolean;
  appId?: string;
  sessionId?: string;
}>();

const emit = defineEmits(['close']);
const authStore = useAuthStore();
const loading = ref(false);
const messages = ref<Message[]>([]);

const fetchMessages = async (appId: string, sessionId: string) => {
  loading.value = true;
  messages.value = [];
  try {
    const res = await fetch(`/api/analytics/app/${appId}/logs/${sessionId}?page=1&size=50`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (data.success && data.data && Array.isArray(data.data)) {
        // MaxKB 返回的单条记录中包含 content 和 role，这里直接映射
        messages.value = data.data.map((msg: any) => ({
            role: msg.role === 'ai' ? 'assistant' : 'user', // 有时后端是 ai 有时是 user
            content: msg.content,
            create_time: msg.create_time,
            tokens_num: msg.tokens_num
        }));
    }
  } catch (error) {
    console.error('Failed to load messages', error);
  }
  loading.value = false;
};

watch(() => props.isOpen, (newVal) => {
    if(newVal && props.appId && props.sessionId) {
        fetchMessages(props.appId, props.sessionId);
    }
});

const totalTokens = computed(() => {
    return messages.value.reduce((acc, msg) => acc + (msg.tokens_num || 0), 0);
});

</script>

<template>

  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-x-full"
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 translate-x-full"
  >
    <div v-if="isOpen" class="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white shadow-2xl z-[100] flex flex-col border-l border-gray-100">
      <!-- Header -->
      <div class="h-20 px-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
        <div class="flex flex-col">
          <h3 class="font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare class="w-5 h-5 text-blue-600" />
            对话细节审计
          </h3>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wider mt-0.5">Session: {{ sessionId || 'NEW_SESSION' }}</p>
        </div>
        <button 
          @click="$emit('close')"
          class="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-200"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-8 bg-white custom-scrollbar">
        <div v-for="(msg, idx) in messages" :key="idx" class="flex flex-col gap-3">
          <div :class="['flex items-center gap-2', msg.role === 'user' ? 'flex-row-reverse' : '']">
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm', msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600']">
              <User v-if="msg.role === 'user'" class="w-4 h-4" />
              <Bot v-else class="w-4 h-4" />
            </div>
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ msg.role === 'user' ? 'User' : 'Assistant' }}</span>
          </div>
          
          <div :class="['max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm', 
            msg.role === 'user' ? 'bg-blue-50 text-blue-900 self-end rounded-tr-none' : 'bg-gray-50 text-gray-800 self-start rounded-tl-none border border-gray-100']">
            {{ msg.content }}
          </div>
          
          <div :class="['text-[10px] text-gray-300 flex items-center gap-1', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <Clock class="w-3 h-3" />
            {{ msg.create_time }}
          </div>
        </div>

        <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
          <div class="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Conversation...</span>
        </div>
      </div>

      <!-- Footer Stats -->
      <div class="p-6 border-t border-gray-100 bg-gray-50/50 grid grid-cols-2 gap-4">
        <div class="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex items-center gap-2 text-gray-400 mb-1">
            <Zap class="w-4 h-4" />
            <span class="text-[10px] font-bold uppercase tracking-widest">Tokens</span>
          </div>
          <div class="text-xl font-black text-gray-900">{{ totalTokens.toLocaleString() }}</div>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex items-center gap-2 text-gray-400 mb-1">
            <Hash class="w-4 h-4" />
            <span class="text-[10px] font-bold uppercase tracking-widest">Messages</span>
          </div>
          <div class="text-xl font-black text-gray-900">{{ messages.length }}</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #f1f1f1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #e5e7eb;
}
</style>
