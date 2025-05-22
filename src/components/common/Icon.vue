<template>
  <i
    :class="['iconfont', `iconfont-${name}`]"
    :style="style"
  ></i>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    name: string
    size?: number
    color?: string
  }>()

  const style = computed(() => {
    const styles: Record<string, string> = {}
    if (props.size) {
      styles.fontSize = `${props.size}px`
    }
    if (props.color) {
      styles.color = props.color
    }
    return styles
  })
</script>

<style lang="scss" scoped>
  .iconfont {
    display: inline-block;
    line-height: 1;
    vertical-align: -0.125em;
  }
</style>
