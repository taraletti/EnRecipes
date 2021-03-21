<template>
  <Page @loaded="onPageLoad">
    <ActionBar flat="true">
      <GridLayout rows="*" columns="auto, *">
        <MDButton
          class="er left"
          variant="text"
          :text="icon.back"
          automationText="Back"
          @tap="$navigateBack()"
          col="0"
        />
        <Label class="title orkm" :text="'help' | L" col="1" />
      </GridLayout>
    </ActionBar>
    <GridLayout rows="*" columns="*" class="main-container">
      <ListView for="item in items" @loaded="listViewLoad">
        <v-template>
          <GridLayout
            columns="auto, *"
            class="option mdr"
            @tap="openURL(item.url)"
          >
            <Label
              col="0"
              verticalAlignment="center"
              class="er"
              :text="icon[item.icon]"
            />
            <Label col="1" :text="item.title | L" />
          </GridLayout>
        </v-template>
      </ListView>
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
      ];
    },
  },
  methods: {
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
    },
    listViewLoad(args) {
      let e = args.object.android;
      e.setSelector(new android.graphics.drawable.StateListDrawable());
      e.setDivider(null);
      e.setDividerHeight(0);
    },
    // HELPERS
    openURL(url) {
      Utils.openUrl(url);
    },
  },
};
</script>
