import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faChevronDown,
  faFireFlameCurved,
  faHome,
  faBolt,
  faGear,
  faBackward,
  faForward,
  faPlay,
  faStop,
  faRotateLeft,
  faVolumeHigh,
  faGaugeHigh,
  faPlus,
  faMinus,
} from '@fortawesome/free-solid-svg-icons'
import App from './App.vue'
import router from './router'
import { Tooltip } from 'primevue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      cssLayer: {
        name: 'primevue',
        order: 'tailwind-base, primevue, tailwind-utilities',
      },
    },
  },
})

library.add(
  faChevronDown,
  faFireFlameCurved,
  faHome,
  faBolt,
  faGear,
  faBackward,
  faForward,
  faPlay,
  faStop,
  faRotateLeft,
  faVolumeHigh,
  faGaugeHigh,
  faPlus,
  faMinus,
)
app.component('font-awesome-icon', FontAwesomeIcon)
app.directive('tooltip', Tooltip)

app.mount('#app')
