<template>
  <Page @loaded="onPageLoad" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="auto, *">
      <ListView
        colSpan="2"
        rowSpan="2"
        class="options-list"
        @loaded="listViewLoad"
        for="item in items"
      >
        <v-template if="$index == 0">
          <Label class="pageTitle" :text="'opts' | L" />
        </v-template>
        <v-template if="item.type == 'switch'">
          <GridLayout columns="auto, *, auto" class="option">
            <Label class="ico" :text="icon[item.icon]" />
            <StackLayout col="1">
              <Label :text="item.title | L" class="info" />
              <Label :text="item.subTitle | L" class="sub" />
            </StackLayout>
            <Switch
              :color="item.subAction ? '#ff5200' : '#858585'"
              verticalAlignment="center"
              col="2"
              :checked="item.subAction"
              @checkedChange="item.action"
            />
          </GridLayout>
        </v-template>
        <v-template>
          <StackLayout class="listSpace"> </StackLayout>
        </v-template>
      </ListView>
      <GridLayout row="1" class="appbar" rows="*" columns="auto, *">
        <Button
          class="ico"
          :text="icon.back"
          @tap="$navigateBack()"
        />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { ApplicationSettings, Observable } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { mapState, mapActions } from "vuex";
import * as utils from "~/shared/utils";

export default {
  computed: {
    ...mapState(["icon", "shakeEnabled"]),
    items() {
      return [
        {},
        {
          type: "switch",
          icon: "shuf",
          title: "sVw",
          subTitle: "sVwInfo",
          action: this.toggleShake,
          subAction: this.shakeEnabled,
        },
        {},
      ];
    },
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
        // Toast.makeText(localize("noAccSensor"), "long").show();
      } else {
        ApplicationSettings.setBoolean("shakeEnabled", checked);
        this.setShakeAction(checked);
      }
    },
  },
};
</script>
