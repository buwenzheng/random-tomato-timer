import { ref } from 'vue'
import type { TimerSettings } from '@/types/timer'

const STORAGE_KEY = 'timer_settings'

const defaultSettings: TimerSettings = {
  pomodoroMinutes: 25,
  breakMinutes: 5,
  randomSoundEnabled: false,
  randomSoundDuration: 10,
  randomSoundCount: 3,
  volume: 100
}

export function useSettings() {
  const settings = ref<TimerSettings>({ ...defaultSettings })

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY)
      if (savedSettings) {
        settings.value = JSON.parse(savedSettings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const resetSettings = () => {
    settings.value = { ...defaultSettings }
    saveSettings()
  }

  const updateSettings = (newSettings: TimerSettings) => {
    settings.value = { ...newSettings }
    saveSettings()
  }

  return {
    settings,
    loadSettings,
    saveSettings,
    resetSettings,
    updateSettings
  }
}
