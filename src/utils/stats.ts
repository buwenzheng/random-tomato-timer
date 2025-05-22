import { PomodoroRecord, DailyStats, WeeklyStats, MonthlyStats } from './storage'
import { PomodoroSession, PomodoroStats } from '@/types/pomodoro'

export const calculateDailyStats = (records: PomodoroRecord[], date: string): DailyStats => {
  const dayRecords = records.filter(record => record.startTime.startsWith(date))

  const focusTime = dayRecords
    .filter(record => record.type === 'focus')
    .reduce((total, record) => {
      const duration =
        (new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / 1000 / 60
      return total + duration
    }, 0)

  const breakTime = dayRecords
    .filter(record => record.type === 'break')
    .reduce((total, record) => {
      const duration =
        (new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / 1000 / 60
      return total + duration
    }, 0)

  const completedPomodoros = dayRecords.filter(
    record => record.type === 'focus' && record.completed
  ).length
  const totalPomodoros = dayRecords.filter(record => record.type === 'focus').length

  return {
    date,
    focusTime,
    breakTime,
    completedPomodoros,
    totalPomodoros
  }
}

export const calculateWeeklyStats = (records: PomodoroRecord[], weekStart: string): WeeklyStats => {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  const weekRecords = records.filter(record => {
    const recordDate = record.startTime.split('T')[0]
    return recordDate >= weekStart && recordDate <= weekEndStr
  })

  const dailyStats: DailyStats[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    dailyStats.push(calculateDailyStats(records, dateStr))
  }

  const totalFocusTime = dailyStats.reduce((sum, day) => sum + day.focusTime, 0)
  const totalBreakTime = dailyStats.reduce((sum, day) => sum + day.breakTime, 0)
  const completedPomodoros = dailyStats.reduce((sum, day) => sum + day.completedPomodoros, 0)
  const totalPomodoros = dailyStats.reduce((sum, day) => sum + day.totalPomodoros, 0)

  return {
    weekStart,
    weekEnd: weekEndStr,
    totalFocusTime,
    totalBreakTime,
    completedPomodoros,
    totalPomodoros,
    dailyStats
  }
}

export const calculateMonthlyStats = (records: PomodoroRecord[], month: string): MonthlyStats => {
  const [year, monthNum] = month.split('-').map(Number)
  const firstDay = new Date(year, monthNum - 1, 1)
  const lastDay = new Date(year, monthNum, 0)

  const monthRecords = records.filter(record => {
    const recordDate = new Date(record.startTime)
    return recordDate >= firstDay && recordDate <= lastDay
  })

  const weeklyStats: WeeklyStats[] = []
  const currentWeekStart = new Date(firstDay)

  while (currentWeekStart <= lastDay) {
    const weekStartStr = currentWeekStart.toISOString().split('T')[0]
    weeklyStats.push(calculateWeeklyStats(records, weekStartStr))
    currentWeekStart.setDate(currentWeekStart.getDate() + 7)
  }

  const totalFocusTime = weeklyStats.reduce((sum, week) => sum + week.totalFocusTime, 0)
  const totalBreakTime = weeklyStats.reduce((sum, week) => sum + week.totalBreakTime, 0)
  const completedPomodoros = weeklyStats.reduce((sum, week) => sum + week.completedPomodoros, 0)
  const totalPomodoros = weeklyStats.reduce((sum, week) => sum + week.totalPomodoros, 0)

  return {
    month,
    totalFocusTime,
    totalBreakTime,
    completedPomodoros,
    totalPomodoros,
    weeklyStats
  }
}

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
}

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

export const stats = {
  calculateStats(sessions: PomodoroSession[]): PomodoroStats {
    const stats: PomodoroStats = {
      totalSessions: sessions.length,
      totalFocusTime: 0,
      totalBreakTime: 0,
      completedSessions: 0,
      interruptedSessions: 0,
      averageSessionDuration: 0,
      dailyStats: {}
    }

    let totalDuration = 0

    sessions.forEach(session => {
      // Calculate total time
      if (session.type === 'focus') {
        stats.totalFocusTime += session.duration
      } else {
        stats.totalBreakTime += session.duration
      }

      // Count completed and interrupted sessions
      if (session.completed) {
        stats.completedSessions++
      }
      if (session.interrupted) {
        stats.interruptedSessions++
      }

      // Calculate total duration for average
      totalDuration += session.duration

      // Update daily stats
      const date = new Date(session.startTime).toISOString().split('T')[0]
      if (!stats.dailyStats[date]) {
        stats.dailyStats[date] = {
          focusTime: 0,
          breakTime: 0,
          sessions: 0
        }
      }

      if (session.type === 'focus') {
        stats.dailyStats[date].focusTime += session.duration
      } else {
        stats.dailyStats[date].breakTime += session.duration
      }
      stats.dailyStats[date].sessions++
    })

    // Calculate average session duration
    stats.averageSessionDuration =
      sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0

    return stats
  },

  getDailyStats(sessions: PomodoroSession[], days: number = 7) {
    const stats = this.calculateStats(sessions)
    const dates = Object.keys(stats.dailyStats).sort().slice(-days)

    return dates.map(date => ({
      date,
      ...stats.dailyStats[date]
    }))
  },

  getProductivityScore(sessions: PomodoroSession[]): number {
    const stats = this.calculateStats(sessions)
    if (stats.totalSessions === 0) return 0

    const completionRate = stats.completedSessions / stats.totalSessions
    const interruptionRate = stats.interruptedSessions / stats.totalSessions
    const focusRatio = stats.totalFocusTime / (stats.totalFocusTime + stats.totalBreakTime)

    return Math.round(
      (completionRate * 0.4 + (1 - interruptionRate) * 0.3 + focusRatio * 0.3) * 100
    )
  }
}
