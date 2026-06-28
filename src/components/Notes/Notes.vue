<script setup lang="ts">
import type { Note } from '../../interfaces'
import {
  categoryLabel,
  isAudioNote,
  isTaskNote,
  typeLabel,
} from '../../utils/noteHelpers'

defineProps<{
  notes: Note[]
}>()

const emit = defineEmits<{
  'open-note': [note: Note]
  'toggle-completed': [id: string, value: boolean]
}>()

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
  audio:
    'text-white bg-green-500/90',
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

let lastTapAt = 0
function handleTouchEnd(note: Note) {
  const now = Date.now()
  if (now - lastTapAt < 320) {
    emit('open-note', note)
    lastTapAt = 0
  } else {
    lastTapAt = now
  }
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
        class="bg-white dark:bg-gray-800 rounded-xl border border-2 border-gray-200 dark:border-none
        px-3 py-1
        hover:shadow-md transition-shadow"
        @dblclick="emit('open-note', note)"
        @touchend="handleTouchEnd(note)"
      >
        <div class="flex gap-2 items-start justify-between">
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex justify-between flex-wrap items-center gap-2">
              <time class="text-sm shrink-0 text-zinc-500 dark:text-zinc-400">{{
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
              class="leading-relaxed text-zinc-900 line-clamp-3 whitespace-pre-wrap dark:text-zinc-100"
            >
              {{ note.content }}
            </p>
          </div>

          <div class="ms-3 flex flex-col items-end gap-2 shrink-0">
            <button
              type="button"
              class="text-sm text-gray-800 dark:text-gray-300 hover:underline"
              @click.stop="emit('open-note', note)"
            >
                <svg class="text-zinc-600 dark:text-white" fill="currentColor" height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 487.087 487.087" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M129.985,204.934c-5.523,0-10-4.477-10-10c0-19.195,6.606-38.025,18.603-53.02c10.381-12.977,24.435-22.686,40.092-27.81 c3.33-16.553,11.425-31.497,23.651-43.542c16.002-15.765,37.186-24.447,59.65-24.447c46.871,0,85.003,38.13,85.003,84.998 c0,5.523-4.477,10-10,10c-5.523,0-10-4.477-10-10c0-35.84-29.161-64.998-65.003-64.998c-17.178,0-33.378,6.639-45.614,18.694 c-10.593,10.436-17.13,23.706-18.905,38.376c-0.502,4.151-3.535,7.551-7.601,8.524c-29.366,7.025-49.875,33.024-49.875,63.226 C139.985,200.456,135.508,204.934,129.985,204.934z"></path> </g> <g> <path d="M88.485,199.173c-5.523,0-10-4.477-10-10c0-17.161,3.383-33.861,10.056-49.637c6.422-15.184,15.597-28.8,27.268-40.473 c8.273-8.273,17.583-15.331,27.716-21.018c6.505-15.504,15.946-29.414,28.099-41.388C195.615,13.019,227.375,0,261.053,0 c17.149,0,33.849,3.384,49.634,10.059c15.185,6.424,28.801,15.597,40.472,27.263c11.672,11.676,20.845,25.292,27.267,40.473 c6.675,15.776,10.06,32.474,10.06,49.629c0,5.523-4.477,10-10,10c-5.523,0-10-4.477-10-10c0-14.463-2.853-28.539-8.479-41.836 c-5.415-12.8-13.149-24.28-22.989-34.124c-9.839-9.835-21.319-17.569-34.121-22.985C289.59,22.853,275.512,20,261.053,20 c-28.392,0-55.167,10.975-75.393,30.904c-11.016,10.854-19.385,23.577-24.874,37.814c-0.874,2.267-2.544,4.138-4.697,5.264 c-9.618,5.029-18.412,11.497-26.138,19.223c-9.841,9.842-17.576,21.322-22.99,34.122c-5.624,13.297-8.476,27.376-8.476,41.846 C98.485,194.696,94.008,199.173,88.485,199.173z"></path> </g> <g> <path d="M262.276,112.466c12.439,0,22.524,10.085,22.524,22.525l0.018,172.322c0,1.996,1.617,3.613,3.613,3.613 c1.993,0,3.61-1.617,3.61-3.613l-0.007-0.933c0-11.326,11.005-19.231,22.326-19.231c12.441,0,22.478,10.085,22.478,22.524 l0.045,16.509c0,1.941,1.574,3.515,3.516,3.515c1.941,0,3.514-1.574,3.514-3.515l-0.013-1.257c0-10.3,11.146-18.197,22.106-18.197 c12.439,0,22.524,10.085,22.524,22.524l0.072,41.382c0,38.488-14.968,96.452-107.11,96.452 c-109.814,0-124.456-55.665-122.769-115.646c0.407-14.466,12.844-23.01,23.01-23.01v26.53c0,3.337,2.314,3.725,3.004,3.725 c0.69,0,2.927-0.379,2.927-3.717c0-3.221,0-167.638,0-167.638c0-12.439,10.084-22.524,22.524-22.524 c11.414,0,22.316,6.981,22.316,19.501c0.008,0.042-0.083,107.421-0.083,107.421c0,2.026,1.643,3.668,3.668,3.668 c2.025,0,3.668-1.642,3.668-3.668V134.618C239.959,122.351,249.96,112.466,262.276,112.466 M262.276,92.466 c-11.237,0-21.835,4.343-29.838,12.229c-7.991,7.873-12.493,18.384-12.676,29.597l-0.002,0.163v0.163v11.156 c-3.107-0.639-6.315-0.968-9.569-0.968c-23.448,0-42.524,19.076-42.524,42.524v123.656c-15.188,5.535-28.368,19.772-28.934,39.892 c-0.882,31.381,1.708,71.107,29.806,100.006c23.685,24.361,60.633,36.203,112.955,36.203c47.163,0,82.085-13.925,103.797-41.389 c15.251-19.292,23.313-45.247,23.313-75.063l-0.072-41.417c0-23.413-19.076-42.49-42.524-42.49c-4.931,0-9.821,0.832-14.452,2.419 c-7.245-13.106-21.202-21.999-37.194-21.999c-3.282,0-6.477,0.348-9.546,1.006L304.8,134.989 C304.8,111.543,285.724,92.466,262.276,92.466L262.276,92.466z"></path> </g> </g> </g></svg>
            </button>

            <div v-if="isTaskNote(note.category)" class="flex items-center gap-2" @click.stop>
              <button
                type="button"
                class="relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 dark:focus:ring-offset-zinc-900"
                :class="
                  note.is_completed
                    ? 'bg-green-600'
                    : 'bg-zinc-200 dark:bg-zinc-700'
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
      </article>
    </div>
  </div>
</template>
