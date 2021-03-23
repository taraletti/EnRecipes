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
        <Label class="title tb" :text="'intf' | L" col="1" />
      </GridLayout>
    </ActionBar>
    <GridLayout rows="*" columns="*" class="main-container">
      <ListView for="item in items" @loaded="listViewLoad">
        <v-template>
          <GridLayout columns="auto, *" class="option mdr" @tap="item.action">
            <Label
              col="0"
              verticalAlignment="center"
              class="er"
              :text="icon[item.icon]"
            />
            <StackLayout col="1">
              <Label :text="item.title | L" />
              <Label :text="item.subTitle" class="info" />
            </StackLayout>
          </GridLayout>
        </v-template>
      </ListView>
    </GridLayout>
  </Page>
</template>

<script>
import { ApplicationSettings, Observable, Device } from "@nativescript/core";
import { localize, overrideLocale } from "@nativescript/localize";
import ActionDialog from "../modal/ActionDialog.vue";
import ConfirmDialog from "../modal/ConfirmDialog.vue";
import { mapState, mapActions } from "vuex";

import * as utils from "~/shared/utils";

export default {
  data() {
    return {
      appLanguage: "English",
      appTheme: "Light",
    };
  },
  computed: {
    ...mapState(["icon", "language", "layout"]),
    items() {
      return [
        {
          icon: "lang",
          title: "lang",
          subTitle: this.appLanguage,
          action: this.selectAppLanguage,
        },
        {
          icon: "theme",
          title: "Theme",
          subTitle: localize(this.appTheme),
          action: this.selectThemes,
        },
        {
          icon: "theme",
          title: "listVM",
          subTitle: localize(this.layout),
          action: this.setLayoutMode,
        },
      ];
    },
  },
  methods: {
    ...mapActions(["setLayout"]),
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
    // LANGUAGE SELECTION
    selectAppLanguage() {
      let languages = this.language.map((e) => e.title);
      this.$showModal(ActionDialog, {
        props: {
          title: "lang",
          list: [...languages],
          stretch: true,
          helpIcon: "lang",
        },
      }).then((action) => {
        if (action && action !== "Cancel" && this.appLanguage !== action) {
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
                helpIcon: "res",
                iconColor: "#ff5200",
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
          list: ["Light", "Dark"],
          stretch: false,
          helpIcon: "theme",
          count: 2,
        },
      }).then((action) => {
        if (action && action !== "Cancel" && this.appTheme !== action) {
          this.$showModal(ConfirmDialog, {
            props: {
              title: "appRst",
              description: localize("nThmInfo"),
              cancelButtonText: "cBtn",
              okButtonText: "rst",
              helpIcon: "res",
              iconColor: "#ff5200",
            },
          }).then((result) => {
            if (result) {
              this.appTheme = action;
              ApplicationSettings.setString("appTheme", action);
              setTimeout(utils.restartApp, 250);
            }
          });
        }
      });
    },
    // LAYOUT MODE
    setLayoutMode() {
      this.$showModal(ActionDialog, {
        props: {
          title: "List view mode",
          list: ["Detailed", "Simple", "Grid"],
          stretch: false,
          helpIcon: "theme",
          count: 3,
        },
      }).then((action) => {
        if (action && action !== "Cancel" && this.layoutMode !== action) {
          let act = action.toLowerCase();
          ApplicationSettings.setString("layout", act);
          this.setLayout(act);
        }
      });
    },
  },
  mounted() {
    this.appTheme = ApplicationSettings.getString("appTheme", "Light");
    this.appLanguage = ApplicationSettings.getString(
      "appLanguage",
      localize("sysDef")
    );
  },
};
</script>
