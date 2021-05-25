<template>
  <Page @loaded="onPageLoad" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="auto, *">
      <OptionsList title="intf" :items="items" />
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
import Action from "../modals/Action";
import Confirm from "../modals/Confirm";
import OptionsList from "../sub/OptionsList";
import { mapState, mapActions } from "vuex";
import * as utils from "~/shared/utils";

export default {
  components: { OptionsList },
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
          type: "list",
          icon: "lang",
          title: "lang",
          subTitle: this.appLanguage,
          action: this.selectAppLanguage,
        },
        {
          type: "list",
          icon: "theme",
          title: "Theme",
          subTitle: localize(
            ApplicationSettings.getString("appTheme", "sysDef")
          ),
          action: this.selectThemes,
        },
        {
          type: "list",
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
    onPageLoad({ object }) {
      object.bindingContext = new Observable();
    },
    // LANGUAGE SELECTION
    selectAppLanguage() {
      let languages = this.language.map((e) => e.title);
      this.$showModal(Action, {
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
            this.$showModal(Confirm, {
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
      this.$showModal(Action, {
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
      this.$showModal(Action, {
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
  },
  created() {
    this.appLanguage = ApplicationSettings.getString(
      "appLanguage",
      localize("sysDef")
    );
  },
};
</script>
