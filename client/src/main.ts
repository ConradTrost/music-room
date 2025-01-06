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
  faBars,
  faEllipsisV,
} from '@fortawesome/free-solid-svg-icons'
import { Tooltip } from 'primevue'
import ToastService from 'primevue/toastservice'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      cssLayer: {
        name: 'primevue',
        order: 'tailwind-base, tailwind-components, primevue, tailwind-utilities',
      },
    },
  },
})
app.use(ToastService)

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
  faBars,
  faEllipsisV,
)
app.component('font-awesome-icon', FontAwesomeIcon)
app.directive('tooltip', Tooltip)

app.mount('#app')
