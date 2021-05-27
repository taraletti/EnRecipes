<template>
  <Page @loaded="onPageLoad" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="auto, *">
      <OptionsList title="Settings" :items="items" />
      <GridLayout row="1" class="appbar" rows="*" columns="auto, *">
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { Observable } from "@nativescript/core";
import { mapState, mapActions } from "vuex";
import OptionsList from "../sub/OptionsList";

export default {
  components: { OptionsList },
  computed: {
    ...mapState(["icon", "mondayFirst"]),
    items() {
      return [
        {},
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
    ...mapActions(["setFirstDay"]),
    onPageLoad({ object }) {
      object.bindingContext = new Observable();
    },
    toggleFirstDay() {
      this.setFirstDay(!this.mondayFirst);
    },
  },
};
</script>
