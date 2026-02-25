<script setup lang="ts">
import { ref } from 'vue'

import Loader from './components/Loader.vue'

import { useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'

import { getAuthToken } from './utils/cookies'

const router = useRouter()

const { fetchMe } = useAuth()

const isInitializing = ref(true)

const checkAuth = async () => {
  const token = getAuthToken()

  if (!token) {
      isInitializing.value = false
    return router.push({ name: 'login' })
  }

  const success = await fetchMe()
  isInitializing.value = false

  if (!success) {
    router.push({ name: 'login' })
  }
}

checkAuth()

</script>

<template>
  <div v-if="isInitializing" class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
   <Loader />
  </div>
  
  <router-view v-else />
</template>

<style scoped>
</style>
