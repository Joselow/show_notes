<script setup lang="ts">
import { ref, computed, watch } from 'vue'

import Header from '../components/Header.vue'
import NotesList from '../components/Notes/Notes.vue'
import NoteModal from '../components/Notes/NoteModal.vue'
import Loader from '../components/Loader.vue'

import { useAuth } from '../composables/useAuth'
import { useNotes, type NotesRange } from '../components/useNotes'
import type { CreateNoteBody, Note, NoteCategory } from '../interfaces'

const { logout } = useAuth()
const { notes, loading, error, fetchNotes, createNote, updateNote } = useNotes()

const today = new Date().toISOString().split('T')[0] as string
const dateStart = ref<string>(today)
const dateEnd = ref<string>(today)

const range = computed((): NotesRange => ({
  date_start: dateStart.value,
  date_end: dateEnd.value,
}))

const handleLogout = async () => {
  await logout()
}

const requestNotes = () => fetchNotes(range.value)

requestNotes()

const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedNote = ref<Note | null>(null)

function openCreate() {
  modalMode.value = 'create'
  selectedNote.value = null
  modalOpen.value = true
}

function openEdit(note: Note) {
  modalMode.value = 'edit'
  selectedNote.value = note
  modalOpen.value = true
}

watch(
  () => [notes.value, modalOpen.value, selectedNote.value?.id] as const,
  () => {
    if (!modalOpen.value || !selectedNote.value) return
    const fresh = notes.value.find((n) => n.id === selectedNote.value!.id)
    if (fresh) selectedNote.value = fresh
  },
  { deep: true },
)

async function onCreate(payload: CreateNoteBody) {
  const text = payload.content?.trim()
  if (!text) return
  try {
    await createNote({ ...payload, content: text }, range.value)
    modalOpen.value = false
  } catch {
    /* useNotes.error */
  }
}

async function onSaveContent(
  id: string,
  content: string,
  category?: NoteCategory,
  is_completed?: boolean,
) {
  try {
    await updateNote(
      id,
      {
        content,
        ...(category !== undefined ? { category } : {}),
        ...(is_completed !== undefined ? { is_completed } : {}),
      },
      range.value,
    )
    modalOpen.value = false
  } catch {
    /* useNotes.error */
  }
}

async function patchCompleted(id: string, value: boolean) {
  try {
    await updateNote(id, { is_completed: value }, range.value)
  } catch {
    /* useNotes.error */
  }
}
</script>

<template>
  <div class="min-h-screen w-full transition-colors max-w-2xl mx-auto">
    <Header @logout="handleLogout" />

    <main class="p-6">
      <div class="mb-6 space-y-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Mis Notas</h1>
          <button
            type="button"
            class="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            @click="openCreate"
          >
            Nueva nota
          </button>
        </div>

        <div class="flex flex-wrap items-end gap-3">
          <label class="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            Desde
            <input
              v-model="dateStart"
              type="date"
              class="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100"
              @change="requestNotes"
            />
          </label>
          <label class="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            Hasta
            <input
              v-model="dateEnd"
              type="date"
              class="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100"
              @change="requestNotes"
            />
          </label>
          <button
            type="button"
            class="cursor-pointer rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Actualizar notas"
            @click="requestNotes"
          >
            <svg
              class="h-5 w-5 text-zinc-600 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

        <div class="flex items-center justify-between text-gray-600 dark:text-gray-400">
          <span class="font-semibold text-zinc-800 dark:text-zinc-200">
            {{ notes.length }} notas registradas
          </span>
          <span class="text-xl inline-block" v-show="notes.length">
            😁
          </span>
        </div>
      </div>

      <div v-if="loading">
        <Loader />
      </div>

      <template v-else-if="!notes.length">
        <p class="text-center text-lg text-zinc-500 dark:text-zinc-400">No hay notas disponibles 😌</p>
      </template>

      <template v-else>
        <NotesList
          :notes="notes"
          @open-note="openEdit"
          @toggle-completed="patchCompleted"
        />
      </template>
    </main>

    <NoteModal
      :open="modalOpen"
      :mode="modalMode"
      :note="selectedNote"
      @update:open="modalOpen = $event"
      @create="onCreate"
      @save-content="onSaveContent"
    />
  </div>
</template>
