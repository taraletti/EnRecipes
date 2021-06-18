<template>
  <Page @loaded="pgLoad" actionBarHidden="true">
    <RGridLayout :rtl="RTL" rows="*, auto" columns="auto, *">
      <OptionsList title="opts" :items="items" />
      <GridLayout
        :hidden="toast"
        @loaded="abLoad"
        row="1"
        class="appbar rtl"
        rows="*"
        columns="auto, *"
      >
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
      </GridLayout>
      <Toast :onload="tbLoad" :toast="toast" :action="hideBar" />
      <Label rowSpan="2" class="edge hal rtl" @swipe="swipeBack" />
      <Label
        rowSpan="2"
        colSpan="2"
        class="edge har rtl f"
        @swipe="swipeBack"
      />
    </RGridLayout>
  </Page>
</template>

<script>
import { Observable } from "@nativescript/core";
import { mapState, mapActions } from "vuex";
import { localize } from "@nativescript/localize";
import OptionsList from "../sub/OptionsList";
import Toast from "../sub/Toast";
import * as utils from "~/shared/utils";

export default {
  components: { OptionsList, Toast },
  data() {
    return {
      appbar: null,
      toastbar: null,
      toast: null,
    };
  },
  computed: {
    ...mapState(["icon", "shake", "RTL", "edgeSwipe", "awakeViewer"]),
    items() {
      return [
        {},
        {
          type: "switch",
          icon: "shuf",
          title: "sVw",
          subTitle: localize("sVwInfo"),
          checked: !!this.shake,
          action: this.toggleShake,
        },
        {
          type: "switch",
          icon: "awake",
          title: "ksavr",
          subTitle: localize("ksavrInfo"),
          checked: !!this.awakeViewer,
          action: this.toggleAwake,
        },
        {
          type: "switch",
          icon: "edge",
          title: "esgb",
          subTitle: localize("esgbInfo"),
          checked: !!this.edgeSwipe,
          action: this.toggleSwipe,
        },
        {},
      ];
    },
  },
  methods: {
    ...mapActions(["setShake", "toggleEdgeSwipe", "toggleAwakeViewer"]),
    pgLoad({ object }) {
      object.bindingContext = new Observable();
    },
    abLoad({ object }) {
      this.appbar = object;
    },
    tbLoad({ object }) {
      this.toastbar = object;
    },

    toggleShake() {
      let checked = this.shake;
      if (checked && !utils.hasAccelerometer())
        this.showToast(localize("noAccSensor"));
      else this.setShake(+!checked);
    },
    toggleSwipe() {
      this.toggleEdgeSwipe(+!this.edgeSwipe);
    },
    toggleAwake() {
      this.toggleAwakeViewer(+!this.awakeViewer);
    },

    showToast(data) {
      this.animateBar(this.appbar, 0).then(() => {
        this.toast = data;
        this.animateBar(this.toastbar, 1, 1);
        utils.timer(5, (val) => !val && this.hideBar());
      });
    },
    hideBar() {
      this.animateBar(this.toastbar, 0).then(() => {
        this.toast = null;
        this.animateBar(this.appbar, 1);
      });
    },
  },
};
</script>
