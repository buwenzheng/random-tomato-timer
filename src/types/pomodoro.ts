export interface PomodoroSession {
  id: string
  startTime: number
  endTime: number
  duration: number
  type: 'focus' | 'break'
  completed: boolean
  interrupted: boolean
  notes?: string
}

export interface PomodoroStats {
  totalSessions: number
  totalFocusTime: number
  totalBreakTime: number
  completedSessions: number
  interruptedSessions: number
  averageSessionDuration: number
  dailyStats: {
    [date: string]: {
      focusTime: number
      breakTime: number
      sessions: number
    }
  }
}
