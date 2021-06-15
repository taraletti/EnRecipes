import Vue from 'nativescript-vue'
import store from './store'
import {
  Application,
  AndroidApplication,
  ApplicationSettings,
  Utils,
  Frame,
} from '@nativescript/core'
import { localize } from '@nativescript/localize'
import EnRecipes from './components/EnRecipes.vue'
import EditRecipe from './components/EditRecipe.vue'
import MealPlanner from './components/MealPlanner.vue'
import CookingTimer from './components/CookingTimer.vue'

// import GroceryList from './components/GroceryList.vue'

import * as utils from '~/shared/utils'

export const EvtBus = new Vue()

let renderView = EnRecipes

import CollectionView from '@nativescript-community/ui-collectionview/vue'
Vue.use(CollectionView)

import { RGridLayout, RStackLayout, RDockLayout, RLabel } from './rtl-ui'
Vue.registerElement('RGridLayout', () => RGridLayout)
Vue.registerElement('RStackLayout', () => RStackLayout)
Vue.registerElement('RDockLayout', () => RDockLayout)
Vue.registerElement('RLabel', () => RLabel)

import { myMixin } from './shared/mixins'
Vue.mixin(myMixin)

const initFrame = () => {
  const vm = store
  // MainInit
  vm.commit('setTheme', ApplicationSettings.getString('theme', 'sysDef'))
  vm.commit('initRecipes')
  vm.commit('initMealPlans')
  vm.commit('initListItems')
  vm.commit('initTimerPresets')
  if (!Object.keys(vm.state.timerSound).length) {
    let hasTimerSound = ApplicationSettings.getString('timerSound', null)
    vm.commit(
      'setTimerSound',
      hasTimerSound ? JSON.parse(hasTimerSound) : utils.getTones().defaultTone
    )
  }
  // InitFrame
  const window = Application.android.startActivity.getWindow()
  const decorView = window.getDecorView()
  utils.setBarColors(window, decorView, vm.state.theme)
  Frame.topmost().className = vm.state.theme
}
const showOverLockscreen = () => {
  let ctx = Utils.ad.getApplicationContext()
  const pm = ctx.getSystemService(android.content.Context.POWER_SERVICE)
  let isScreenOff = !pm.isInteractive()
  if (isScreenOff) {
    console.log('showOverLockscreen')
    const window = Application.android.startActivity.getWindow()
    const windowMgr = android.view.WindowManager
    const flags =
      windowMgr.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
      windowMgr.LayoutParams.FLAG_TURN_SCREEN_ON |
      windowMgr.LayoutParams.FLAG_KEEP_SCREEN_ON
    window.addFlags(flags)
  }
}
const intentListener = ({ intent, android }: any) => {
  let action = ((intent || android).getStringExtra('action') ||
    (android && android.getAction())) as string
  if (action) {
    switch (action) {
      case 'new_recipe':
        renderView = EditRecipe
        break
      case 'planner':
        renderView = MealPlanner
        break
      case 'timer':
        renderView = CookingTimer
        switch (ApplicationSettings.getNumber('isTimer', 0)) {
          case 0:
            // Closing all modals if available before navigation
            let modals = Frame.topmost()._getRootModalViews()
            for (let i = modals.length - 1; i >= 0; i--) {
              Frame.topmost()
                ._getRootModalViews()
                [i].closeModal()
            }
            Vue.navigateTo(CookingTimer as any, {
              animated: false,
            })
            ApplicationSettings.setNumber('isTimer', 1)
            break
          case 2:
            Vue.navigateBack()
            break
        }
        break
      // case 'grocery':
      //   renderView = GroceryList
      //   break
    }
  }
}

Application.on(Application.resumeEvent, () => {
  showOverLockscreen()
  if (
    utils.sysLocale() !==
    ApplicationSettings.getString('sysLocale', utils.sysLocale())
  ) {
    Frame.reloadPage()
    utils.updateLocale()
  }
})

Application.on(Application.launchEvent, (args) => {
  utils.updateLocale()
  store.commit('setRTL')
  intentListener(args)
  Application.android.on(
    AndroidApplication.activityNewIntentEvent,
    intentListener
  )
  Frame.on(Frame.loadedEvent, initFrame)
})

Application.on(Application.exitEvent, () => {
  renderView = EnRecipes
  Application.android.off(
    AndroidApplication.activityNewIntentEvent,
    intentListener
  )
})

Vue.config.silent = false

Vue.filter('L', localize)

new Vue({
  store,
  render: (h) => h('Frame', [h(renderView)]),
}).$start()
