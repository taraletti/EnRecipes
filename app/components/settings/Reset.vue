<template>
  <Page @loaded="onPageLoad" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="auto, *">
      <OptionsList title="rest" :items="items" :action="resetListItems" />
      <GridLayout
        :hidden="toast"
        row="1"
        class="appbar"
        @loaded="onAppBarLoad"
        columns="auto, *"
      >
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
      </GridLayout>
      <Toast :toast="toast" :action="hideToast" />
    </GridLayout>
  </Page>
</template>

<script>
import { Observable, CoreTypes } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { mapState, mapActions } from "vuex";
import * as utils from "~/shared/utils";
import OptionsList from "../sub/OptionsList";
import Toast from "../sub/Toast";
export default {
  components: { OptionsList, Toast },
  data() {
    return {
      toast: null,
      appbar: null,
    };
  },
  computed: {
    ...mapState(["icon"]),
    items() {
      return [
        {},
        {
          type: "list",
          icon: "reset",
          title: "restCuiL",
          data: "cuisines",
        },
        {
          type: "list",
          icon: "reset",
          title: "restCatL",
          data: "categories",
        },
        {
          type: "list",
          icon: "reset",
          title: "restYUL",
          data: "yieldUnits",
        },
        {
          type: "list",
          icon: "reset",
          title: "restUL",
          data: "units",
        },
        {},
        {},
      ];
    },
  },
  methods: {
    ...mapActions(["resetListItemsAction"]),
    onPageLoad({ object }) {
      object.bindingContext = new Observable();
    },
    onAppBarLoad({ object }) {
      this.appbar = object;
    },
    // RESET
    resetListItems(listName) {
      this.resetListItemsAction(listName);
      this.showToast();
    },
    showToast() {
      this.toast = localize("restDone");
      utils.timer(5, (val) => {
        if (!val) this.toast = val;
      });
    },
    hideToast({ object }) {
      this.appbar.translateY = 64;
      object
        .animate({
          opacity: 0,
          translate: { x: 0, y: 64 },
          duration: 250,
          curve: CoreTypes.AnimationCurve.ease,
        })
        .then(() => {
          this.showUndo = false;
          this.toast = null;
          this.appbar.animate({
            translate: { x: 0, y: 0 },
            duration: 250,
            curve: CoreTypes.AnimationCurve.ease,
          });
          object.opacity = 1;
          object.translateY = 0;
        });
    },
  },
};
</script>
