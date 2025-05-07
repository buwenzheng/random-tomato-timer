import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAudioStore = defineStore('audio', () => {
  const volume = ref(100)
  const audioContext = ref<AudioContext | null>(null)
  const audioBuffers = ref<Map<string, AudioBuffer>>(new Map())

  const initAudio = async (): Promise<AudioContext> => {
    if (!audioContext.value) {
      audioContext.value = new AudioContext()
    }
    return audioContext.value
  }

  const loadAudio = async (name: string, url: string) => {
    const context = await initAudio()

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await context.decodeAudioData(arrayBuffer)
      audioBuffers.value.set(name, audioBuffer)
    } catch (error) {
      console.error('Error loading audio:', error)
    }
  }

  const playAudio = async (name: string) => {
    const context = await initAudio()

    const buffer = audioBuffers.value.get(name)
    if (!buffer) {
      console.error('Audio not found:', name)
      return
    }

    const source = context.createBufferSource()
    const gainNode = context.createGain()
    
    source.buffer = buffer
    gainNode.gain.value = volume.value / 100
    
    source.connect(gainNode)
    gainNode.connect(context.destination)
    
    source.start(0)
  }

  const setVolume = (value: number) => {
    volume.value = value
  }

  return {
    volume,
    initAudio,
    loadAudio,
    playAudio,
    setVolume
  }
}) 