import { ref } from 'vue'
import type { NotificationOptions } from '@/types/timer'

export function useNotification() {
  const notificationPermission = ref(false)

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return
    }

    try {
      const permission = await Notification.requestPermission()
      notificationPermission.value = permission === "granted"
    } catch (error) {
      console.error("Error requesting notification permission:", error)
    }
  }

  const sendNotification = (title: string, options: NotificationOptions = {}) => {
    if (!notificationPermission.value) return
    
    if (document.hidden || import.meta.env.DEV) {
      new Notification(title, {
        icon: '/static/铃声.png',
        badge: '/static/铃声.png',
        ...options
      })
    }
  }

  return {
    notificationPermission,
    requestPermission,
    sendNotification
  }
} 