<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Welcome to AI Homepage</h2>
      <p class="text-gray-600 mb-8">Please sign in to access your AI assistants.</p>
      
      <div class="space-y-4">
        <a 
          href="/api/auth/dev-login"
          class="block w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
        >
          Dev Login (Test Mode)
        </a>

        <a 
          href="/api/auth/login"
          class="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
        >
          Sign in with OIDC
        </a>

        <a 
          href="/api/auth/cas/login"
          class="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
        >
          Sign in with CAS
        </a>
      </div>
      
      <p class="mt-6 text-xs text-gray-500">
        Note: OIDC and CAS require valid server configuration.
      </p>
    </div>
  </div>
</template>
