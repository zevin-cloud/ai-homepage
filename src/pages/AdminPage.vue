<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Shield, ShieldAlert, RefreshCw, Edit, Key, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-vue-next';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  allowedApps: string[];
  createdAt?: string;
}

interface Category {
  id: string;
  name: string;
  agents: { id: string; title: string }[];
}

type SortField = 'username' | 'email' | 'role' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const authStore = useAuthStore();
const users = ref<User[]>([]);
const availableCategories = ref<Category[]>([]);
const loading = ref(false);
const syncing = ref(false);
const error = ref<string | null>(null);

// 搜索和分页状态
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const sortField = ref<SortField>('username');
const sortOrder = ref<SortOrder>('asc');

const showModal = ref(false);
const editingUser = ref<User | null>(null);
const selectedApps = ref<string[]>([]);

const showPasswordModal = ref(false);
const passwordUserId = ref('');
const passwordUsername = ref('');
const newPassword = ref('');
const passwordLoading = ref(false);

// 过滤和排序后的用户列表
const filteredUsers = computed(() => {
  let result = users.value;

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(user => 
      user.username.toLowerCase().includes(query) ||
      (user.email && user.email.toLowerCase().includes(query))
    );
  }

  // 排序
  result = [...result].sort((a, b) => {
    let aValue: string | number = '';
    let bValue: string | number = '';

    switch (sortField.value) {
      case 'username':
        aValue = a.username.toLowerCase();
        bValue = b.username.toLowerCase();
        break;
      case 'email':
        aValue = (a.email || '').toLowerCase();
        bValue = (b.email || '').toLowerCase();
        break;
      case 'role':
        aValue = a.role;
        bValue = b.role;
        break;
      case 'createdAt':
        aValue = a.createdAt || '';
        bValue = b.createdAt || '';
        break;
    }

    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });

  return result;
});

// 分页后的用户列表
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredUsers.value.slice(start, end);
});

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / pageSize.value) || 1;
});

// 分页按钮列表
const pageNumbers = computed(() => {
  const pages: (number | string)[] = [];
  const maxVisible = 5;
  
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage.value <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages.value);
    } else if (currentPage.value >= totalPages.value - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages.value - 3; i <= totalPages.value; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages.value);
    }
  }
  
  return pages;
});

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

const openPasswordModal = (user: User) => {
  passwordUserId.value = user.id;
  passwordUsername.value = user.username;
  newPassword.value = '';
  showPasswordModal.value = true;
};

const resetPassword = async () => {
  if (!newPassword.value || newPassword.value.length < 6) {
    alert('密码长度至少6位');
    return;
  }
  
  passwordLoading.value = true;
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        userId: passwordUserId.value,
        newPassword: newPassword.value
      })
    });
    const data = await res.json();
    if (data.success) {
      alert('密码重置成功');
      showPasswordModal.value = false;
    } else {
      alert('重置失败: ' + data.error);
    }
  } catch (e) {
    alert('重置失败');
  } finally {
    passwordLoading.value = false;
  }
};

// 切换排序
const toggleSort = (field: SortField) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
};

// 跳转到指定页
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
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

      <!-- 搜索和工具栏 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div class="flex flex-wrap gap-4 items-center justify-between">
          <!-- 搜索框 -->
          <div class="flex-1 min-w-[300px]">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                placeholder="搜索用户名或邮箱..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <!-- 每页显示数量 -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">每页显示:</span>
            <select
              v-model="pageSize"
              @change="currentPage = 1"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="mt-4 text-sm text-gray-600">
          共 {{ filteredUsers.length }} 位用户
          <span v-if="searchQuery">（搜索 "{{ searchQuery }}"）</span>
        </div>
      </div>

      <!-- 用户列表 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th 
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  @click="toggleSort('username')"
                >
                  <div class="flex items-center gap-1">
                    用户
                    <span v-if="sortField === 'username'">
                      <ChevronUp v-if="sortOrder === 'asc'" class="w-4 h-4" />
                      <ChevronDown v-else class="w-4 h-4" />
                    </span>
                  </div>
                </th>
                <th 
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  @click="toggleSort('email')"
                >
                  <div class="flex items-center gap-1">
                    邮箱
                    <span v-if="sortField === 'email'">
                      <ChevronUp v-if="sortOrder === 'asc'" class="w-4 h-4" />
                      <ChevronDown v-else class="w-4 h-4" />
                    </span>
                  </div>
                </th>
                <th 
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  @click="toggleSort('role')"
                >
                  <div class="flex items-center gap-1">
                    角色
                    <span v-if="sortField === 'role'">
                      <ChevronUp v-if="sortOrder === 'asc'" class="w-4 h-4" />
                      <ChevronDown v-else class="w-4 h-4" />
                    </span>
                  </div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  授权应用
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                      {{ user.username.charAt(0).toUpperCase() }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ user.email || '无邮箱' }}</div>
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
                    v-if="!user.id.startsWith('cas-') && !user.id.startsWith('maxkb-')"
                    @click="openPasswordModal(user)" 
                    class="text-green-600 hover:text-green-900 mr-4"
                    title="重置密码"
                  >
                    <Key class="w-5 h-5" />
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
              <tr v-if="paginatedUsers.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                  <div v-if="loading" class="flex items-center justify-center gap-2">
                    <RefreshCw class="w-5 h-5 animate-spin" />
                    加载中...
                  </div>
                  <div v-else>
                    没有找到匹配的用户
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-600">
              显示第 {{ (currentPage - 1) * pageSize + 1 }} - 
              {{ Math.min(currentPage * pageSize, filteredUsers.length) }} 条，
              共 {{ filteredUsers.length }} 条
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft class="w-5 h-5" />
              </button>
              
              <template v-for="page in pageNumbers" :key="page">
                <button
                  v-if="page !== '...'"
                  @click="goToPage(page as number)"
                  class="px-4 py-2 rounded-lg border transition-colors"
                  :class="currentPage === page 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'border-gray-300 hover:bg-gray-100 text-gray-700'"
                >
                  {{ page }}
                </button>
                <span v-else class="px-2 text-gray-500">...</span>
              </template>
              
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight class="w-5 h-5" />
              </button>
            </div>
          </div>
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

    <!-- Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showPasswordModal = false"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  重置 {{ passwordUsername }} 的密码
                </h3>
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                  <input 
                    v-model="newPassword"
                    type="password" 
                    placeholder="请输入新密码（至少6位）"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              @click="resetPassword"
              :disabled="passwordLoading"
            >
              {{ passwordLoading ? '处理中...' : '确认重置' }}
            </button>
            <button 
              type="button" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              @click="showPasswordModal = false"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
