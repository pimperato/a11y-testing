<template>
  <main>
    <h1>Nested interactive</h1>
    <!-- defect: a focusable <a> nested inside a focusable <button> -> nested-interactive -->
    <button type="button">Accept <a href="/">terms</a></button>
  </main>
</template>
