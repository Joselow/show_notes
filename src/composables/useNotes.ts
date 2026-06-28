import { ref } from 'vue'
import api from '../api/axios'
import type { CreateNoteBody, Note, NoteCategory, UpdateNoteBody } from '../interfaces'

export type NotesRange = {
  date_start: string
  date_end: string
  category?: NoteCategory
}

const notes = ref<Note[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

function sortNotesAsc(list: Note[]): Note[] {
  return [...list].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}

function upsertNote(note: Note) {
  const idx = notes.value.findIndex((n) => n.id === note.id)
  if (idx >= 0) {
    notes.value[idx] = note
    return
  }
  notes.value = sortNotesAsc([...notes.value, note])
}

function removeNote(id: string) {
  notes.value = notes.value.filter((n) => n.id !== id)
}

export function useNotes() {
  const fetchNotes = async (range: NotesRange) => {
    loading.value = true
    error.value = null

    try {
      const params: Record<string, string> = {
        date_start: range.date_start,
        date_end: range.date_end,
      }
      if (range.category) {
        params.category = range.category
      }

      const { data } = await api.get<Note[]>('/notes', { params })
      notes.value = sortNotesAsc(data)
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } }
      error.value = ax.response?.data?.message || 'Error al cargar notas'
      console.error('Error fetching notes:', err)
    } finally {
      loading.value = false
    }
  }

  const createNote = async (body: CreateNoteBody): Promise<Note> => {
    error.value = null
    try {
      const { data } = await api.post<{ data: Note }>('/notes', { ...body, origin: 'app' })
      const note = data.data
      upsertNote(note)
      return note
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } }
      error.value = ax.response?.data?.message || 'Error al crear nota'
      console.error(err)
      throw err
    }
  }

  const updateNote = async (id: string, body: UpdateNoteBody): Promise<Note> => {
    error.value = null
    try {
      const { data } = await api.put<Note>(`/notes/${id}`, body)
      upsertNote(data)
      return data
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } }
      error.value = ax.response?.data?.message || 'Error al actualizar nota'
      console.error(err)
      throw err
    }
  }

  const deleteNote = async (id: string): Promise<boolean> => {
    error.value = null
    try {
      await api.delete(`/notes/${id}`)
      removeNote(id)
      return true
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } }
      error.value = ax.response?.data?.message || 'Error al eliminar nota'
      console.error(err)
      return false
    }
  }

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    upsertNote,
    removeNote,
  }
}
