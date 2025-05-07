import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Home from './Home.vue'

describe('Home.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Home)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('初始时显示默认倒计时', () => {
    expect(wrapper.find('.timer-display').text()).toBe('25:00')
  })

  it('可以切换番茄钟时长', async () => {
    const select = wrapper.find('select')
    await select.setValue('50')
    expect(wrapper.vm.pomodoroMinutes).toBe(50)
    expect(wrapper.find('.timer-display').text()).toBe('50:00')
  })

  it('点击开始后按钮变为禁用', async () => {
    const startBtn = wrapper.find('button')
    await startBtn.trigger('click')
    expect(startBtn.attributes('disabled')).toBeDefined()
  })

  it('结束按钮重置倒计时', async () => {
    // 开始
    await wrapper.find('button').trigger('click')
    // 结束
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.find('.timer-display').text()).toBe('25:00')
  })

  it('开启随机提示音后，相关选项可见', async () => {
    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setValue(true)
    expect(wrapper.find('select[v-model="randomSoundDuration"]').exists()).toBe(true)
  })

  it('倒计时结束后自动重置', async () => {
    wrapper.vm.timeLeft = 1
    await wrapper.find('button').trigger('click')
    await new Promise(r => setTimeout(r, 1100))
    expect(wrapper.vm.isRunning).toBe(false)
    expect(wrapper.find('.timer-display').text()).toBe('00:00')
  })

  it('随机提示音开始和结束时会调用音频播放', async () => {
    const playAudio = vi.spyOn(wrapper.vm, 'playAudio')
    wrapper.vm.randomSoundEnabled = true
    wrapper.vm.isRunning = true
    wrapper.vm.timeLeft = 100
    wrapper.vm.scheduleNextRandomSound()
    // 模拟随机提示音触发
    wrapper.vm.startRandomSound()
    expect(playAudio).toHaveBeenCalledWith('/static/提示音A.mp3')
  })
}) 