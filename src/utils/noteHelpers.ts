import type { NoteCategory } from '../interfaces'

const CATEGORY_OPTIONS: NoteCategory[] = [
  'task',
  'frase',
  'por_estudiar',
  'aprendizaje',
  'apunte',
]

export const NOTE_CATEGORIES: NoteCategory[] = CATEGORY_OPTIONS

export function parseNoteCategory(category: string | undefined): NoteCategory {
  const k = (category ?? 'apunte').toLowerCase() as NoteCategory
  return NOTE_CATEGORIES.includes(k) ? k : 'apunte'
}

export function isTaskNote(category: string | undefined): boolean {
  return (category ?? '').toLowerCase() === 'task'
}

const LABELS: Record<NoteCategory, string> = {
  task: 'Tarea',
  frase: 'Frase',
  por_estudiar: 'Por Estudiar',
  aprendizaje: 'Aprendizaje',
  apunte: 'Apunte',
}

export function categoryLabel(category: string | undefined): string {
  const k = (category ?? 'apunte').toLowerCase() as NoteCategory
  return LABELS[k] ?? category ?? 'Apunte'
}

export function typeLabel(type: string): 'Texto' | 'Audio' {
  const t = String(type).toLowerCase()
  if (t === '2' || t === 'audio') return 'Audio'
  return 'Texto'
}

export function isAudioNote(type: string | undefined): boolean {
  if (type == null) return false
  const t = String(type).toLowerCase()
  return t === '2' || t === 'audio'
}
