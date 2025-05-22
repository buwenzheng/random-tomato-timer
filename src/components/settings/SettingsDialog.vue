<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="设置"
    width="400px"
    :close-on-click-modal="false"
    center
  >
    <el-form label-position="top">
      <el-form-item label="番茄钟时长（分钟）">
        <el-input-number
          v-model="localSettings.pomodoroMinutes"
          :min="1"
          :max="120"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="休息时长（分钟）">
        <el-input-number
          v-model="localSettings.breakMinutes"
          :min="1"
          :max="60"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="随机提示音">
        <el-switch
          v-model="localSettings.randomSoundEnabled"
          active-text="开"
          inactive-text="关"
        />
      </el-form-item>
      <template v-if="localSettings.randomSoundEnabled">
        <el-form-item label="播放次数">
          <el-input-number
            v-model="localSettings.randomSoundCount"
            :min="3"
            :max="10"
            :step="1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="持续时长">
          <el-select
            v-model="localSettings.randomSoundDuration"
            style="width: 100%"
          >
            <el-option
              :label="'10秒'"
              :value="10"
            />
            <el-option
              :label="'15秒'"
              :value="15"
            />
            <el-option
              :label="'20秒'"
              :value="20"
            />
          </el-select>
        </el-form-item>
      </template>
    </el-form>
    <KeyboardShortcuts />
    <template #footer>
      <span class="dialog-footer">
        <el-button
          type="primary"
          plain
          @click="handleReset"
          >重置</el-button
        >
        <el-button
          type="primary"
          plain
          @click="handleCancel"
          >取消</el-button
        >
        <el-button
          type="primary"
          @click="handleSave"
          >确定</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import type { TimerSettings } from '@/types/timer'
  import KeyboardShortcuts from './KeyboardShortcuts.vue'

  interface Props {
    modelValue: boolean
    settings: TimerSettings
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'save', settings: TimerSettings): void
    (e: 'reset'): void
  }>()

  const localSettings = ref<TimerSettings>({ ...props.settings })

  watch(
    () => props.settings,
    newSettings => {
      localSettings.value = { ...newSettings }
    },
    { deep: true }
  )

  const handleSave = () => {
    emit('save', localSettings.value)
    emit('update:modelValue', false)
  }

  const handleCancel = () => {
    emit('update:modelValue', false)
  }

  const handleReset = () => {
    emit('reset')
  }
</script>
