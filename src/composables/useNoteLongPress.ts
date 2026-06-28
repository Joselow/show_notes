import { ref } from 'vue'
import type { Note } from '../interfaces'

export const LONG_PRESS_MS = 700
const CANCEL_MS = 150
const MOVE_SLOP_PX = 5

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function pointerRatios(el: HTMLElement, e: MouseEvent | TouchEvent) {
  const rect = el.getBoundingClientRect()
  let clientX: number
  let clientY: number
  if ('touches' in e && e.touches.length > 0) {
    clientX = e.touches[0]!.clientX
    clientY = e.touches[0]!.clientY
  } else if ('clientX' in e) {
    clientX = e.clientX
    clientY = e.clientY
  } else {
    return { x: 0.5, y: 0.5 }
  }
  const w = rect.width || 1
  const h = rect.height || 1
  return {
    x: Math.max(0, Math.min(1, (clientX - rect.left) / w)),
    y: Math.max(0, Math.min(1, (clientY - rect.top) / h)),
  }
}

export function useNoteLongPress(onComplete: (note: Note) => void) {
  const activeNoteId = ref<string | null>(null)
  const progress = ref(0)
  const originX = ref(0.5)
  const originY = ref(0.5)

  let rafId = 0
  let pressStart = 0
  let cancelStart = 0
  let cancelFrom = 0
  let mode: 'idle' | 'pressing' | 'canceling' = 'idle'
  let currentNote: Note | null = null
  let touchStartX = 0
  let touchStartY = 0

  function stopRaf() {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }

  function tick(now: number) {
    if (mode === 'pressing') {
      const elapsed = now - pressStart
      progress.value = Math.min(1, elapsed / LONG_PRESS_MS)
      if (progress.value >= 1) {
        const note = currentNote
        stopRaf()
        mode = 'idle'
        activeNoteId.value = null
        progress.value = 0
        currentNote = null
        if (note) onComplete(note)
        return
      }
    } else if (mode === 'canceling') {
      const t = Math.min(1, (now - cancelStart) / CANCEL_MS)
      progress.value = cancelFrom * (1 - easeOutCubic(t))
      if (t >= 1) {
        stopRaf()
        mode = 'idle'
        activeNoteId.value = null
        progress.value = 0
        return
      }
    }
    rafId = requestAnimationFrame(tick)
  }

  function start(note: Note, el: HTMLElement, e: MouseEvent | TouchEvent) {
    if ('button' in e && e.button !== 0) return

    stopRaf()
    currentNote = note
    activeNoteId.value = note.id
    const o = pointerRatios(el, e)
    originX.value = o.x
    originY.value = o.y

    if ('touches' in e && e.touches.length > 0) {
      touchStartX = e.touches[0]!.clientX
      touchStartY = e.touches[0]!.clientY
    }

    mode = 'pressing'
    pressStart = performance.now()
    progress.value = 0
    rafId = requestAnimationFrame(tick)
  }

  function cancel() {
    if (mode !== 'pressing') return
    mode = 'canceling'
    cancelFrom = progress.value
    cancelStart = performance.now()
    currentNote = null
    if (!rafId) rafId = requestAnimationFrame(tick)
  }

  function onTouchMove(e: TouchEvent) {
    if (mode !== 'pressing' || e.touches.length === 0) return
    const dx = e.touches[0]!.clientX - touchStartX
    const dy = e.touches[0]!.clientY - touchStartY
    if (Math.hypot(dx, dy) > MOVE_SLOP_PX) cancel()
  }

  function isCardActive(id: string) {
    return activeNoteId.value === id
  }

  return {
    activeNoteId,
    progress,
    originX,
    originY,
    start,
    cancel,
    onTouchMove,
    isCardActive,
  }
}
