<template>
<Page>
  <StackLayout class="dialogContainer" :class="appTheme">
    <Label class="bx dialogIcon" backgroundColor="#adb5bd" :color="iconColor" :text="icon[helpIcon]" />
    <Label class="dialogTitle orkm" :text="`${title}` | L" textWrap='true' />
    <StackLayout class="dialogInput">
      <TextField @loaded="focusField" :hint="hint ? hint : ''" v-model="category" autocapitalizationType="words" @returnPress="$modal.close(category)" />
    </StackLayout>
    <GridLayout rows="auto" columns="*, auto, auto" class="actionsContainer">
      <MDButton :rippleColor="rippleColor" variant="text" col="1" class="action orkm" :text="'cBtn' | L" @tap="$modal.close(false)" />
      <MDButton :rippleColor="rippleColor" variant="text" col="2" class="action orkm" :text="`${action}` | L" @tap="$modal.close(category)" />
    </GridLayout>
  </StackLayout>
</Page>
</template>

<script>
import {
  Application,
  Utils
}
from "@nativescript/core"
import {
  localize
}
from '@nativescript/localize'
import {
  mapState
}
from "vuex"
export default {
  props: [ "title", "hint", "text", "action", "helpIcon" ],
  data() {
    return {
      category: null,
    }
  },
  computed: {
    ...mapState( [ "icon" ] ),
    appTheme() {
      return Application.systemAppearance()
    },
    isLightMode() {
      return this.appTheme == "light"
    },
    rippleColor() {
      return this.isLightMode ? "rgba(134,142,150,0.2)" : "rgba(206,212,218,0.1)"
    },
    iconColor() {
      return this.isLightMode ? "#f1f3f5" : "#212529"
    },
  },
  methods: {
    focusField( args ) {
      args.object.focus()
      setTimeout( ( e ) => Utils.ad.showSoftInput( args.object.android ), 1 )
    },
  },
  mounted() {
    if ( this.text ) {
      this.category = localize( this.text )
    }
  },
}
</script>
