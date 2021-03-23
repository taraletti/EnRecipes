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
import App from './components/App'
import store from './store'

import { installMixins } from '@nativescript-community/ui-material-core'
installMixins()

import { install } from '@nativescript-community/ui-drawer'
install()

import DrawerPlugin from '@nativescript-community/ui-drawer/vue'
Vue.use(DrawerPlugin)

import CollectionView from '@nativescript-community/ui-collectionview/vue';
Vue.use(CollectionView);

import ButtonPlugin from '@nativescript-community/ui-material-button/vue'
Vue.use(ButtonPlugin)

import ActivityIndicatorPlugin from '@nativescript-community/ui-material-activityindicator/vue'
Vue.use(ActivityIndicatorPlugin)

import ProgressPlugin from '@nativescript-community/ui-material-progress/vue'
Vue.use(ProgressPlugin)

import { CheckBox } from '@nstudio/nativescript-checkbox'
Vue.registerElement('CheckBox', () => CheckBox, {
  model: {
    prop: 'checked',
    event: 'checkedChange',
  },
})

Vue.config.silent = TNS_ENV === 'production'

Vue.filter('L', localize)

new Vue({
  store,
  render: (h) => h('frame', [h(App)]),
}).$start()
