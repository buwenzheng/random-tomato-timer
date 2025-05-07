<template>
  <div class="home">
    <header class="top-bar">
      <div class="left">
        <span class="iconfont" :class="timer.state.value.isBreak ? 'iconfont-coffee' : 'iconfont-zhuanzhu'"></span>
        随机番茄钟
      </div>
      <div class="right">
        <span class="iconfont iconfont-setting" @click="showSettings = true"></span>
        <el-popover
          placement="bottom"
          width="160"
          trigger="hover"
          popper-class="volume-popover"
        >
          <template #reference>
            <span class="iconfont iconfont-volume"></span>
          </template>
          <div style="padding: 8px 0;">
            <el-slider
              v-model="audio.volume.value"
              :min="0"
              :max="100"
              :step="1"
              show-tooltip
              style="width: 120px"
              @change="audio.playAudio('/static/提示音A.mp3')"
            />
          </div>
        </el-popover>
      </div>
    </header>
    <div class="timer-container" shadow="hover">
      <div class="circle-progress">
        <svg width="260" height="260">
          <circle cx="130" cy="130" r="120" stroke="#e5e5e5" stroke-width="8" fill="none" />
          <circle
            cx="130" cy="130" r="120"
            :stroke="timer.state.value.isBreak ? '#ff6b6b' : (timer.state.value.isRandomSounding ? '#279fcf' : '#4a7cff')"
            stroke-width="8"
            fill="none"
            :stroke-dasharray="2 * Math.PI * 120"
            :stroke-dashoffset="2 * Math.PI * 120 * (1 - progress / 100)"
            stroke-linecap="round"
            style="transition: stroke-dashoffset 0.5s;"
          />
        </svg>
        <div class="timer-display">
          {{ timer.state.value.formatTime(timer.state.value.timeLeft) }}
        </div>
      </div>
      <div class="controls">
        <el-button
          type="primary"
          size="large"
          @click="handleMainAction"
          round
        >
          {{ mainActionText }}
        </el-button>
        <el-button
          size="large"
          @click="timer.endTimer"
          :disabled="!timer.state.value.isRunning && !timer.state.value.isPaused"
          round
          plain
        >结束</el-button>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <el-dialog
      v-model="showSettings"
      title="设置"
      width="400px"
      :close-on-click-modal="false"
      center
    >
      <el-form label-position="top">
        <el-form-item label="番茄钟时长（分钟）">
          <el-input-number 
            v-model="settings.settings.value.pomodoroMinutes" 
            :min="1" 
            :max="120"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="休息时长（分钟）">
          <el-input-number 
            v-model="settings.settings.value.breakMinutes" 
            :min="1" 
            :max="60"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="随机提示音">
          <el-switch v-model="settings.settings.value.randomSoundEnabled" active-text="开" inactive-text="关" />
        </el-form-item>
        <template v-if="settings.settings.value.randomSoundEnabled">
          <el-form-item label="播放次数">
            <el-input-number 
              v-model="settings.settings.value.randomSoundCount" 
              :min="3" 
              :max="10" 
              :step="1"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="持续时长">
            <el-select v-model="settings.settings.value.randomSoundDuration" style="width: 100%">
              <el-option :label="'10秒'" :value="10" />
              <el-option :label="'15秒'" :value="15" />
              <el-option :label="'20秒'" :value="20" />
            </el-select>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" plain @click="settings.resetSettings">重置</el-button>
          <el-button type="primary" plain @click="showSettings = false">取消</el-button>
          <el-button type="primary" @click="settings.saveSettings(); showSettings = false">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTimer } from '@/composables/useTimer'
import { useNotification } from '@/composables/useNotification'
import { useSettings } from '@/composables/useSettings'
import { useAudio } from '@/composables/useAudio'
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
  const total = timer.state.value.isBreak ? settings.settings.value.breakMinutes : settings.settings.value.pomodoroMinutes
  const current = timer.state.value.timeLeft / 60  // 将秒转换为分钟
  return (current / total) * 100  // 直接使用当前时间除以总时间
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

watch(() => timer.state.value.timeLeft, () => {
  updateTabTitle()
  if (timer.state.value.timeLeft === 0) {
    if (timer.state.value.isBreak) {
      timer.startTimer()  // 休息结束后，开始新的专注
    } else {
      timer.endTimer()  // 专注结束后，进入休息状态
    }
  }
})

onMounted(() => {
  notification.requestPermission()

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('Service Worker registered:', registration)
    }).catch((error) => {
      console.error('Service Worker registration failed:', error)
    })
  }

  navigator.serviceWorker.addEventListener('message', (event) => {
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
</script>
