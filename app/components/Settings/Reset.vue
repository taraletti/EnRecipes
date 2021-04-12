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
      <GridLayout
        v-show="!toast"
        row="1"
        class="appbar"
        rows="*"
        columns="auto, *"
      >
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
      </GridLayout>
      <GridLayout
        v-show="toast"
        row="1"
        colSpan="2"
        class="appbar snackBar"
        columns="*"
        @tap="toast = null"
      >
        <FlexboxLayout minHeight="48" alignItems="center">
          <Label class="title msg" :text="toast" />
        </FlexboxLayout>
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { Observable } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { mapState, mapActions } from "vuex";
import * as utils from "~/shared/utils";
export default {
  data() {
    return {
      toast: null,
    };
  },
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
      this.toast = localize("restDone");
      utils.timer(5, (val) => {
        if (!val) this.toast = val;
      });
    },
    touch({ object, action }, type) {
      object.className = action.match(/down|move/) ? "option fade" : "option";
      if (action == "up") this.resetListItems(type);
    },
  },
};
</script>
