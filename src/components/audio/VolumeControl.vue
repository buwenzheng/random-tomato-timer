<template>
  <el-popover placement="bottom" width="160" trigger="hover" popper-class="volume-popover">
    <template #reference>
      <span class="iconfont iconfont-volume"></span>
    </template>
    <div style="padding: 8px 0">
      <el-slider
        v-model="modelValue"
        :min="0"
        :max="100"
        :step="1"
        show-tooltip
        style="width: 120px"
        @change="$emit('change')"
      />
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  volume: number
}>()

const emit = defineEmits<{
  (e: 'update:volume', value: number): void
  (e: 'change'): void
}>()

const modelValue = computed({
  get: () => props.volume,
  set: (value: number) => emit('update:volume', value)
})
</script>

<style lang="scss" scoped>
.iconfont-volume {
  font-size: 28px;
  opacity: 0.5;
  cursor: pointer;
  color: #333;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.7;
  }
}
</style>
