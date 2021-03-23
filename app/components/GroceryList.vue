<template>
  <Page @loaded="onPageLoad">
    <ActionBar flat="true">
      <GridLayout rows="*" columns="auto, *, auto">
        <MDButton
          class="er left"
          variant="text"
          :text="icon.back"
          automationText="Back"
          @tap="$navigateBack()"
          col="0"
        />
        <Label class="title tb" :text="'grocery' | L" col="1" />
        <MDButton
          class="er left"
          variant="text"
          :text="icon.today"
          automationText="today"
          col="2"
        />
      </GridLayout>
    </ActionBar>
    <GridLayout columns="" rows=""> </GridLayout>
  </Page>
</template>

<script>
import { ApplicationSettings, Observable } from "@nativescript/core";
import { SnackBar } from "@nativescript-community/ui-material-snackbar";
const snackbar = new SnackBar();
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
    ...mapActions(["setCurrentComponentAction"]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
      this.setCurrentComponentAction("GroceryList");
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
    undoRemove(message) {
      return snackbar.action({
        message,
        textColor: this.appTheme == "Light" ? "#fff" : "#292929",
        actionTextColor: "#ff5200",
        backgroundColor: this.appTheme == "Light" ? "#292929" : "#fff",
        actionText: "Undo",
        hideDelay: 5000,
      });
    },
  },
  created() {
    this.appTheme = ApplicationSettings.getString("appTheme", "Light");
  },
};
</script>
