import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { PomodoroRecord } from '@/types/timer'

export const useTaskStore = defineStore('tasks', () => {
  const records = ref<PomodoroRecord[]>([])

  const addPomodoroRecord = (startTime: Date, endTime: Date, isBreak: boolean) => {
    const record: PomodoroRecord = {
      id: uuidv4(),
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      duration: Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60),
      isBreak,
      completed: true
    }
    records.value.push(record)
  }

  return {
    records,
    addPomodoroRecord
  }
})
