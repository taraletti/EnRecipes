declare const android: any
import { CoreTypes } from '@nativescript/core'
import { localize } from '@nativescript/localize'
const Intl = require('nativescript-intl')

export const myMixin = {
  methods: {
    transparentPage({ object }) {
      object._dialogFragment
        .getDialog()
        .getWindow()
        .setBackgroundDrawable(
          new android.graphics.drawable.ColorDrawable(
            android.graphics.Color.TRANSPARENT
          )
        )
    },
    animateBar(obj, op) {
      if (op) {
        obj.translateY = 64
        obj.opacity = 0
      }
      return obj.animate({
        opacity: op,
        translate: { x: 0, y: op ? 0 : 64 },
        duration: 200,
        curve: CoreTypes.AnimationCurve.ease,
      })
    },
    totalTime(prepTime, cookTime) {
      let t1 = prepTime.split(':')
      let t2 = cookTime.split(':')
      let minutes = parseInt(t1[1]) + parseInt(t2[1])
      let m = minutes % 60
      let h = parseInt(t1[0]) + parseInt(t2[0]) + Math.floor(minutes / 60)
      let hr = localize('hr')
      let min = localize('min')
      let mins = h * 60 + m
      h = h && this.getLocaleN(h)
      m = m && this.getLocaleN(m)
      return {
        time: h ? (m ? `${h} ${hr} ${m} ${min}` : `${h} ${hr}`) : `${m} ${min}`,
        duration: `${mins}`,
      }
    },
    setGravity(args) {
      ;(args.object || args).android.setGravity(this.RTL ? 5 : 3)
    },
    getLocaleN(n) {
      return new Intl.NumberFormat(null).format(n)
    },
  },
}
