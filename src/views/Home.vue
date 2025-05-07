<template>
  <div class="home">
    <header class="top-bar">
      <div class="left">随机番茄钟</div>
      <div class="right">
        <el-popover
          placement="bottom"
          width="160"
          trigger="hover"
          popper-class="volume-popover"
        >
          <template #reference>
            <img src="/static/铃声.png" alt="音量" class="icon" />
          </template>
          <div style="padding: 8px 0;">
            <el-slider
              v-model="volume"
              :min="0"
              :max="100"
              :step="1"
              show-tooltip
              style="width: 120px"
              @change="onVolumeChange"
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
            :stroke="isBreak ? '#ff6b6b' : (isRandomSounding ? '#279fcf' : '#4a7cff')"
            stroke-width="8"
            fill="none"
            :stroke-dasharray="2 * Math.PI * 120"
            :stroke-dashoffset="progressOffset"
            stroke-linecap="round"
            style="transition: stroke-dashoffset 0.5s;"
          />
        </svg>
        <div class="timer-display">
          {{ formatTime(timeLeft) }}
        </div>
      </div>
      <div class="settings-panel">
        <el-form :inline="true" label-width="100px">
          <el-form-item label="番茄钟时长">
            <el-input v-model="pomodoroMinutes" type="number" min="1" max="120" />
          </el-form-item>
          <el-form-item label="休息时长">
            <el-input v-model="breakMinutes" type="number" min="1" max="60" />
          </el-form-item>
          <el-form-item label="随机提示音">
            <el-switch v-model="randomSoundEnabled" active-text="开" inactive-text="关" />
          </el-form-item>
          <el-form-item label="持续时长" v-if="randomSoundEnabled">
            <el-select v-model="randomSoundDuration" style="width: 100px">
              <el-option :label="'10秒'" :value="10" />
              <el-option :label="'15秒'" :value="15" />
              <el-option :label="'20秒'" :value="20" />
            </el-select>
          </el-form-item>
        </el-form>
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
          @click="endTimer"
          :disabled="!isRunning && !isPaused"
          round
          plain
        >结束</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import './Home.scss'

const pomodoroMinutes = ref(30)
const breakMinutes = ref(5)
const timeLeft = ref(pomodoroMinutes.value * 60)
const isRunning = ref(false)
const isPaused = ref(false)
const isBreak = ref(false)
const randomSoundEnabled = ref(false)
const randomSoundDuration = ref(10)
const isRandomSounding = ref(false)
const volume = ref(100)
const notificationPermission = ref(false)
let timer = null
let randomSoundTimer = null
let randomSoundTimeout = null

const randomSoundList = ['/static/提示音B.mp3', '/static/提示音C.mp3']

const onVolumeChange = () => {
  playAudio('/static/提示音A.mp3')
}

watch(volume, (val) => {
  window.__globalVolume = val / 100
})

const progressOffset = computed(() => {
  const percent = timeLeft.value / (pomodoroMinutes.value * 60)
  return 2 * Math.PI * 120 * (1 - percent)
})

watch(pomodoroMinutes, (val) => {
  if (!isRunning.value && !isPaused.value) {
    timeLeft.value = val * 60
  }
})

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

const playAudio = (src) => {
  const audio = new Audio(src)
  audio.volume = window.__globalVolume ?? 1
  audio.play()
}

const startRandomSound = () => {
  if (!randomSoundEnabled.value || isRandomSounding.value) return
  isRandomSounding.value = true
  playAudio('/static/提示音A.mp3')
  // 随机提示音持续 randomSoundDuration 秒
  randomSoundTimer = setTimeout(() => {
    playAudio('/static/提示音A.mp3')
    isRandomSounding.value = false
    scheduleNextRandomSound()
  }, randomSoundDuration.value * 1000)
}

const scheduleNextRandomSound = () => {
  if (!randomSoundEnabled.value || !isRunning.value) return
  // 计算下一个随机时间（剩余时间的1/4~1/2之间）
  const min = Math.max(5, Math.floor(timeLeft.value * 0.25))
  const max = Math.max(min + 1, Math.floor(timeLeft.value * 0.5))
  if (timeLeft.value < randomSoundDuration.value + 5) return // 剩余时间太短不再触发
  const randomDelay = Math.floor(Math.random() * (max - min)) + min
  randomSoundTimeout = setTimeout(() => {
    // 随机播放B或C
    playAudio(randomSoundList[Math.floor(Math.random() * randomSoundList.length)])
    startRandomSound()
  }, randomDelay * 1000)
}

const clearRandomSound = () => {
  clearTimeout(randomSoundTimer)
  clearTimeout(randomSoundTimeout)
  isRandomSounding.value = false
}

const updateTabTitle = () => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  const prefix = isBreak.value ? '休息中' : '专注中'
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  document.title = `${prefix} ${timeString} - 随机番茄钟`

  // 每分钟发送一次通知
  if (seconds === 0 && minutes > 0) {
    sendNotification(`${prefix}`, {
      body: `剩余时间：${timeString}`,
      tag: 'timer-update'
    });
  }
}

const startTimer = () => {
  if (!isRunning.value && !isPaused.value) {
    isRunning.value = true
    isPaused.value = false
    sendNotification('开始专注', {
      body: `专注时长：${pomodoroMinutes.value}分钟`,
      tag: 'timer-start'
    });
    timer = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
        updateTabTitle()
        if (randomSoundEnabled.value && !isRandomSounding.value && !randomSoundTimeout) {
          scheduleNextRandomSound()
        }
        // 发送计时器状态到 Service Worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'TIMER_TICK',
            timeLeft: timeLeft.value,
            isBreak: isBreak.value
          });
        }
      } else {
        clearInterval(timer)
        isRunning.value = false
        isPaused.value = false
        clearRandomSound()
        playAudio('/static/提示音C.mp3')
        sendNotification('专注结束', {
          body: '该休息了！',
          tag: 'timer-end'
        });
        timeLeft.value = breakMinutes.value * 60
        updateTabTitle()
      }
    }, 1000)
  }
}

const pauseTimer = () => {
  if (isRunning.value) {
    clearInterval(timer)
    isRunning.value = false
    isPaused.value = true
    clearRandomSound()
  }
}

const resumeTimer = () => {
  if (isPaused.value) {
    isRunning.value = true
    isPaused.value = false
    timer = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
        if (randomSoundEnabled.value && !isRandomSounding.value && !randomSoundTimeout && !isBreak.value) {
          scheduleNextRandomSound()
        }
      } else {
        clearInterval(timer)
        isRunning.value = false
        isPaused.value = false
        clearRandomSound()
        playAudio('/static/提示音C.mp3')
        if (!isBreak.value) {
          startBreak()
        } else {
          isBreak.value = false
          timeLeft.value = pomodoroMinutes.value * 60
        }
      }
    }, 1000)
  }
}

const startBreak = () => {
  isBreak.value = true
  timeLeft.value = breakMinutes.value * 60
  isRunning.value = true
  isPaused.value = false
  sendNotification('开始休息', {
    body: `休息时长：${breakMinutes.value}分钟`,
    tag: 'break-start'
  });
  updateTabTitle()
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
      updateTabTitle()
      // 发送计时器状态到 Service Worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'TIMER_TICK',
          timeLeft: timeLeft.value,
          isBreak: isBreak.value
        });
      }
    } else {
      clearInterval(timer)
      isRunning.value = false
      isPaused.value = false
      isBreak.value = false
      playAudio('/static/提示音C.mp3')
      sendNotification('休息结束', {
        body: '开始新的专注吧！',
        tag: 'break-end'
      });
      timeLeft.value = pomodoroMinutes.value * 60
      updateTabTitle()
    }
  }, 1000)
}

const endTimer = () => {
  clearInterval(timer)
  isRunning.value = false
  isPaused.value = false
  if (isBreak.value) {
    isBreak.value = false
    timeLeft.value = pomodoroMinutes.value * 60
  } else {
    timeLeft.value = breakMinutes.value * 60
  }
  clearRandomSound()
  document.title = '随机番茄钟'
}

const mainActionText = computed(() => {
  if (isRunning.value && !isPaused.value) {
    return isBreak.value ? '休息中' : '暂停'
  }
  if (isPaused.value) return '继续'
  if (timeLeft.value === pomodoroMinutes.value * 60) return '开始专注'
  if (timeLeft.value === breakMinutes.value * 60) return '开始休息'
  return '继续专注'
})

const handleMainAction = () => {
  if (isRunning.value && !isPaused.value) {
    pauseTimer()
  } else if (isPaused.value) {
    resumeTimer()
  } else {
    if (timeLeft.value === breakMinutes.value * 60) {
      startBreak()
    } else {
      startTimer()
    }
  }
}

const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    notificationPermission.value = permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
  }
}

const sendNotification = (title, options = {}) => {
  if (!notificationPermission.value) return;
  
  // 如果页面不可见或开发环境，发送通知
  if (document.hidden || import.meta.env.DEV) {
    new Notification(title, {
      icon: '/static/铃声.png',
      badge: '/static/铃声.png',
      ...options
    });
  }
}

onMounted(() => {
  // 注册 Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('Service Worker registered:', registration);
    }).catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
  }

  // 监听来自 Service Worker 的消息
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'TIMER_UPDATE') {
      timeLeft.value = event.data.timeLeft;
      isBreak.value = event.data.isBreak;
      updateTabTitle();
    }
  });

  // 初始化标签页标题
  document.title = '随机番茄钟'

  // 请求通知权限
  requestNotificationPermission()
})

onUnmounted(() => {
  clearInterval(timer)
  clearRandomSound()
})
</script>