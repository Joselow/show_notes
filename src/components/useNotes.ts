import { ref } from 'vue'
import api from '../api/axios'
import type { CreateNoteBody, Note, UpdateNoteBody } from '../interfaces'

export type NotesRange = {
  date_start: string
  date_end: string
}

export function useNotes() {
  const notes = ref<Note[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchNotes = async (range: NotesRange) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.get<Note[]>('/notes', {
        params: {
          date_start: range.date_start,
          date_end: range.date_end,
        },
      })
      notes.value = data
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } }
      error.value = ax.response?.data?.message || 'Error al cargar notas'
      console.error('Error fetching notes:', err)
    } finally {
      loading.value = false
    }
  }

  const createNote = async (body: CreateNoteBody, range: NotesRange): Promise<void> => {
    error.value = null
    try {
      await api.post('/notes', body)
      await fetchNotes(range)
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } }
      error.value = ax.response?.data?.message || 'Error al crear nota'
      console.error(err)
      throw err
    }
  }

  const updateNote = async (
    id: string,
    body: UpdateNoteBody,
    range: NotesRange,
  ): Promise<Note> => {
    error.value = null
    try {
      const { data } = await api.put<Note>(`/notes/${id}`, body)
      await fetchNotes(range)
      return data
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } }
      error.value = ax.response?.data?.message || 'Error al actualizar nota'
      console.error(err)
      throw err
    }
  }

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
  }
}
