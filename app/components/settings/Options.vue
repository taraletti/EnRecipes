<template>
  <Page @loaded="onPageLoad" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="auto, *">
      <OptionsList title="opts" :items="items" />
      <GridLayout
        v-show="!toast"
        row="1"
        class="appbar"
        rows="*"
        columns="auto, *"
      >
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
      </GridLayout>
      <Toast :toast="toast" :action="(toast = null)" />
    </GridLayout>
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
      toast: null,
    };
  },
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
          checked: this.shakeEnabled,
          action: this.toggleShake,
        },
        {},
      ];
    },
  },
  methods: {
    ...mapActions(["setShake"]),
    onPageLoad({ object }) {
      object.bindingContext = new Observable();
    },

    // SHAKE VIEW RANDOM RECIPE
    toggleShake() {
      let checked = this.shakeEnabled;
      if (checked && !utils.hasAccelerometer()) {
        this.toast = localize("noAccSensor");
        utils.timer(5, (val) => {
          if (!val) this.toast = val;
        });
      } else this.setShake(!checked);
    },
  },
};
</script>
