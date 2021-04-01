import {
  localize,
  androidLaunchEventLocalizationHandler,
} from '@nativescript/localize'
import { on, launchEvent } from '@nativescript/core/application'
on(launchEvent, (args) => {
  if (args.android) {
    androidLaunchEventLocalizationHandler()
  }
})
import Vue from 'nativescript-vue'
import EnRecipes from './components/EnRecipes'
import store from './store'

import CollectionView from '@nativescript-community/ui-collectionview/vue'
Vue.use(CollectionView)

import { lvMixin } from './shared/mixins.js'
Vue.mixin(lvMixin)

Vue.config.silent = TNS_ENV === 'production'

Vue.filter('L', localize)

new Vue({
  store,
  render: (h) => h(EnRecipes),
}).$start()
