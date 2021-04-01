export const lvMixin = {
  methods: {
    listViewLoad(args) {
      let e = args.object.android
      e.setSelector(new android.graphics.drawable.StateListDrawable())
      e.setDivider(null)
      e.setDividerHeight(0)
    },
    animateInOut(dur, rev, draw) {
      const start = Date.now()
      let timer = setInterval(() => {
        const passed = Date.now() - start
        let val = passed / dur
        if (val > 1) val = 1
        draw(rev ? 1 - val : val)
        if (val === 1) clearInterval(timer)
      }, 17) // 1000ms/60fps=16.66ms => 17ms
    },
  },
}
