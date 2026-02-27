<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  const token = route.query.token as string;
  
  if (token) {
    authStore.setToken(token);
    await authStore.fetchUser();
    router.push('/');
  } else {
    router.push('/login');
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center">
      <p class="text-xl text-gray-600">Authenticating...</p>
    </div>
  </div>
</template>
