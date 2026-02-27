<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Shield, ShieldAlert, RefreshCw, Edit } from 'lucide-vue-next';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  allowedApps: string[];
}

interface Category {
  id: string;
  name: string;
  agents: { id: string; title: string }[];
}

const authStore = useAuthStore();
const users = ref<User[]>([]);
const availableCategories = ref<Category[]>([]);
const loading = ref(false);
const syncing = ref(false);
const error = ref<string | null>(null);

// Modal state
const showModal = ref(false);
const editingUser = ref<User | null>(null);
const selectedApps = ref<string[]>([]);

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await fetch('/api/users', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (data.success) {
      users.value = data.data;
    } else {
      error.value = data.error;
    }
  } catch (e) {
    error.value = 'Failed to fetch users';
  } finally {
    loading.value = false;
  }
};

const fetchApps = async () => {
  try {
    // 需要传递认证 token，管理员可以看到所有应用
    const res = await fetch('/api/maxkb/categories', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (data.success) {
      availableCategories.value = data.data;
    }
  } catch (e) {
    console.error('Failed to fetch apps', e);
  }
};

const syncUsers = async () => {
  syncing.value = true;
  try {
    const res = await fetch('/api/maxkb/sync-users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (data.success) {
      await fetchUsers();
    } else {
      alert('Sync failed: ' + data.error);
    }
  } catch (e) {
    alert('Sync failed');
  } finally {
    syncing.value = false;
  }
};

const toggleRole = async (user: User) => {
  const newRole = user.role === 'admin' ? 'user' : 'admin';
  if (!confirm(`确定要将 ${user.username} 的角色改为 ${newRole} 吗？`)) return;

  try {
    const res = await fetch(`/api/users/${user.id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ role: newRole })
    });
    const data = await res.json();
    if (data.success) {
      user.role = newRole;
    } else {
      alert('Failed to update role: ' + data.error);
    }
  } catch (e) {
    alert('Failed to update role');
  }
};

const openEditApps = (user: User) => {
  editingUser.value = user;
  selectedApps.value = [...user.allowedApps];
  showModal.value = true;
};

const saveApps = async () => {
  if (!editingUser.value) return;

  try {
    const res = await fetch(`/api/users/${editingUser.value.id}/apps`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ allowedApps: selectedApps.value })
    });
    const data = await res.json();
    if (data.success) {
      editingUser.value.allowedApps = selectedApps.value;
      showModal.value = false;
      editingUser.value = null;
    } else {
      alert('Failed to update apps: ' + data.error);
    }
  } catch (e) {
    alert('Failed to update apps');
  }
};

onMounted(() => {
  fetchUsers();
  fetchApps();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">用户管理</h1>
        <div class="flex gap-4">
          <button 
            @click="syncUsers" 
            :disabled="syncing"
            class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': syncing }" />
            {{ syncing ? '同步中...' : '从 MaxKB 同步用户' }}
          </button>
          <router-link to="/" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            返回首页
          </router-link>
        </div>
      </div>

      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">授权应用</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                      {{ user.username.charAt(0).toUpperCase() }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                      <div class="text-sm text-gray-500">{{ user.email || '无邮箱' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'"
                  >
                    {{ user.role === 'admin' ? '管理员' : '普通用户' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">
                    {{ user.role === 'admin' ? '全部应用 (管理员)' : `${user.allowedApps.length} 个应用` }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    @click="toggleRole(user)" 
                    class="text-indigo-600 hover:text-indigo-900 mr-4"
                    :title="user.role === 'admin' ? '设为普通用户' : '设为管理员'"
                  >
                    <ShieldAlert v-if="user.role === 'admin'" class="w-5 h-5" />
                    <Shield v-else class="w-5 h-5" />
                  </button>
                  <button 
                    @click="openEditApps(user)" 
                    class="text-blue-600 hover:text-blue-900"
                    title="编辑应用权限"
                    :disabled="user.role === 'admin'"
                    :class="{ 'opacity-50 cursor-not-allowed': user.role === 'admin' }"
                  >
                    <Edit class="w-5 h-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit Apps Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showModal = false"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  编辑 {{ editingUser?.username }} 的应用权限
                </h3>
                <div class="mt-4 max-h-96 overflow-y-auto border rounded p-4">
                  <div v-for="category in availableCategories" :key="category.id" class="mb-4">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">{{ category.name }}</h4>
                    <div class="grid grid-cols-2 gap-2">
                      <div v-for="agent in category.agents" :key="agent.id" class="flex items-center py-1">
                        <input 
                          type="checkbox" 
                          :id="agent.id" 
                          :value="agent.id" 
                          v-model="selectedApps"
                          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        >
                        <label :for="agent.id" class="ml-2 block text-sm text-gray-900 truncate">
                          {{ agent.title }}
                        </label>
                      </div>
                    </div>
                  </div>
                  <div v-if="availableCategories.length === 0" class="text-center text-gray-500 py-4">
                    暂无可用应用
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              @click="saveApps"
            >
              保存
            </button>
            <button 
              type="button" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              @click="showModal = false"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
