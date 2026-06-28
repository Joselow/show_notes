<script setup lang="ts">
import type { NoteCategory } from '../../interfaces'
import { NOTE_CATEGORIES, categoryLabel } from '../../utils/noteHelpers'

const props = defineProps<{
  modelValue: NoteCategory | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: NoteCategory | null]
}>()

function toggle(category: NoteCategory) {
  emit('update:modelValue', props.modelValue === category ? null : category)
}

function chipClass(selected: boolean) {
  return selected
    ? 'bg-violet-600 text-white ring-1 ring-violet-500/50 shadow-sm dark:bg-violet-600 dark:ring-violet-400/40'
    : 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700'
}
</script>

<template>
  <div class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
    <button
      v-for="c in NOTE_CATEGORIES"
      :key="c"
      type="button"
      class="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
      :class="chipClass(modelValue === c)"
      @click="toggle(c)"
    >
      {{ categoryLabel(c) }}
    </button>
  </div>
</template>
