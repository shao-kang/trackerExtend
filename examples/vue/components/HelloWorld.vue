

<template>
  <div v-log-params:aaa="'fsadsafds'">

    <div v-log-params="{name: 'hello', age: 18}">
      <div v-log-click-able>
        {{ logParams }}
        <div v-log-display>
          <div v-log-params="getParams">hello world</div>
        </div>
      </div>
    </div>
    <canvas @click="pick" ref="canvas" id="canvas" width="300" height="227"></canvas>
    <div>position: x:{{ clickObj.x }}, y: {{ clickObj.y }}</div> 
    <div class="color-cell" id="hovered-color" :style="`background: ${clickObj.color} ;`"> color: {{ clickObj.color }} </div>
    <input type="text" v-model="clickObj.x" />
    <input type="text" v-model="clickObj.y" />
    <button @click="submit">pick</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, watch } from 'vue'
const props = defineProps({
  imgs: {
    type: Array,
    default: () => ["https://mdn.github.io/dom-examples/canvas/pixel-manipulation/assets/rhino.jpg"]
  },
  // position: {
  //   type: Object,
  //   default: () => ({
  //     x: 0,
  //     y: 0
  //   })
  // }
})

const logParams = ref()
const getParams = (params) => {
  logParams.value = params

  
}
const position = defineModel('position', {required: false, default: () => ({x: 0, y: 0})})
watch(() => position.value, (newVal, oldVal) => {
  clickObj.value.x = newVal.x
  clickObj.value.y = newVal.y
  submit()
}, {
  deep: true
})

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx
const clickObj = ref({
  x: 0,
  y: 0,
  color: ''
})
const submit = () => {
  var pixel = ctx.getImageData(clickObj.value.x, clickObj.value.y, 1, 1);
  var data = pixel.data;

  clickObj.value.color  = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
}


const  pick = (event) => {
  var x = event.offsetX;
  var y = event.offsetY;
  console.log(x, y);
  var pixel = ctx.getImageData(x, y, 1, 1);
  var data = pixel.data;

  const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
  clickObj.value.color = rgba;
  position.value.x = x;
  position.value.y = y;
  clickObj.value.x = x;
  clickObj.value.y = y;
}
const drawImage = async (url) => {
  await new Promise((resolve, reject) => {
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url
    
    ctx = canvas.value?.getContext("2d") as CanvasRenderingContext2D;
    ctx.comp
    img.onload = function () {
      ctx.drawImage(img, 0, 0);
      resolve(void 0);
  };
  });
  
} 
const list = [
  "source-over",
  "source-in",
  "source-out",
  "source-atop",
  "destination-over",
  "destination-in",
  "destination-out",
  "destination-atop",
  "lighter",
  "copy",
  "xor",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
]
onMounted(async () => {
  for(let i = 0; i < props.imgs.length; i++) {
    await drawImage(props.imgs[i])
    ctx.globalCompositeOperation = list[3];
  }
  

})



</script>

<style scoped>
.read-the-docs {
  color: #888;
}
#canvas {
  position: relative;
}
</style>
