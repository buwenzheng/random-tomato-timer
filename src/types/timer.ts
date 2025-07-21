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
  startTime: string
  endTime: string
  duration: number
  type: 'focus' | 'break'
  completed: boolean
}

export interface DailyStats {
  date: string
  focusTime: number
  breakTime: number
  completedPomodoros: number
  totalPomodoros: number
}

export interface NotificationOptions {
  body?: string
  tag?: string
  icon?: string
  badge?: string
}

export type TimerAction = 'start' | 'pause' | 'resume' | 'end' | 'break'

export interface WeeklyStats {
  weekStart: string
  weekEnd: string
  totalFocusTime: number
  totalBreakTime: number
  completedPomodoros: number
  totalPomodoros: number
  dailyStats: DailyStats[]
}

export interface MonthlyStats {
  month: string // YYYY-MM
  totalFocusTime: number
  totalBreakTime: number
  completedPomodoros: number
  totalPomodoros: number
  weeklyStats: WeeklyStats[]
}
