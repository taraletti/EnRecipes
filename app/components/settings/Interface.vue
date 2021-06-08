<template>
  <Page @loaded="pgLoad" actionBarHidden="true">
    <RGridLayout :isRtl="RTL" rows="*, auto" columns="auto, *">
      <OptionsList title="intf" :items="items" />
      <GridLayout
        :isRtl="RTL"
        row="1"
        class="appbar"
        rows="*"
        columns="auto, *"
      >
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
      </GridLayout>
    </RGridLayout>
  </Page>
</template>

<script>
import {
  ApplicationSettings,
  Observable,
  Device,
  Frame,
} from "@nativescript/core";
import { localize } from "@nativescript/localize";
import Action from "../modals/Action";
import Confirm from "../modals/Confirm";
import OptionsList from "../sub/OptionsList";
import { mapState, mapActions } from "vuex";
import * as utils from "~/shared/utils";

export default {
  components: { OptionsList },
  data() {
    return {
      applang: 0,
    };
  },
  computed: {
    ...mapState(["icon", "language", "appTheme", "layout", "RTL"]),
    items() {
      return [
        {},
        {
          type: "list",
          icon: "lang",
          title: "lang",
          subTitle: this.applang,
          action: this.setAppLang,
        },
        {
          type: "list",
          icon: "theme",
          title: "Theme",
          subTitle: ApplicationSettings.getString("appTheme", "sysDef"),
          action: this.selectThemes,
        },
        {
          type: "list",
          icon: "layout",
          title: "listVM",
          subTitle: this.layout,
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
            ? 1
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
    this.applang = ApplicationSettings.getString("applang", "sysDef");
  },
};
</script>
