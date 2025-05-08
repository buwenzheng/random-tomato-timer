<template>
  <div class="home">
    <header class="top-bar">
      <div class="left">
        <span
          class="iconfont"
          :class="timer.state.isBreak ? 'iconfont-coffee' : 'iconfont-zhuanzhu'"
        ></span>
        随机番茄钟
      </div>
      <div class="right">
        <span class="iconfont iconfont-setting" @click="showSettings = true"></span>
        <VolumeControl v-model:volume="audio.volume.value" @change="audio.playAudio('click')" />
      </div>
    </header>
    <div class="main-content">
      <div class="timer-container" shadow="hover">
        <div class="circle-progress">
          <svg width="260" height="260">
            <circle cx="130" cy="130" r="120" stroke="#e5e5e5" stroke-width="8" fill="none" />
            <circle
              cx="130"
              cy="130"
              r="120"
              :stroke="
                timer.state.isBreak
                  ? '#ff6b6b'
                  : timer.state.isRandomSounding
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
            {{ timer.state.formatTime(timer.state.timeLeft) }}
          </div>
        </div>
        <div class="controls">
          <el-button type="primary" size="large" @click="handleMainAction" round>
            {{ mainActionText }}
          </el-button>
          <el-button
            size="large"
            @click="timer.endTimer"
            :disabled="!timer.state.isRunning && !timer.state.isPaused"
            round
            plain
          >
            结束
          </el-button>
        </div>
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
import { useTaskStore } from '@/stores/tasks'
import SettingsDialog from '@/components/settings/SettingsDialog.vue'
import VolumeControl from '@/components/audio/VolumeControl.vue'
import './Home.scss'

const showSettings = ref(false)
const settings = useSettings()
const notification = useNotification()
const audio = useAudio()
const taskStore = useTaskStore()

// 添加键盘快捷键处理
const handleKeyDown = (event: KeyboardEvent) => {
  // 如果正在输入框中，不处理快捷键
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return
  }

  switch (event.key) {
    case ' ': // 空格键
      event.preventDefault() // 防止页面滚动
      handleMainAction()
      break
    case 'Escape': // Esc 键
      if (timer.value.state.isRunning || timer.value.state.isPaused) {
        timer.value.endTimer()
      }
      if (showSettings.value) {
        showSettings.value = false
      }
      break
    case 's': // S 键
    case 'S':
      showSettings.value = !showSettings.value
      break
  }
}

onMounted(() => {
  settings.loadSettings()
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyDown)
})

const timer = ref(useTimer(settings.settings.value))

// 监听 settings 的变化
watch(
  () => settings.settings.value,
  () => {
    timer.value = useTimer(settings.settings.value)
  },
  { deep: true }
)

const mainActionText = computed(() => {
  if (!timer.value.state.isRunning && !timer.value.state.isPaused) {
    return timer.value.state.isBreak ? '开始休息' : '开始专注'
  }
  if (timer.value.state.isBreak) return '休息中'
  return timer.value.state.isPaused ? '继续专注' : '暂停专注'
})

const progress = computed(() => {
  const total = timer.value.state.isBreak
    ? settings.settings.value.breakMinutes
    : settings.settings.value.pomodoroMinutes
  const current = timer.value.state.timeLeft / 60 // 将秒转换为分钟
  return (current / total) * 100 // 直接使用当前时间除以总时间
})

const handleMainAction = () => {
  if (!timer.value.state.isRunning && !timer.value.state.isPaused) {
    timer.value.startTimer()
  } else if (timer.value.state.isPaused) {
    timer.value.resumeTimer()
  } else {
    timer.value.pauseTimer()
  }
}

const updateTabTitle = () => {
  const minutes = Math.floor(timer.value.state.timeLeft / 60)
  const seconds = timer.value.state.timeLeft % 60
  const prefix = timer.value.state.isBreak ? '☕' : '🎯'
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  document.title = `${prefix} ${timeString} - 随机番茄钟`

  if (seconds === 0 && minutes > 0) {
    notification.sendNotification(`${timer.value.state.isBreak ? '休息中' : '专注中'}`, {
      body: `剩余时间：${timeString}`,
      tag: 'timer-update'
    })
  }
}

// 监听计时器状态变化，记录番茄钟
watch(
  () => timer.value.state.timeLeft,
  (newTimeLeft, oldTimeLeft) => {
    updateTabTitle()
    if (newTimeLeft === 0 && oldTimeLeft > 0) {
      if (timer.value.state.isBreak) {
        timer.value.startTimer() // 休息结束后，开始新的专注
      } else {
        // 记录完成的番茄钟
        const now = new Date()
        const startTime = new Date(
          now.getTime() - settings.settings.value.pomodoroMinutes * 60 * 1000
        )
        taskStore.addPomodoroRecord(startTime, now, false)
        timer.value.endTimer() // 专注结束后，进入休息状态
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
      timer.value.state.timeLeft = event.data.timeLeft
      timer.value.state.isBreak = event.data.isBreak
      updateTabTitle()
    }
  })

  document.title = '随机番茄钟'
})

onUnmounted(() => {
  // 移除键盘事件监听
  window.removeEventListener('keydown', handleKeyDown)
  timer.value.endTimer()
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

<style lang="scss" scoped>
.home {
  .main-content {
    display: flex;
    justify-content: center;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .timer-container {
    width: 300px;
  }
}
</style>
