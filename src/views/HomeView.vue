<script setup lang="ts">
import { ref } from 'vue'

import Header from '../components/Header.vue'
import NotesList from '../components/Notes/Notes.vue'
import Loader from '../components/Loader.vue'

import { useAuth } from '../composables/useAuth'
import { useNotes } from '../components/useNotes'

const { logout } = useAuth()
const { notes, loading, fetchNotes } = useNotes()

const handleLogout = async () => {
  await logout()
}

const today = ref(new Date().toISOString().split('T')[0])


const requestNotes = async () => {
  fetchNotes(today.value)
}

requestNotes()

</script>

<template>
  <div class="min-h-screen w-full transition-colors max-w-2xl mx-auto">
    <Header @logout="handleLogout" />
    
    <main class="p-6">
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mis Notas
          </h1>

          <div>
            <input id="date" v-model="today" type="date" @change="(e) => requestNotes()">
          </div>
        </div>

        <div class="flex items-center justify-between">
          <p class="text-gray-600 dark:text-gray-400">
            <span class="font-bold">
              {{  notes.length  }} 
              notas registradas
            </span>

            <span class="text-xl inline-block" v-show="notes.length">
              😁
            </span>
          </p>
           <button
            @click="() => requestNotes()"
            class="cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Actualizar notas"
          >
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="loading" >
        <Loader />
      </div>

      <template v-if="!notes.length">
        <p class="text-gray-500 dark:text-gray-400 text-center text-xl">No hay notas disponibles 😌</p> 
      </template>
      <template v-else>
        <NotesList 
          :notes="notes"
        />
      </template>
    </main>
  </div>
</template>

<style scoped>
</style>
