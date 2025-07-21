import { ref, watch } from 'vue'
import { PomodoroSession } from '../types/pomodoro'
import type { DailyStats, WeeklyStats, MonthlyStats } from '../types/timer'

const STORAGE_KEY = {
  SETTINGS: 'pomodoro-settings',
  RECORDS: 'pomodoro-records',
  STATS: 'pomodoro-stats',
  SESSIONS: 'pomodoro_sessions'
}

export const useStorage = () => {
  const getItem = <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  }

  const setItem = <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }

  const removeItem = (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }

  const clear = (): void => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  return {
    getItem,
    setItem,
    removeItem,
    clear
  }
}

export const usePersistentRef = <T>(key: string, defaultValue: T) => {
  const storage = useStorage()
  const value = ref<T>(storage.getItem(key) ?? defaultValue)

  watch(
    value,
    newValue => {
      storage.setItem(key, newValue)
    },
    { deep: true }
  )

  return value
}

export const exportData = () => {
  const storage = useStorage()
  const data = {
    settings: storage.getItem(STORAGE_KEY.SETTINGS),
    records: storage.getItem(STORAGE_KEY.RECORDS),
    stats: storage.getItem(STORAGE_KEY.STATS)
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pomodoro-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const importData = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target?.result as string)
        const storage = useStorage()

        if (data.settings) storage.setItem(STORAGE_KEY.SETTINGS, data.settings)
        if (data.records) storage.setItem(STORAGE_KEY.RECORDS, data.records)
        if (data.stats) storage.setItem(STORAGE_KEY.STATS, data.stats)

        resolve()
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export const storage = {
  saveSessions(sessions: PomodoroSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEY.SESSIONS, JSON.stringify(sessions))
    } catch (error) {
      console.error('Failed to save sessions:', error)
    }
  },

  getSessions(): PomodoroSession[] {
    try {
      const sessions = localStorage.getItem(STORAGE_KEY.SESSIONS)
      return sessions ? JSON.parse(sessions) : []
    } catch (error) {
      console.error('Failed to get sessions:', error)
      return []
    }
  },

  clearSessions(): void {
    try {
      localStorage.removeItem(STORAGE_KEY.SESSIONS)
    } catch (error) {
      console.error('Failed to clear sessions:', error)
    }
  }
}
