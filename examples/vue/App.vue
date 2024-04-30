<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div data-log-params='{"type": "ss"}'  >
    <img data-clickable data-log-xxx-jj="ddd"  src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    <HelloWorld data-log-params-key="1" v-model:position="position" msg="Vite + Vue" />
    <HelloWorld data-log-params-key="2"   v-model:position="position" msg="Vite + Vue" :imgs="[ 'https://p1.ssl.qhimg.com/t0142b2eacdc2478083.png']" />
    <HelloWorld data-log-params-key="3"  v-model:position="position" msg="Vite + Vue" :imgs="['https://mdn.github.io/dom-examples/canvas/pixel-manipulation/assets/rhino.jpg', 'https://p1.ssl.qhimg.com/t0142b2eacdc2478083.png']" />
    <HelloWorld data-log-params-key="4"  v-model:position="position" msg="Vite + Vue" :imgs="['https://p1.ssl.qhimg.com/t0142b2eacdc2478083.png', 'https://p1.ssl.qhimg.com/t0142b2eacdc2478083.png']" />
    
  </div>
  
</template>
<script lang="ts">
import { ref } from 'vue'
const position = ref({ x: 0, y: 0 })
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
