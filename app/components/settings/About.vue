<template>
  <Page @loaded="onPageLoad" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="auto, *">
      <ListView
        rowSpan="2"
        colSpan="2"
        class="options-list"
        for="item in items"
      >
        <v-template if="$index == 0">
          <Label class="pageTitle" :text="'About' | L" />
        </v-template>
        <v-template if="$index == 1">
          <StackLayout class="app-info">
            <Image class="icon" src="res://logo" stretch="none" />
            <Label class="name tb tac" :text="'EnRecipes' | L" />
            <Label :text="getVersion" class="version tb tac" />

            <Label class="info tac tw" :text="'appInfo' | L" />
          </StackLayout>
        </v-template>
        <v-template if="$index == 8">
          <StackLayout class="listSpace"> </StackLayout>
        </v-template>
        <v-template>
          <GridLayout
            columns="auto, *"
            class="option"
            @touch="touch($event, item.url)"
          >
            <Label class="ico" :text="icon[item.icon]" />
            <Label col="1" :text="item.title | L" />
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
import { Application, Observable, Utils } from "@nativescript/core";
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["icon"]),
    items() {
      return [
        {},
        {},
        {
          icon: "gh",
          title: "gh",
          url: "https://github.com/vishnuraghavb/EnRecipes",
        },
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
        {
          icon: "priv",
          title: "priv",
          url:
            "https://github.com/vishnuraghavb/EnRecipes/blob/main/PRIVACY.md",
        },
        {
          icon: "don",
          title: "donate",
          url: "https://www.vishnuraghav.com/donate",
        },
        {
          icon: "trans",
          title: "trnsl",
          url: "https://hosted.weblate.org/projects/enrecipes/app-translations",
        },
        {},
      ];
    },
    getVersion() {
      let ctx = Application.android.context;
      return (
        "v" +
        ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0)
          .versionName
      );
    },
  },
  methods: {
    onPageLoad({ object }) {
      object.bindingContext = new Observable();
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
