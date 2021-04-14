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
import EnRecipes from './components/EnRecipes.vue'
import store from './store'

import CollectionView from '@nativescript-community/ui-collectionview/vue'
Vue.use(CollectionView)

Vue.registerElement(
  'ImageZoom',
  () => require('@triniwiz/nativescript-image-zoom').ImageZoom
)

import { lvMixin } from './shared/mixins.js'
Vue.mixin(lvMixin)

Vue.config.silent = false

Vue.filter('L', localize)

new Vue({
  store,
  render: (h) => h(EnRecipes),
}).$start()
