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
        <v-template if="$index == 6">
          <StackLayout class="listSpace"> </StackLayout>
        </v-template>
        <v-template>
          <GridLayout
            columns="auto, *"
            class="option"
            @touch="touch($event, item.view)"
          >
            <Label
              verticalAlignment="center"
              class="ico"
              :text="icon[item.icon]"
            />
            <Label verticalAlignment="center" col="1" :text="item.title | L" />
          </GridLayout>
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
import Interface from "./Settings/Interface.vue";
import Options from "./Settings/Options.vue";
import Database from "./Settings/Database.vue";
import Reset from "./Settings/Reset.vue";
import About from "./Settings/About.vue";
export default {
  data() {
    return {
      items: [
        {},
        {
          icon: "interface",
          title: "intf",
          view: Interface,
        },
        {
          icon: "opts",
          title: "opts",
          view: Options,
        },
        {
          icon: "db",
          title: "db",
          view: Database,
        },
        {
          icon: "reset",
          title: "rest",
          view: Reset,
        },
        {
          icon: "info",
          title: "About",
          view: About,
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
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
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
    touch({ object, action }, view) {
      object.className = action.match(/down|move/) ? "option fade" : "option";
      if (action == "up") this.navigateTo(view);
    },
  },
};
</script>
