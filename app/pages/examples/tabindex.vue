<template>
  <main>
    <h1>Tabindex</h1>
    <!-- defect: positive tabindex hijacks the natural focus order -> tabindex -->
    <div tabindex="5">Focusable element with a positive tabindex.</div>
  </main>
</template>
