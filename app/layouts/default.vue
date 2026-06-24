<template>
  <div class="layout">
    <div class="layout-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

.layout-content {
  width: 100%;
  max-width: 64rem;
}
</style>
