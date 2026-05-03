<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

import Loader from '../../components/Loader.vue'

import { useNotes } from '../../composables/useNotes'

import type { CreateNoteBody, Note, NoteCategory, NoteTypeName } from '../../interfaces'

import {
  categoryLabel,
  isTaskNote,
  NOTE_CATEGORIES,
  parseNoteCategory,
  typeLabel,
} from '../../utils/noteHelpers'

const { deleteNote, loading } = useNotes()
const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  note: Note | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  create: [payload: CreateNoteBody]
  'save-content': [id: string, content: string, category: NoteCategory, isCompleted?: boolean]
  'delete-note': [id: string]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const draftContent = ref('')
const createType = ref<NoteTypeName>('text')
const createCategory = ref<NoteCategory>('apunte')
const createCompleted = ref(false)
const editCategory = ref<NoteCategory>('apunte')
const editCompleted = ref(false)

const formatMetaDate = (iso: string) =>
  new Date(iso).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

function resetCreateDrafts() {
  draftContent.value = ''
  createType.value = 'text'
  createCategory.value = 'apunte'
  createCompleted.value = false
}

watch(
  () => [props.open, props.mode, props.note] as const,
  ([open, mode, note]) => {
    if (!open) return
    if (mode === 'edit' && note) {
      draftContent.value = note.content
      editCategory.value = parseNoteCategory(note.category)
      editCompleted.value = note.is_completed
    }
    if (mode === 'create') {
      resetCreateDrafts()
    }
    nextTick(() => textareaRef.value?.focus())
  },
)

watch(
  () => props.note?.content,
  (c) => {
    if (props.open && props.mode === 'edit' && props.note && c !== undefined) {
      draftContent.value = c
    }
  },
)

watch(createCategory, (c) => {
  if (c !== 'task') createCompleted.value = false
})

watch(editCategory, (c) => {
  if (!isTaskNote(c)) editCompleted.value = false
})

function close() {
  emit('update:open', false)
}

function onBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).dataset?.backdrop === 'true') close()
}

function submitCreate() {
  const body: CreateNoteBody = {
    type: createType.value,
    content: draftContent.value.trim(),
    category: createCategory.value,
  }
  if (createCategory.value === 'task') {
    body.is_completed = createCompleted.value
  }
  emit('create', body)
}

function submitEditContent() {
  if (!props.note) return
  const completedArg = isTaskNote(editCategory.value) ? editCompleted.value : undefined
  emit('save-content', props.note.id, draftContent.value, editCategory.value, completedArg)
}

const showTaskSwitchCreate = () =>
  props.mode === 'create' && createCategory.value === 'task'

const showTaskSwitchEdit = () =>
  props.mode === 'edit' && props.note && isTaskNote(editCategory.value)

const handleDeleteNote = async () => {
  if (!props.note || !props.note.id) return

  const confirmed = confirm('¿Estás seguro de querer eliminar esta nota?')
  if (!confirmed) return

  const success = await deleteNote(props.note.id)
  if (success) {
    close()
    emit('delete-note', props.note.id)
  }
}
</script>

<template>
  <Loader v-if="loading" />
  <Teleport to="body">
    <div
      v-show="open"
      class="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center p-0 sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        data-backdrop="true"
        class="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]"
        @click="onBackdropClick"
      />
      <div
        class="relative z-[1] flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white shadow-xl border-0 border-zinc-200/80 dark:border-zinc-700 dark:bg-zinc-900 sm:max-h-[90vh] sm:max-w-lg sm:flex-none sm:rounded-2xl sm:border h-[100dvh] max-h-[100dvh] sm:h-auto rounded-none"
        @click.stop
      >
        <header
          class="flex shrink-0 items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800 sm:py-3"
        >
          <h2 class="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {{ mode === 'create' ? 'Nueva nota' : 'Editar nota' }}
          </h2>
          <button
            type="button"
            class="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Cerrar"
            @click="close"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        <div
          class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3 sm:gap-4 sm:py-4"
        >
          <label class="flex min-h-0 flex-1 flex-col gap-1">
            <span class="sr-only">Contenido</span>
            <textarea
              ref="textareaRef"
              v-model="draftContent"
              rows="6"
              class="min-h-[12rem] w-full flex-1 resize-y rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 sm:min-h-[10rem]"
              placeholder="Escribe aquí…"
            />
          </label>

          <template v-if="mode === 'create'">
            <div class="grid shrink-0 grid-cols-2 gap-3">
              <label class="block text-xs text-zinc-500 dark:text-zinc-400">
                Tipo
                <select
                  v-model="createType"
                  class="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  <option value="text">Texto</option>
                  <option value="audio">Audio</option>
                </select>
              </label>
              <label class="block text-xs text-zinc-500 dark:text-zinc-400">
                Categoría
                <select
                  v-model="createCategory"
                  class="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  <option v-for="c in NOTE_CATEGORIES" :key="c" :value="c">
                    {{ categoryLabel(c) }}
                  </option>
                </select>
              </label>
            </div>

            <div
              v-if="showTaskSwitchCreate()"
              class="flex shrink-0 items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800"
            >
              <span class=" text-sm text-zinc-700 dark:text-zinc-300">Completada</span>
              <button
                type="button"
                class="relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                :class="
                  createCompleted
                    ? 'bg-rose-600'
                    : 'bg-zinc-200 dark:bg-zinc-700'
                "
                role="switch"
                :aria-checked="createCompleted"
                @click="createCompleted = !createCompleted"
              >
                <span
                  class="pointer-events-none absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200"
                  :class="createCompleted ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>
          </template>

          <template v-else-if="note">
            <div
              class="shrink-0 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800 sm:border-t-0 sm:pt-0"
            >
              <p class="text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">
                {{ formatMetaDate(note.createdAt) }}
                <span class="capitalize"> · {{ note.origin }}</span>
                <span class="text-zinc-400 dark:text-zinc-500">
                  · {{ typeLabel(note.type) }}</span
                >
              </p>
              <div class="flex flex-wrap items-end gap-2 sm:gap-3">
                <label
                  class="min-w-0 flex-1 text-xs text-zinc-500 dark:text-zinc-400 sm:max-w-[14rem]"
                >
                  Categoría
                  <select
                    v-model="editCategory"
                    class="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  >
                    <option v-for="c in NOTE_CATEGORIES" :key="c" :value="c">
                      {{ categoryLabel(c) }}
                    </option>
                  </select>
                </label>

                <div
                  v-if="showTaskSwitchEdit()"
                  class="flex-1 flex justify-around shrink-0 items-center gap-2 rounded-lg border border-zinc-100 px-2 py-1.5 dark:border-zinc-800"
                >
                  <span class="text-xs text-zinc-600 dark:text-zinc-400">Completada</span>
                  <button
                    type="button"
                    class="relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 dark:focus:ring-offset-zinc-900"
                    :class="
                      editCompleted ? 'bg-rose-600' : 'bg-zinc-200 dark:bg-zinc-700'
                    "
                    role="switch"
                    :aria-checked="editCompleted"
                    @click="editCompleted = !editCompleted"
                  >
                    <span
                      class="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
                      :class="editCompleted ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <footer
          class="flex shrink-0 justify-between gap-2 border-t border-zinc-100 bg-zinc-50/50 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-zinc-800 dark:bg-zinc-950/50 sm:pb-3"
        >
        <div>
          <button 
            v-if="note && note.id"
            type="button"
            class="bg-red-500/60 text-white rounded-lg px-3 py-2 text-sm hover:bg-red-500/80"
            @click="handleDeleteNote"
          >
            Eliminar
          </button>
        </div>
        <div class="flex shrink-0 justify-end gap-2 ">
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            @click="close"
          >
            Cerrar
          </button>
          <button
            v-if="mode === 'create'"
            type="button"
            :disabled="!draftContent.trim()"
            class="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            @click="submitCreate"
          >
            Crear
          </button>
          <button
            v-else
            type="button"
            class="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            @click="submitEditContent"
          >
            Guardar
          </button>
        </div>
        </footer>
      </div>
    </div>
  </Teleport>
</template>
