import {
  localize,
  androidLaunchEventLocalizationHandler,
} from '@nativescript/localize'
import { Application, AndroidApplication, Utils } from '@nativescript/core'

const keepScreenOn = () => {
  let ctx = Utils.ad.getApplicationContext()
  const pm = ctx.getSystemService(android.content.Context.POWER_SERVICE)
  let isScreenOff = !pm.isInteractive()
  if (isScreenOff) {
    console.log('keepScreenOn')
    const window = Application.android.startActivity.getWindow()
    const windowMgr = android.view.WindowManager
    const flags =
      windowMgr.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
      windowMgr.LayoutParams.FLAG_TURN_SCREEN_ON |
      windowMgr.LayoutParams.FLAG_KEEP_SCREEN_ON
    window.addFlags(flags)
    function clearFlags(args) {
      args.cancel = true
      window.clearFlags(flags)
      Application.android.off(
        AndroidApplication.activityBackPressedEvent,
        clearFlags
      )
    }
    Application.android.on(
      AndroidApplication.activityBackPressedEvent,
      clearFlags
    )
  }
}
Application.on(Application.resumeEvent, keepScreenOn)

Application.on(Application.launchEvent, (args) => {
  console.log('launching')
  if (args.android) {
    androidLaunchEventLocalizationHandler()
    intentListener(args)
  }
})

import Vue from 'nativescript-vue'
import EnRecipes from './components/EnRecipes.vue'
import CookingTimer from './components/CookingTimer.vue'
import store from './store'

export const EventBus = new Vue()

import CollectionView from '@nativescript-community/ui-collectionview/vue'
Vue.use(CollectionView)

import { lvMixin } from './shared/mixins'
Vue.mixin(lvMixin)

Vue.config.silent = false

Vue.filter('L', localize)

new Vue({
  store,
  render: (h) => h(EnRecipes),
}).$start()

const intentListener = ({ intent, android }: any) => {
  let ct = 'CookingTimer'
  let action = (intent || android).getStringExtra('action')
  console.log('calling: ', action)
  if (action == 'open_timer' && store.state.currentComponent != ct) {
    let openTimer = setInterval(() => {
      let comp = store.state.currentComponent
      if (comp == ct) clearInterval(openTimer)
      else {
        if (comp == 'CTSettings') Vue.navigateBack()
        else {
          Vue.navigateTo(CookingTimer)
          store.commit('setComponent', 'CookingTimer')
        }
      }
    }, 250)
  }
}
Application.on(Application.launchEvent, () => {
  Application.android.on(
    AndroidApplication.activityNewIntentEvent,
    intentListener
  )
})
Application.on(Application.exitEvent, () => {
  store.commit('setComponent', 'EnRecipes')
  Application.android.off(
    AndroidApplication.activityNewIntentEvent,
    intentListener
  )
})
