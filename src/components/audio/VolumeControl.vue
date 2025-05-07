<template>
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
        :model-value="volume"
        @update:model-value="$emit('update:volume', $event)"
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
defineProps<{
  volume: number
}>()

defineEmits<{
  (e: 'update:volume', value: number): void
  (e: 'change'): void
}>()
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