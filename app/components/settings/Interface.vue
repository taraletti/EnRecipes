<template>
  <Page @loaded="pgLoad" actionBarHidden="true">
    <RGridLayout :rtl="RTL" rows="*, auto" columns="auto, *">
      <OptionsList title="intf" :items="items" />
      <GridLayout row="1" class="appbar rtl" rows="*" columns="auto, *">
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
      </GridLayout>
    </RGridLayout>
  </Page>
</template>

<script>
import { ApplicationSettings, Observable, Frame } from "@nativescript/core";
import Action from "../modals/Action";
import OptionsList from "../sub/OptionsList";
import { mapState, mapActions } from "vuex";
import * as utils from "~/shared/utils";
import { localize } from "@nativescript/localize";

export default {
  components: { OptionsList },
  data() {
    return {
      applang: 0,
    };
  },
  computed: {
    ...mapState(["icon", "language", "theme", "layout", "RTL"]),
    items() {
      return [
        {},
        {
          type: "list",
          icon: "lang",
          rtl: 0,
          title: "lang",
          subTitle: localize(this.applang),
          action: this.setAppLang,
        },
        {
          type: "list",
          icon: "theme",
          rtl: 0,
          title: "Theme",
          subTitle: localize(
            ApplicationSettings.getString("theme", "sysDef")
          ),
          action: this.selectThemes,
        },
        {
          type: "list",
          icon: "layout",
          rtl: 1,
          title: "listVM",
          subTitle: localize(this.layout),
          action: this.setLayoutMode,
        },
        {},
      ];
    },
  },
  methods: {
    ...mapActions(["setTheme", "setLayout", "setRTL"]),
    pgLoad({ object }) {
      object.bindingContext = new Observable();
    },
    // LANGUAGE SELECTION
    setAppLang() {
      let languages = this.language.map((e) => e.title);
      this.$showModal(Action, {
        props: {
          title: "lang",
          list: [...languages],
        },
      }).then((action) => {
        if (action && this.applang !== action) {
          let currentLocale = ApplicationSettings.getString(
            "appLocale",
            "none"
          ).split("-");
          let locale = this.language.filter((e) => e.title === action)[0]
            .locale;
          if (currentLocale !== locale) {
            this.applang = action;
            ApplicationSettings.setString("applang", action);
            ApplicationSettings.setString("appLocale", locale);
            utils.updateLocale();
            this.setRTL();
            Frame.reloadPage();
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
          (ApplicationSettings.getString("theme") != this.theme
            ? 1
            : this.theme != action)
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
    this.applang = ApplicationSettings.getString("applang", "sysDef");
  },
};
</script>
