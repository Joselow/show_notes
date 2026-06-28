<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  active: boolean
  progress: number
  originX: number
  originY: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const reducedMotion = ref(false)
let mediaQuery: MediaQueryList | null = null
let rafId = 0

type Particle = { angle: number; speed: number; size: number; delay: number }
let particles: Particle[] = []

const ox = computed(() => `${props.originX * 100}%`)
const oy = computed(() => `${props.originY * 100}%`)

const radialFill = computed(() => {
  const p = props.progress
  const spread = 5 + p * 20
  const violet = 0.06 + p * 0.3
  const rose = 0.03 + p * 0.2
  return `radial-gradient(circle at ${ox.value} ${oy.value}, rgba(167,139,250,${violet}) 0%, rgba(244,63,94,${rose}) ${spread * 0.35}%, transparent ${spread}%)`
})

function seedParticles() {
  particles = Array.from({ length: 12 }, () => ({
    angle: Math.random() * Math.PI * 2,
    speed: 0.35 + Math.random() * 0.65,
    size: 1 + Math.random() * 1.8,
    delay: Math.random() * 0.12,
  }))
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const parent = canvas.parentElement
  if (!parent) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = parent.clientWidth
  const h = parent.clientHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function drawParticles() {
  const canvas = canvasRef.value
  if (!canvas || !props.active) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  resizeCanvas(canvas)
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  ctx.clearRect(0, 0, w, h)

  if (reducedMotion.value) return

  const cx = props.originX * w
  const cy = props.originY * h
  const p = props.progress

  for (const part of particles) {
    const local = part.delay >= 1 ? 0 : Math.max(0, Math.min(1, (p - part.delay) / (1 - part.delay)))
    const dist = local * 36 * part.speed
    const x = cx + Math.cos(part.angle) * dist
    const y = cy + Math.sin(part.angle) * dist
    const alpha = (1 - local) * 0.45 * Math.min(1, p * 1.2)
    if (alpha <= 0.01) continue
    ctx.beginPath()
    ctx.arc(x, y, part.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(196,181,253,${alpha})`
    ctx.fill()
  }
}

function loop() {
  drawParticles()
  if (props.active) rafId = requestAnimationFrame(loop)
}

watch(
  () => props.active,
  (active) => {
    if (rafId) cancelAnimationFrame(rafId)
    if (active) {
      seedParticles()
      rafId = requestAnimationFrame(loop)
    }
  },
)

watch(
  () => props.progress,
  () => {
    if (props.active && !rafId) rafId = requestAnimationFrame(loop)
  },
)

let onMotionChange: (() => void) | null = null

onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = mediaQuery.matches
  onMotionChange = () => {
    reducedMotion.value = mediaQuery!.matches
  }
  mediaQuery.addEventListener('change', onMotionChange)
})

onUnmounted(() => {
  if (mediaQuery && onMotionChange) {
    mediaQuery.removeEventListener('change', onMotionChange)
  }
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <div class="relative">
    <div
      v-show="active && progress > 0"
      class="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-xl transition-opacity duration-150"
      :style="{ background: radialFill }"
      aria-hidden="true"
    />
    <div
      v-show="active && progress > 0"
      class="pointer-events-none absolute z-10 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/15 blur-2xl transition-opacity duration-150 dark:bg-violet-300/10"
      :class="progress >= 1 ? 'opacity-80' : 'opacity-40'"
      :style="{
        left: ox,
        top: oy,
        transform: `translate(-50%, -50%) scale(${0.6 + progress * 1.4})`,
      }"
      aria-hidden="true"
    />
    <canvas
      v-show="active && !reducedMotion"
      ref="canvasRef"
      class="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-xl"
      aria-hidden="true"
    />
    <div class="relative z-0">
      <slot />
    </div>
  </div>
</template>
