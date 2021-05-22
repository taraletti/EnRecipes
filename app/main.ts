import {
  localize,
  androidLaunchEventLocalizationHandler,
} from '@nativescript/localize'
import { on, launchEvent } from '@nativescript/core/application'

on(launchEvent, ({ android }) => {
  if (android) androidLaunchEventLocalizationHandler()
})

import Vue from 'nativescript-vue'
import EnRecipes from './components/EnRecipes.vue'
import store from './store'

export const EventBus = new Vue()

import CollectionView from '@nativescript-community/ui-collectionview/vue'
Vue.use(CollectionView)

import { lvMixin } from './shared/mixins.js'
Vue.mixin(lvMixin)

Vue.config.silent = false

Vue.filter('L', localize)

new Vue({
  store,
  render: (h) => h(EnRecipes),
}).$start()
