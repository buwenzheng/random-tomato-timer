import type { Ref } from 'vue'

export interface TimerSettings {
  pomodoroMinutes: number
  breakMinutes: number
  randomSoundEnabled: boolean
  randomSoundDuration: number
  randomSoundCount: number
  volume: number
}

export interface TimerState {
  timeLeft: number
  isRunning: boolean
  isPaused: boolean
  isBreak: boolean
  isRandomSounding: boolean
  playedCount: number
  progressOffset: number
  formatTime: (time: number) => string
}

export interface Timer {
  state: TimerState
  startTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  endTimer: () => void
}

export interface NotificationOptions {
  body?: string
  tag?: string
  icon?: string
  badge?: string
}

export type TimerAction = 'start' | 'pause' | 'resume' | 'end' | 'break'
