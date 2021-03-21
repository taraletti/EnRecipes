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
        <Label class="title orkm" :text="'About' | L" col="1" />
      </GridLayout>
    </ActionBar>
    <GridLayout rows="auto, *" columns="*" class="main-container">
      <StackLayout row="0" class="app-info-container">
        <Image
          class="app-icon"
          src="res://ic_launcher_foreground"
          stretch="none"
        />
        <Label class="app-name orkb" :text="'EnRecipes' | L" textWrap="true" />
        <Label :text="getVersion" class="app-version orkm" textWrap="true" />

        <Label class="app-info" :text="'appInfo' | L" textWrap="true" />
      </StackLayout>

      <ListView row="1" for="item in items" @loaded="listViewLoad">
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
import { Application, Observable, Utils } from "@nativescript/core";
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["icon"]),
    items() {
      return [
        {
          icon: "gh",
          title: "gh",
          url: "https://github.com/vishnuraghavb/EnRecipes",
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
