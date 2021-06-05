import {
  Application,
  AndroidApplication,
  ApplicationSettings,
  Utils,
  Device,
  Color,
  Frame,
} from '@nativescript/core'
import {
  localize,
  androidLaunchEventLocalizationHandler,
} from '@nativescript/localize'
import Vue from 'nativescript-vue'
import EnRecipes from './components/EnRecipes.vue'
import EditRecipe from './components/EditRecipe.vue'
import MealPlanner from './components/MealPlanner.vue'
import CookingTimer from './components/CookingTimer.vue'
import GroceryList from './components/GroceryList.vue'
import store from './store'
import * as utils from '~/shared/utils'

export const EventBus = new Vue()

let renderView: any = EnRecipes

import CollectionView from '@nativescript-community/ui-collectionview/vue'
Vue.use(CollectionView)
import { StackLayout, GridLayout, DockLayout } from '@nativescript-rtl/ui'
Vue.registerElement('RStackLayout', () => StackLayout)
Vue.registerElement('RGridLayout', () => GridLayout)
Vue.registerElement('RDockLayout', () => DockLayout)

import { myMixin } from './shared/mixins'
Vue.mixin(myMixin)

const initFrame = () => {
  const vm = store

  //MAIN INIT
  vm.commit('setTheme', ApplicationSettings.getString('appTheme', 'sysDef'))
  if (!vm.state.recipes.length) vm.commit('initRecipes')
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

  // INIT FRAME
  const View = android.view.View as any
  const window = Application.android.startActivity.getWindow()
  const decorView = window.getDecorView()
  let sdkv = parseInt(Device.sdkVersion)
  function setColors(color) {
    window.setStatusBarColor(new Color(color).android)
    sdkv >= 27 && window.setNavigationBarColor(new Color(color).android)
  }
  switch (vm.state.appTheme) {
    case 'Light':
      setColors('#f1f3f5')
      break
    case 'Dark':
      setColors('#212529')
      break
    default:
      setColors('#000000')
      break
  }
  if (sdkv >= 27)
    decorView.setSystemUiVisibility(
      vm.state.appTheme == 'Light'
        ? View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR |
            View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        : View.SYSTEM_UI_FLAG_DARK_STATUS_BAR |
            View.SYSTEM_UI_FLAG_DARK_NAVIGATION_BAR
    )
  else
    decorView.setSystemUiVisibility(
      vm.state.appTheme == 'Light'
        ? View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
        : View.SYSTEM_UI_FLAG_DARK_STATUS_BAR
    )
  Frame.topmost().className = store.state.appTheme
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
  console.log(intent, android)
  let action = ((intent || android).getStringExtra('action') ||
    (android && android.getAction())) as string

  if (action) {
    console.log(action)
    switch (action) {
      case 'new_recipe':
        renderView = EditRecipe
        break
      case 'planner':
        renderView = MealPlanner
        break
      case 'timer':
        renderView = CookingTimer
        Vue.navigateTo(CookingTimer as any, {
          animated: false,
        })
        break
      case 'grocery':
        renderView = GroceryList
        break
    }
  }
}

Application.on(Application.resumeEvent, (args) => {
  console.log('App Resume')
  showOverLockscreen()
})

Application.on(Application.launchEvent, (args) => {
  console.log('App Launch')
  console.log('RTL', store.state.RTL)
  store.commit('setRTL')
  if (args.android) {
    androidLaunchEventLocalizationHandler()
    intentListener(args)
  }
  Application.android.on(
    AndroidApplication.activityNewIntentEvent,
    intentListener
  )
  Frame.on(Frame.loadedEvent, initFrame)
})

Application.on(Application.exitEvent, () => {
  console.log('App Exit')
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
