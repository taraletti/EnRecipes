<template>
  <Page @loaded="onPageLoad" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="auto, *">
      <ListView
        colSpan="2"
        rowSpan="2"
        class="options-list"
        for="item in items"
      >
        <v-template if="$index == 0">
          <Label class="pageTitle" :text="'opts' | L" />
        </v-template>
        <v-template if="item.type == 'switch'">
          <GridLayout columns="auto, *, auto" class="option">
            <Label class="ico" :text="icon[item.icon]" />
            <StackLayout col="1" verticalAlignment="center">
              <Label :text="item.title | L" class="info" />
              <Label
                v-if="item.subTitle"
                :text="item.subTitle | L"
                class="sub"
              />
            </StackLayout>
            <Switch
              :color="item.checked ? '#ff5200' : '#adb5bd'"
              col="2"
              :checked="item.checked"
              @checkedChange="item.action"
            />
          </GridLayout>
        </v-template>
        <v-template>
          <StackLayout class="listSpace"> </StackLayout>
        </v-template>
      </ListView>
      <GridLayout
        v-show="!toast"
        row="1"
        class="appbar"
        rows="*"
        columns="auto, *"
      >
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
      </GridLayout>
      <GridLayout
        v-show="toast"
        row="1"
        colSpan="2"
        class="appbar snackBar"
        columns="*"
        @tap="toast = null"
      >
        <FlexboxLayout minHeight="48" alignItems="center">
          <Label class="title msg" :text="toast" />
        </FlexboxLayout>
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { Observable } from "@nativescript/core";
import { mapState, mapActions } from "vuex";
import { localize } from "@nativescript/localize";
import * as utils from "~/shared/utils";

export default {
  data() {
    return {
      toast: null,
    };
  },
  computed: {
    ...mapState(["icon", "shakeEnabled", "mondayFirst"]),
    items() {
      return [
        {},
        {
          type: "switch",
          icon: "shuf",
          title: "sVw",
          subTitle: "sVwInfo",
          checked: this.shakeEnabled,
          action: this.toggleShake,
        },
        {
          type: "switch",
          icon: "week",
          title: "swm",
          checked: this.mondayFirst,
          action: this.toggleFirstDay,
        },
        {},
      ];
    },
  },
  methods: {
    ...mapActions(["setShake", "setFirstDay"]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
    },
    toggleFirstDay({ object }) {
      this.setFirstDay(object.checked);
    },
    // SHAKE VIEW RANDOM RECIPE
    toggleShake({ object }) {
      let checked = object.checked;
      if (checked && !utils.hasAccelerometer()) {
        object.checked = false;
        this.toast = localize("noAccSensor");
        utils.timer(5, (val) => {
          if (!val) this.toast = val;
        });
      } else this.setShake(checked);
    },
  },
};
</script>
