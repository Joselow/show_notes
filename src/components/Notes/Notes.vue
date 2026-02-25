<script setup lang="ts">
import type { Note } from '../../interfaces';


const props = defineProps<{
  notes: Note[]
}>()


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const NOTE_TYPES = {
  '2': {
    label: 'Texto',
    color: 'bg-rose-400 dark:bg-rose-500/80 '
  },
  '1': {
    label: 'Audio',
    color: 'bg-green-500/90'
  }
}

</script>

<template>
  <div class="space-y-4">

    <div v-if="notes.length === 0" class="py-8 text-center ">
      <p class="text-gray-500 dark:text-gray-400 ">No hay notas disponibles</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="note in notes"
        :key="note.id"
        class="bg-white dark:bg-gray-800 rounded-xl border border-2 border-gray-200 dark:border-none
        px-3 py-1
        hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start mb-1">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ formatDate(note.createdAt) }}
          </span>
          <span class="text-xs px-4 py-1 rounded-full text-white" :class="NOTE_TYPES[note.type as keyof typeof NOTE_TYPES].color">
            {{ NOTE_TYPES[note.type as keyof typeof NOTE_TYPES].label }}
          </span>
        </div>
        <p class="text-gray-900 dark:text-white whitespace-pre-wrap">{{ note.content }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>