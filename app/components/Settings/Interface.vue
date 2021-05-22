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
          <Label class="pageTitle" :text="'intf' | L" />
        </v-template>
        <v-template if="$index == 4">
          <StackLayout class="listSpace"> </StackLayout>
        </v-template>
        <v-template>
          <GridLayout
            columns="auto, *"
            class="option"
            @touch="touch($event, item.action)"
          >
            <Label class="ico" :text="icon[item.icon]" />
            <StackLayout col="1">
              <Label :text="item.title | L" class="info" />
              <Label :text="item.subTitle" class="sub" />
            </StackLayout>
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
import {
  ApplicationSettings,
  Observable,
  Device,
  Frame,
} from "@nativescript/core";
import { localize, overrideLocale } from "@nativescript/localize";
import ActionDialog from "../modal/ActionDialog.vue";
import ConfirmDialog from "../modal/ConfirmDialog.vue";
import { mapState, mapActions } from "vuex";
import * as utils from "~/shared/utils";

export default {
  data() {
    return {
      appLanguage: "English",
    };
  },
  computed: {
    ...mapState(["icon", "language", "appTheme", "layout"]),
    items() {
      return [
        {},
        {
          icon: "lang",
          title: "lang",
          subTitle: this.appLanguage,
          action: this.selectAppLanguage,
        },
        {
          icon: "theme",
          title: "Theme",
          subTitle: localize(
            ApplicationSettings.getString("appTheme", "sysDef")
          ),
          action: this.selectThemes,
        },
        {
          icon: "layout",
          title: "listVM",
          subTitle: localize(this.layout),
          action: this.setLayoutMode,
        },
        {},
      ];
    },
  },
  methods: {
    ...mapActions(["setTheme", "setLayout"]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
    },
    // LANGUAGE SELECTION
    selectAppLanguage() {
      let languages = this.language.map((e) => e.title);
      this.$showModal(ActionDialog, {
        props: {
          title: "lang",
          list: [...languages],
        },
      }).then((action) => {
        if (action && this.appLanguage !== action) {
          let currentLocale = Device.language.split("-")[0];
          let locale = this.language.filter((e) => e.title === action)[0]
            .locale;
          if (currentLocale !== locale) {
            this.$showModal(ConfirmDialog, {
              props: {
                title: "appRst",
                description: localize("nLangInfo"),
                cancelButtonText: "cBtn",
                okButtonText: "rst",
              },
            }).then((result) => {
              if (result) {
                this.appLanguage = action;
                ApplicationSettings.setString("appLanguage", action);
                overrideLocale(locale);
                setTimeout(utils.restartApp, 250);
              }
            });
          }
        }
      });
    },
    // THEME SELECTION
    selectThemes() {
      this.$showModal(ActionDialog, {
        props: {
          title: "Theme",
          list: ["Light", "Dark", "Black", "sysDef", "sysDefB"],
        },
      }).then((action) => {
        if (
          action &&
          (ApplicationSettings.getString("appTheme") != this.appTheme
            ? true
            : this.appTheme != action)
        ) {
          this.setTheme(action);
          Frame.reloadPage();
        }
      });
    },
    // LAYOUT MODE
    setLayoutMode() {
      this.$showModal(ActionDialog, {
        props: {
          title: "listVM",
          list: ["detailed", "grid", "photogrid", "simple", "minimal"],
        },
      }).then((action) => {
        if (action && this.layoutMode !== action) {
          let act = action.toLowerCase();
          ApplicationSettings.setString("layout", act);
          this.setLayout(act);
        }
      });
    },
    // HELPERS
    touch({ object, action }, method) {
      object.className = action.match(/down|move/) ? "option fade" : "option";
      if (action == "up") method();
    },
  },
  mounted() {
    this.appLanguage = ApplicationSettings.getString(
      "appLanguage",
      localize("sysDef")
    );
  },
};
</script>
