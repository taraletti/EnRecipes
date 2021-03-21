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
        <Label class="title orkm" :text="'rest' | L" col="1" />
      </GridLayout>
    </ActionBar>
    <GridLayout rows="auto, *" columns="*" class="main-container">
      <Label
        row="0"
        class="group-info"
        :text="'restInfo' | L"
        textWrap="true"
      />
      <ListView row="1" for="item in items" @loaded="listViewLoad">
        <v-template>
          <GridLayout
            columns="auto, *"
            class="option mdr"
            @tap="resetListItems(item.type)"
          >
            <Label
              col="0"
              verticalAlignment="center"
              class="er"
              :text="icon.reset"
            />
            <Label
              col="1"
              verticalAlignment="center"
              :text="item.title | L"
              textWrap="true"
            />
          </GridLayout>
        </v-template>
      </ListView>
    </GridLayout>
  </Page>
</template>

<script>
import { Observable } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import * as Toast from "nativescript-toast";
import { mapState, mapActions } from "vuex";

export default {
  computed: {
    ...mapState(["icon"]),
    items() {
      return [
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
      ];
    },
  },
  methods: {
    ...mapActions(["resetListItemsAction"]),
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
    // RESET
    resetListItems(listName) {
      this.resetListItemsAction(listName);
      Toast.makeText(localize("restDone")).show();
    },
  },
};
</script>
