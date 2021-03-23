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
        <Label class="title tb" :text="'Settings' | L" col="1" />
      </GridLayout>
    </ActionBar>
    <GridLayout rows="*" columns="*" class="main-container">
      <ListView @loaded="listViewLoad" for="item in items">
        <v-template>
          <GridLayout
            columns="auto, *"
            class="option mdr"
            @tap="navigateTo(item.view)"
          >
            <Label
              col="0"
              verticalAlignment="center"
              class="er"
              :text="icon[item.icon]"
            />
            <Label verticalAlignment="center" col="1" :text="item.title | L" />
          </GridLayout>
        </v-template>
      </ListView>
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
import Help from "./Settings/Help.vue";
import About from "./Settings/About.vue";
export default {
  data() {
    return {
      items: [
        {
          icon: "theme",
          title: "intf",
          view: Interface,
        },
        {
          icon: "cog",
          title: "opts",
          view: Options,
        },
        {
          icon: "exp",
          title: "db",
          view: Database,
        },
        {
          icon: "reset",
          title: "rest",
          view: Reset,
        },
        {
          icon: "help",
          title: "help",
          view: Help,
        },
        {
          icon: "info",
          title: "About",
          view: About,
        },
      ],
    };
  },
  computed: {
    ...mapState(["icon"]),
  },
  methods: {
    ...mapActions(["setCurrentComponentAction"]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
      this.setCurrentComponentAction("Settings");
    },
    listViewLoad(args) {
      let e = args.object.android;
      e.setSelector(new android.graphics.drawable.StateListDrawable());
      e.setDivider(null);
      e.setDividerHeight(0);
    },
    // HELPERS
    navigateTo(view) {
      this.$navigateTo(view);
    },
  },
};
</script>
