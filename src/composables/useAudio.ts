import { ref } from 'vue'

const randomSoundList = ['/static/提示音B.mp3', '/static/提示音C.mp3']

export function useAudio() {
  const volume = ref(100)
  const playAudio = (src: string) => {
    const audio = new Audio(src)
    audio.volume = volume.value / 100
    audio.play()
  }

  const playRandomSound = () => {
    const randomIndex = Math.floor(Math.random() * randomSoundList.length)
    playAudio(randomSoundList[randomIndex])
  }

  return {
    volume,
    playAudio,
    playRandomSound
  }
} 