import { ref, watch, onUnmounted } from 'vue'
import type { TimerSettings, Timer, TimerState } from '@/types/timer'

export function useTimer(settings: TimerSettings): Timer {
  const state = ref<TimerState>({
    timeLeft: settings.pomodoroMinutes * 60,
    isRunning: false,
    isPaused: false,
    isBreak: false,
    isRandomSounding: false,
    playedCount: 0,
    progressOffset: 0,
    formatTime: (time: number) => {
      const minutes = Math.floor(time / 60)
      const seconds = time % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
  })

  let timer: number | null = null
  let randomSoundTimer: number | null = null
  let randomSoundTimeout: number | null = null

  const clearTimers = () => {
    if (timer) clearInterval(timer)
    if (randomSoundTimer) clearTimeout(randomSoundTimer)
    if (randomSoundTimeout) clearTimeout(randomSoundTimeout)
    timer = null
    randomSoundTimer = null
    randomSoundTimeout = null
  }

  const startTimer = () => {
    clearTimers()
    if (state.value.isBreak) {
      state.value.timeLeft = settings.breakMinutes * 60
    } else {
      state.value.timeLeft = settings.pomodoroMinutes * 60
    }
    state.value.isRunning = true
    state.value.isPaused = false
    state.value.playedCount = 0

    timer = window.setInterval(() => {
      if (!state.value.isPaused && state.value.timeLeft > 0) {
        state.value.timeLeft--
        const total = state.value.isBreak ? settings.breakMinutes : settings.pomodoroMinutes
        state.value.progressOffset = 2 * Math.PI * 120 * (1 - state.value.timeLeft / (total * 60))
      }
    }, 1000)
  }

  const pauseTimer = () => {
    state.value.isPaused = true
  }

  const resumeTimer = () => {
    state.value.isPaused = false
  }

  const endTimer = () => {
    clearTimers()
    state.value.isRunning = false
    state.value.isPaused = false
    if (state.value.isBreak) {
      state.value.timeLeft = settings.pomodoroMinutes * 60
      state.value.isBreak = false
    } else {
      state.value.timeLeft = settings.breakMinutes * 60
      state.value.isBreak = true
    }
    state.value.progressOffset = 0
  }

  watch(() => settings.pomodoroMinutes, (val) => {
    if (!state.value.isRunning && !state.value.isPaused) {
      state.value.timeLeft = val * 60
    }
  })

  onUnmounted(() => {
    clearTimers()
  })

  return {
    state,
    startTimer,
    pauseTimer,
    resumeTimer,
    endTimer
  }
}
