<template>
  <img
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="loading"
    :class="['optimized-image', className]"
    @error="handleError"
  />
</template>

<script setup lang="ts">
  defineProps<{
    src: string
    alt: string
    width?: number
    height?: number
    loading?: 'lazy' | 'eager'
    className?: string
  }>()

  const emit = defineEmits<{
    (e: 'error', error: Error): void
  }>()

  const handleError = (error: Event) => {
    emit('error', error as unknown as Error)
  }
</script>

<style lang="scss" scoped>
  .optimized-image {
    max-width: 100%;
    height: auto;
    object-fit: cover;
  }
</style>
