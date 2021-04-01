<template>
  <Page @loaded="onPageLoad" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="auto, *">
      <ListView
        colSpan="2"
        rowSpan="2"
        class="options-list"
        @loaded="listViewLoad"
        for="item in items"
      >
        <v-template if="$index == 0">
          <Label class="pageTitle" :text="'rest' | L" />
        </v-template>
        <v-template if="$index == 5">
          <Label class="group-info sub tw" :text="'restInfo' | L" />
        </v-template>
        <v-template if="$index == 6">
          <StackLayout class="listSpace"> </StackLayout>
        </v-template>
        <v-template>
          <GridLayout
            columns="auto, *"
            class="option"
            @touch="touch($event, item.type)"
          >
            <Label class="ico" :text="icon.reset" />
            <Label col="1" :text="item.title | L" class="info" />
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
import { Observable } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { mapState, mapActions } from "vuex";

export default {
  computed: {
    ...mapState(["icon"]),
    items() {
      return [
        {},
        {
          type: "cuisines",
          title: "restCuiL",
        },
        {
          type: "categories",
          title: "restCatL",
        },
        {
          type: "yieldUnits",
          title: "restYUL",
        },
        {
          type: "units",
          title: "restUL",
        },
        {},
        {},
      ];
    },
  },
  methods: {
    ...mapActions(["resetListItemsAction"]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
    },
    // RESET
    resetListItems(listName) {
      this.resetListItemsAction(listName);
      // Toast.makeText(localize("restDone")).show();
    },
    touch({ object, action }, type) {
      object.className = action.match(/down|move/) ? "option fade" : "option";
      if (action == "up") this.resetListItems(type);
    },
  },
};
</script>
