import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { TrackerExtend, createVueDirectives }  from '@lib/index'

const app = createApp(App);

const {
    tracker,
    vLogParams,
    vLogClickAble,
    vLogDisplay,
} = createVueDirectives({ container: '#app' })
tracker.on((e) => {
    console.log('display', e, e.params)
})
app.directive('logParams', vLogParams)
app.directive('logClickAble', vLogClickAble)
app.directive('log-display', vLogDisplay)
// tracker.bindEvents(document.body)

app.mount('#app')


