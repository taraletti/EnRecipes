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
          <Label class="pageTitle" :text="'Settings' | L" />
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
        <v-template if="item.type == 'list'">
          <GridLayout
            columns="auto, *"
            class="option"
            @touch="touch($event, item.action)"
          >
            <Label class="ico" :text="icon[item.icon]" />
            <StackLayout col="1">
              <Label :text="item.title | L" class="info" />
              <Label :text="item.subTitle" class="sub" />
            </StackLayout>
          </GridLayout>
        </v-template>
        <v-template>
          <StackLayout class="listSpace"> </StackLayout>
        </v-template>
      </ListView>
      <GridLayout row="1" class="appbar" rows="*" columns="auto, *">
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { Observable } from "@nativescript/core";
import { mapState, mapActions } from "vuex";
import { localize } from "@nativescript/localize";
import ActionDialog from "../modal/ActionDialog.vue";
import * as utils from "~/shared/utils";

export default {
  computed: {
    ...mapState(["icon", "timerDelay", "timerSound", "timerVibrate"]),
    items() {
      return [
        {},
        {
          type: "list",
          icon: "delay",
          title: "dlyDur",
          subTitle: this.timerDelay,
          action: this.showDelayList,
        },
        {
          type: "list",
          icon: "sound",
          title: "tmrSnd",
          subTitle: this.timerSound.title,
          action: this.showSoundsList,
        },
        {
          type: "switch",
          icon: "vibrate",
          title: "tmrvbrt",
          checked: this.timerVibrate,
          action: this.toggleTimerVibrate,
        },
        {},
      ];
    },
  },
  methods: {
    ...mapActions(["setTimerDelay", "setTimerSound", "setTimerVibrate"]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
    },
    toggleTimerVibrate({ object }) {
      this.setTimerVibrate(object.checked);
    },
    showDelayList() {
      let list = [
        ...Array.from(Array(4), (_, x) => x + 1),
        ...Array.from(Array(6), (_, x) => (x + 1) * 5),
      ].map(
        (e, i) => `${e} ${i == 0 ? localize("minute") : localize("minutes")}`
      );
      this.$showModal(ActionDialog, {
        props: {
          title: "dlyDur",
          list,
        },
      }).then((dur) => dur && this.setTimerDelay(dur));
    },
    showSoundsList() {
      let tones = utils.getTones();
      this.$showModal(ActionDialog, {
        props: {
          title: "tmrSnd",
          list: tones.map((e) => e.title),
        },
      }).then(
        (tone) =>
          tone &&
          tone !== this.timerSound.title &&
          this.setTimerSound(tones.filter((e) => e.title === tone)[0])
      );
    },

    // HELPERS
    touch({ object, action }, method) {
      object.className = action.match(/down|move/) ? "option fade" : "option";
      if (action == "up") method();
    },
  },
};
</script>
