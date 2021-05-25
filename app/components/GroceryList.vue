<template>
  <Page @loaded="onPageLoad">
    <ActionBar flat="true">
      <GridLayout rows="*" columns="auto, *, auto">
        <Button class="ico left" :text="icon.back" @tap="$navigateBack()" />
        <Label class="title tb" :text="'grocery' | L" col="1" />
        <Button class="ico left" :text="icon.today" col="2" />
      </GridLayout>
    </ActionBar>
    <GridLayout columns="" rows=""> </GridLayout>
  </Page>
</template>

<script>
import { ApplicationSettings, Observable } from "@nativescript/core";
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
      appTheme: "Light",
    };
  },
  computed: {
    ...mapState(["icon", "recipes", "mealPlans"]),
    isLightMode() {
      return this.appTheme === "Light";
    },
  },
  methods: {
    ...mapActions(["setComponent"]),
    onPageLoad({ object }) {
      object.bindingContext = new Observable();
      this.setComponent("GroceryList");
    },
    // HELPERS

    // NAVIGATION HANDLERS
    viewRecipe(recipeID) {
      let recipe = this.recipes.filter((e) => e.id === recipeID)[0];
      if (recipe) {
        this.$navigateTo(ViewRecipe, {
          props: {
            filterTrylater: true,
            recipeID,
          },
          backstackVisible: false,
        });
      }
    },
    // DATA HANDLERS
  },
  created() {
    this.appTheme = ApplicationSettings.getString("appTheme", "Light");
  },
};
</script>
