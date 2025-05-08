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

export interface PomodoroRecord {
  id: string
  startTime: number
  endTime: number
  duration: number
  isBreak: boolean
  completed: boolean
}

export interface DailyStats {
  date: string // YYYY-MM-DD
  totalFocusTime: number // 总专注时间（分钟）
  totalBreakTime: number // 总休息时间（分钟）
  completedPomodoros: number // 完成的番茄钟数量
  completedTasks: number // 完成的任务数量（保留字段以保持兼容性）
}

export interface NotificationOptions {
  body?: string
  tag?: string
  icon?: string
  badge?: string
}

export type TimerAction = 'start' | 'pause' | 'resume' | 'end' | 'break'
