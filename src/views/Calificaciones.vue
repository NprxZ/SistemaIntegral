<template>
  <div class="test-view">
    <h1>Vista calificaciones</h1>
    <p>Si ves este texto, la ruta está configurada correctamente.</p>
  </div>
</template>

<script setup>
// no necesitas lógica, pero aquí podrías colocar console.log
console.log('🔧 Test.vue montado correctamente')
</script>

<style scoped>
.test-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #111;
  color: #fff;
  font-family: Arial, sans-serif;
}
</style>