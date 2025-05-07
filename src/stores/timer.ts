import { defineStore } from 'pinia'
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

export const useTimerStore = defineStore('timer', () => {
  const settings = ref<TimerSettings>({ ...defaultSettings })
  const timeLeft = ref(0)
  const isRunning = ref(false)
  const isPaused = ref(false)
  const isBreak = ref(false)
  const isRandomSounding = ref(false)

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

  const updateSettings = (newSettings: TimerSettings) => {
    settings.value = { ...newSettings }
    saveSettings()
  }

  const resetSettings = () => {
    settings.value = { ...defaultSettings }
    saveSettings()
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    isRunning.value = true
    isPaused.value = false
    timeLeft.value =
      (isBreak.value ? settings.value.breakMinutes : settings.value.pomodoroMinutes) * 60
  }

  const pauseTimer = () => {
    isRunning.value = false
    isPaused.value = true
  }

  const resumeTimer = () => {
    isRunning.value = true
    isPaused.value = false
  }

  const endTimer = () => {
    isRunning.value = false
    isPaused.value = false
    isBreak.value = !isBreak.value
    timeLeft.value = 0
  }

  const resetTimer = () => {
    isRunning.value = false
    isPaused.value = false
    timeLeft.value =
      (isBreak.value ? settings.value.breakMinutes : settings.value.pomodoroMinutes) * 60
  }

  const decrementTime = () => {
    if (isRunning.value && timeLeft.value > 0) {
      timeLeft.value--
    }
  }

  return {
    settings,
    timeLeft,
    isRunning,
    isPaused,
    isBreak,
    isRandomSounding,
    loadSettings,
    saveSettings,
    updateSettings,
    resetSettings,
    formatTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    endTimer,
    resetTimer,
    decrementTime
  }
})
