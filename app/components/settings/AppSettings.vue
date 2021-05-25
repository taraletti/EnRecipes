<template>
  <Page @loaded="onPageLoad" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="auto, *">
      <OptionsList title="Settings" :items="items" :action="navigateTo" />
      <GridLayout row="1" class="appbar" rows="*" columns="auto, *">
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import { Observable } from "@nativescript/core";
import { mapState, mapActions } from "vuex";
import Interface from "./Interface.vue";
import Options from "./Options.vue";
import Database from "./Database.vue";
import Reset from "./Reset.vue";
import About from "./About.vue";
import OptionsList from "../sub/OptionsList.vue";
export default {
  components: { OptionsList },
  data() {
    return {
      items: [
        {},
        {
          type: "list",
          icon: "interface",
          title: "intf",
          data: Interface,
        },
        {
          type: "list",
          icon: "opts",
          title: "opts",
          data: Options,
        },
        {
          type: "list",
          icon: "db",
          title: "db",
          data: Database,
        },
        {
          type: "list",
          icon: "reset",
          title: "rest",
          data: Reset,
        },
        {
          type: "list",
          icon: "info",
          title: "About",
          data: About,
        },
        {},
      ],
    };
  },
  computed: {
    ...mapState(["icon"]),
  },
  methods: {
    ...mapActions(["setComponent"]),
    onPageLoad({ object }) {
      object.bindingContext = new Observable();
      this.setComponent("Settings");
    },
    // HELPERS
    navigateTo(view) {
      this.$navigateTo(view, {
        transition: {
          name: "slide",
          duration: 200,
          curve: "easeOut",
        },
      });
    },
  },
};
</script>
