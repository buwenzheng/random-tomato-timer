<template>
  <div class="circle-progress">
    <svg width="260" height="260">
      <circle cx="130" cy="130" r="120" stroke="#e5e5e5" stroke-width="8" fill="none" />
      <circle
        cx="130" cy="130" r="120"
        :stroke="isBreak ? '#ff6b6b' : (isRandomSounding ? '#279fcf' : '#4a7cff')"
        stroke-width="8"
        fill="none"
        :stroke-dasharray="2 * Math.PI * 120"
        :stroke-dashoffset="2 * Math.PI * 120 * (1 - progress / 100)"
        stroke-linecap="round"
        style="transition: stroke-dashoffset 0.5s;"
      />
    </svg>
    <div class="timer-display">
      {{ formatTime(timeLeft) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  timeLeft: number
  isBreak: boolean
  isRandomSounding: boolean
  totalMinutes: number
}

const props = defineProps<Props>()

const progress = computed(() => {
  const current = props.timeLeft / 60
  return (current / props.totalMinutes) * 100
})

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.circle-progress {
  position: relative;
  width: 260px;
  height: 260px;
  margin-bottom: 18px;
  svg {
    position: absolute;
    left: 0;
    top: 0;
  }
  .timer-display {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    font-weight: bold;
    color: #111;
    letter-spacing: 2px;
  }
}
</style> 