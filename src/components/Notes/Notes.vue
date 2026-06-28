<script setup lang="ts">
import type { Note } from '../../interfaces'
import {
  categoryLabel,
  isAudioNote,
  isTaskNote,
  typeLabel,
} from '../../utils/noteHelpers'
import { useNoteLongPress } from '../../composables/useNoteLongPress'
import NotePressReveal from './NotePressReveal.vue'

defineProps<{
  notes: Note[]
}>()

const emit = defineEmits<{
  'open-note': [note: Note]
  'toggle-completed': [id: string, value: boolean]
}>()

const { progress, originX, originY, start, cancel, onTouchMove, isCardActive } =
  useNoteLongPress((note) => emit('open-note', note))

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

const CATEGORY_BADGE: Record<string, string> = {
  task: 'bg-amber-100 text-amber-900 dark:bg-amber-900/35 dark:text-amber-100',
  frase: 'bg-sky-100 text-sky-900 dark:bg-sky-900/35 dark:text-sky-100',
  por_estudiar:
    'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/35 dark:text-emerald-100',
  apunte: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
  aprendizaje:
    'bg-violet-100 text-violet-900 dark:bg-violet-900/35 dark:text-violet-100',
}

const TYPE_BADGE: Record<'audio' | 'text', string> = {
  text: ' text-white bg-rose-400 dark:bg-rose-500/80',
  audio: 'text-white bg-green-500/90',
}

function badgeClass(category: string | undefined) {
  const k = (category ?? 'apunte').toLowerCase()
  return CATEGORY_BADGE[k] ?? CATEGORY_BADGE.apunte
}

function categoryBadgeClass(category: string | undefined) {
  return [
    badgeClass(category),
    'font-semibold ring-1 ring-violet-500/30 shadow-sm dark:ring-violet-400/25',
  ]
}

function typeBadgeClass(note: Note) {
  return isAudioNote(note.type) ? TYPE_BADGE.audio : TYPE_BADGE.text
}

function onPressStart(note: Note, e: MouseEvent | TouchEvent) {
  start(note, e.currentTarget as HTMLElement, e)
}

function toggleComplete(note: Note, e: Event) {
  e.stopPropagation()
  emit('toggle-completed', note.id, !note.is_completed)
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="notes.length === 0" class="py-8 text-center">
      <p class="text-gray-500 dark:text-gray-400">No hay notas disponibles</p>
    </div>

    <div v-else class="space-y-3">
      <article
        v-for="note in notes"
        :key="note.id"
        class="overflow-hidden rounded-xl border border-2 border-gray-200 bg-white px-3 py-1 transition-shadow select-none hover:shadow-md dark:border-none dark:bg-gray-800"
        :class="
          isCardActive(note.id)
            ? 'ring-1 ring-violet-400/40 shadow-md dark:ring-violet-400/30'
            : ''
        "
        @mousedown="onPressStart(note, $event)"
        @mouseup="cancel"
        @mouseleave="cancel"
        @touchstart.passive="onPressStart(note, $event)"
        @touchend="cancel"
        @touchmove.passive="onTouchMove"
        @touchcancel="cancel"
      >
        <NotePressReveal
          :active="isCardActive(note.id)"
          :progress="isCardActive(note.id) ? progress : 0"
          :origin-x="originX"
          :origin-y="originY"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
                <time class="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">{{
                  formatDate(note.createdAt)
                }}</time>
                <div class="flex gap-2">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="typeBadgeClass(note)"
                  >
                    {{ typeLabel(note.type) }}
                  </span>
                  <span
                    class="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="categoryBadgeClass(note.category)"
                  >
                    {{ categoryLabel(note.category) }}
                  </span>
                </div>
              </div>
              <p
                class="line-clamp-3 whitespace-pre-wrap leading-relaxed text-zinc-900 dark:text-zinc-100"
              >
                {{ note.content }}
              </p>
            </div>

            <div class="ms-3 flex shrink-0 flex-col items-end gap-2">
              <button
                type="button"
                class="text-sm text-gray-800 hover:underline dark:text-gray-300"
                @mousedown.stop
                @touchstart.stop
                @click.stop="emit('open-note', note)"
              >
                <svg
                  class="text-zinc-600 dark:text-white"
                  fill="currentColor"
                  height="20px"
                  width="20px"
                  viewBox="0 0 487.087 487.087"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M262.276,112.466c12.439,0,22.524,10.085,22.524,22.525l0.018,172.322c0,1.996,1.617,3.613,3.613,3.613 c1.993,0,3.61-1.617,3.61-3.613l-0.007-0.933c0-11.326,11.005-19.231,22.326-19.231c12.441,0,22.478,10.085,22.478,22.524 l0.045,16.509c0,1.941,1.574,3.515,3.516,3.515c1.941,0,3.514-1.574,3.514-3.515l-0.013-1.257c0-10.3,11.146-18.197,22.106-18.197 c12.439,0,22.524,10.085,22.524,22.524l0.072,41.382c0,38.488-14.968,96.452-107.11,96.452 c-109.814,0-124.456-55.665-122.769-115.646c0.407-14.466,12.844-23.01,23.01-23.01v26.53c0,3.337,2.314,3.725,3.004,3.725 c0.69,0,2.927-0.379,2.927-3.717c0-3.221,0-167.638,0-167.638c0-12.439,10.084-22.524,22.524-22.524 c11.414,0,22.316,6.981,22.316,19.501c0.008,0.042-0.083,107.421-0.083,107.421c0,2.026,1.643,3.668,3.668,3.668 c2.025,0,3.668-1.642,3.668-3.668V134.618C239.959,122.351,249.96,112.466,262.276,112.466z"
                  />
                </svg>
              </button>

              <div
                v-if="isTaskNote(note.category)"
                class="flex items-center gap-2"
                @mousedown.stop
                @touchstart.stop
                @click.stop
              >
                <button
                  type="button"
                  class="relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 dark:focus:ring-offset-zinc-900"
                  :class="
                    note.is_completed ? 'bg-green-600' : 'bg-zinc-200 dark:bg-zinc-700'
                  "
                  role="switch"
                  :aria-checked="note.is_completed"
                  :aria-label="note.is_completed ? 'Marcar pendiente' : 'Marcar completada'"
                  @click="toggleComplete(note, $event)"
                >
                  <span
                    class="pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
                    :class="note.is_completed ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>
          </div>
        </NotePressReveal>
      </article>
    </div>
  </div>
</template>
