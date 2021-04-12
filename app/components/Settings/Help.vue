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
          <Label class="pageTitle" :text="'help' | L" />
        </v-template>
        <v-template if="$index == 3">
          <StackLayout class="listSpace"> </StackLayout>
        </v-template>
        <v-template>
          <GridLayout
            columns="auto, *"
            class="option"
            @touch="touch($event, item.url)"
          >
            <Label class="ico" :text="icon[item.icon]" />
            <Label col="1" :text="item.title | L" class="info" />
          </GridLayout>
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
import { Observable, Utils } from "@nativescript/core";
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["icon"]),
    items() {
      return [
        {},
        {
          icon: "tg",
          title: "joinTG",
          url: "https://t.me/enrecipes",
        },
        {
          icon: "help",
          title: "guide",
          url: "https://github.com/vishnuraghavb/EnRecipes/wiki/User-Guide",
        },
        {},
      ];
    },
  },
  methods: {
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
    },
    // HELPERS
    openURL(url) {
      Utils.openUrl(url);
    },
    touch({ object, action }, url) {
      object.className = action.match(/down|move/) ? "option fade" : "option";
      if (action == "up") this.openURL(url);
    },
  },
};
</script>
