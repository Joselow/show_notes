import { ref } from 'vue'
import api from '../api/axios'
import type { Note } from '../interfaces'

export function useNotes() {
  const notes = ref<Note[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchNotes = async (date?: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await api.get<Note[]>('/notes', {
        params: {
          date
        }
      })
      notes.value = data      
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch notes'
      console.error('Error fetching notes:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    notes,
    loading,
    error,
    fetchNotes
  }
}