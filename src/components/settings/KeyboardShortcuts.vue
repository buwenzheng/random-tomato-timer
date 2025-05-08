<template>
  <div class="keyboard-shortcuts">
    <h3>键盘快捷键</h3>
    <div class="shortcuts-list">
      <div class="shortcut-item">
        <span class="key">空格</span>
        <span class="description">开始/暂停/继续计时</span>
      </div>
      <div class="shortcut-item">
        <span class="key">Esc</span>
        <span class="description">结束当前计时</span>
      </div>
      <div class="shortcut-item">
        <span class="key">S</span>
        <span class="description">打开/关闭设置</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 无需额外的逻辑
</script>

<style lang="scss" scoped>
.keyboard-shortcuts {
  margin-top: 20px;
  padding: 15px;
  background-color: var(--el-bg-color-page);
  border-radius: 8px;

  h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: var(--el-text-color-primary);
  }

  .shortcuts-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .shortcut-item {
    display: flex;
    align-items: center;
    gap: 10px;

    .key {
      padding: 4px 8px;
      background-color: var(--el-bg-color);
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
      color: var(--el-text-color-primary);
    }

    .description {
      color: var(--el-text-color-regular);
      font-size: 14px;
    }
  }
}
</style>
