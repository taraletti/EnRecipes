export const lvMixin = {
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
    // animateInOut(dur, rev, draw) {
    //   const start = Date.now()
    //   let timer = setInterval(() => {
    //     const passed = Date.now() - start
    //     let val = passed / dur
    //     if (val > 1) val = 1
    //     draw(rev ? 1 - val : val)
    //     if (val === 1) clearInterval(timer)
    //   }, 17) // 1000ms/60fps=16.66ms => 17ms
    // },
  },
}
