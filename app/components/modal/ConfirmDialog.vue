<template>
<Page>
  <StackLayout class="dialogContainer" :class="appTheme">
    <Label class="er dialogIcon" :backgroundColor="bgColor" :color="iconColor" :text="icon[helpIcon]" />
    <Label class="dialogTitle orkm" :text="`${title}` | L" textWrap="true" />
    <Label v-if="description" class="dialogDescription" :text="description" textWrap="true" />
    <GridLayout rows="auto" columns="*, auto, auto" class="actionsContainer">
      <MDButton v-if="cancelButtonText" :rippleColor="rippleColor" variant="text" col="1" class="action orkm" :text="`${cancelButtonText}` | L" @tap="$modal.close(false)" />
      <MDButton :rippleColor="rippleColor" variant="text" col="2" class="action orkm" :text="`${okButtonText}` | L" @tap="$modal.close(true)" />
    </GridLayout>
  </StackLayout>
</Page>
</template>

<script>
import {
  Application
}
from "@nativescript/core"
import {
  mapState
}
from "vuex"
export default {
  props: [ "title", "description", "cancelButtonText", "okButtonText", "helpIcon", "bgColor" ],
  computed: {
    ...mapState( [ "icon" ] ),
    appTheme() {
      return Application.systemAppearance()
    },
    isLightMode() {
      return this.appTheme == "light"
    },
    rippleColor() {
      return "rgba(133,133,133,0.2)"
    },
    iconColor() {
      return this.isLightMode ? "#f0f0f0" : "#1A1A1A"
    },
  },
}
</script>
