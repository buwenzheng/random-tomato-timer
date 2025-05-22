<template>
  <nav class="nav-bar">
    <router-link
      to="/"
      class="nav-link"
      >主页</router-link
    >
    <router-link
      to="/stats"
      class="nav-link"
      >统计</router-link
    >
  </nav>
</template>

<style scoped>
  .nav-bar {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-background-soft);
  }

  .nav-link {
    color: var(--color-text);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .nav-link:hover {
    background: var(--color-background-mute);
  }

  .router-link-active {
    background: var(--color-background-mute);
    font-weight: bold;
  }
</style>
