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
    window.addFlags(
      windowMgr.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
        windowMgr.LayoutParams.FLAG_TURN_SCREEN_ON |
        windowMgr.LayoutParams.FLAG_KEEP_SCREEN_ON
    )
  }
}
Application.on(Application.resumeEvent, keepScreenOn)

Application.on(Application.launchEvent, ({ android }) => {
  console.log('launching')
  if (android) androidLaunchEventLocalizationHandler()
})

import Vue from 'nativescript-vue'
import EnRecipes from './components/EnRecipes.vue'
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
