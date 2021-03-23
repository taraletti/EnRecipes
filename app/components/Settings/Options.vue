<template>
  <Page @loaded="onPageLoad">
    <ActionBar flat="true">
      <GridLayout rows="*" columns="auto, *">
        <MDButton
          class="er left"
          variant="text"
          :text="icon.back"
          automationText="Back"
          @tap="$navigateBack()"
          col="0"
        />
        <Label class="title tb" :text="'opts' | L" col="1" />
      </GridLayout>
    </ActionBar>
    <StackLayout class="main-container">
      <GridLayout rows="auto" columns="auto, *, auto" class="option mdr">
        <Label
          col="0"
          verticalAlignment="center"
          class="er"
          :text="icon.shuf"
        />
        <StackLayout col="1">
          <Label :text="'sVw' | L" textWrap="true" />
          <Label :text="`sVwInfo` | L" class="info" textWrap="true" />
        </StackLayout>
        <Switch
          :color="shakeEnabled ? '#ff5200' : '#858585'"
          verticalAlignment="center"
          col="2"
          :checked="shakeEnabled"
          @checkedChange="toggleShake"
        />
      </GridLayout>
    </StackLayout>
  </Page>
</template>

<script>
import { ApplicationSettings, Observable } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { mapState, mapActions } from "vuex";
import * as Toast from "nativescript-toast";
import * as utils from "~/shared/utils";

export default {
  computed: {
    ...mapState(["icon", "shakeEnabled"]),
  },
  methods: {
    ...mapActions(["setShakeAction"]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
    },
    // SHAKE VIEW RANDOM RECIPE
    toggleShake(args) {
      let checked = args.object.checked;
      if (checked && !utils.hasAccelerometer()) {
        args.object.checked = false;
        Toast.makeText(localize("noAccSensor"), "long").show();
      } else {
        ApplicationSettings.setBoolean("shakeEnabled", checked);
        this.setShakeAction(checked);
      }
    },
  },
};
</script>
