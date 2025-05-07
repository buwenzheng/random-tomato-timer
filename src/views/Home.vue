<template>
  <div class="home">
    <header class="top-bar">
      <div class="left">
        <span
          class="iconfont"
          :class="timer.state.value.isBreak ? 'iconfont-coffee' : 'iconfont-zhuanzhu'"
        ></span>
        随机番茄钟
      </div>
      <div class="right">
        <span class="iconfont iconfont-setting" @click="showSettings = true"></span>
        <VolumeControl v-model:volume="audio.volume.value" @change="audio.playAudio('click')" />
      </div>
    </header>
    <div class="timer-container" shadow="hover">
      <div class="circle-progress">
        <svg width="260" height="260">
          <circle cx="130" cy="130" r="120" stroke="#e5e5e5" stroke-width="8" fill="none" />
          <circle
            cx="130"
            cy="130"
            r="120"
            :stroke="
              timer.state.value.isBreak
                ? '#ff6b6b'
                : timer.state.value.isRandomSounding
                  ? '#279fcf'
                  : '#4a7cff'
            "
            stroke-width="8"
            fill="none"
            :stroke-dasharray="2 * Math.PI * 120"
            :stroke-dashoffset="2 * Math.PI * 120 * (1 - progress / 100)"
            stroke-linecap="round"
            style="transition: stroke-dashoffset 0.5s"
          />
        </svg>
        <div class="timer-display">
          {{ timer.state.value.formatTime(timer.state.value.timeLeft) }}
        </div>
      </div>
      <div class="controls">
        <el-button type="primary" size="large" @click="handleMainAction" round>
          {{ mainActionText }}
        </el-button>
        <el-button
          size="large"
          @click="timer.endTimer"
          :disabled="!timer.state.value.isRunning && !timer.state.value.isPaused"
          round
          plain
          >结束</el-button
        >
      </div>
    </div>
    <SettingsDialog
      v-model="showSettings"
      :settings="settings.settings.value"
      @save="handleSaveSettings"
      @cancel="showSettings = false"
      @reset="handleResetSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTimer } from '@/composables/useTimer'
import { useNotification } from '@/composables/useNotification'
import { useSettings } from '@/composables/useSettings'
import { useAudio } from '@/composables/useAudio'
import SettingsDialog from '@/components/settings/SettingsDialog.vue'
import VolumeControl from '@/components/audio/VolumeControl.vue'
import './Home.scss'

const showSettings = ref(false)
const settings = useSettings()
const notification = useNotification()
const audio = useAudio()

onMounted(() => {
  settings.loadSettings()
})

const timer = useTimer(settings.settings.value)

const mainActionText = computed(() => {
  if (!timer.state.value.isRunning && !timer.state.value.isPaused) {
    return timer.state.value.isBreak ? '开始休息' : '开始专注'
  }
  if (timer.state.value.isBreak) return '休息中'
  return timer.state.value.isPaused ? '继续专注' : '暂停专注'
})

const progress = computed(() => {
  const total = timer.state.value.isBreak
    ? settings.settings.value.breakMinutes
    : settings.settings.value.pomodoroMinutes
  const current = timer.state.value.timeLeft / 60 // 将秒转换为分钟
  return (current / total) * 100 // 直接使用当前时间除以总时间
})

const handleMainAction = () => {
  if (!timer.state.value.isRunning && !timer.state.value.isPaused) {
    timer.startTimer()
  } else if (timer.state.value.isPaused) {
    timer.resumeTimer()
  } else {
    timer.pauseTimer()
  }
}

const updateTabTitle = () => {
  const minutes = Math.floor(timer.state.value.timeLeft / 60)
  const seconds = timer.state.value.timeLeft % 60
  const prefix = timer.state.value.isBreak ? '☕' : '🎯'
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  document.title = `${prefix} ${timeString} - 随机番茄钟`

  if (seconds === 0 && minutes > 0) {
    notification.sendNotification(`${timer.state.value.isBreak ? '休息中' : '专注中'}`, {
      body: `剩余时间：${timeString}`,
      tag: 'timer-update'
    })
  }
}

watch(
  () => timer.state.value.timeLeft,
  () => {
    updateTabTitle()
    if (timer.state.value.timeLeft === 0) {
      if (timer.state.value.isBreak) {
        timer.startTimer() // 休息结束后，开始新的专注
      } else {
        timer.endTimer() // 专注结束后，进入休息状态
      }
    }
  }
)

onMounted(() => {
  notification.requestPermission()

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        // eslint-disable-next-line no-console
        console.log('Service Worker registered:', registration)
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Service Worker registration failed:', error)
      })
  }

  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.type === 'TIMER_UPDATE') {
      timer.state.value.timeLeft = event.data.timeLeft
      timer.state.value.isBreak = event.data.isBreak
      updateTabTitle()
    }
  })

  document.title = '随机番茄钟'
})

onUnmounted(() => {
  timer.endTimer()
})

const handleSaveSettings = (newSettings: typeof settings.settings.value) => {
  settings.updateSettings(newSettings)
  showSettings.value = false
  audio.playAudio('click')
}

const handleResetSettings = () => {
  settings.resetSettings()
  audio.playAudio('click')
}
</script>
