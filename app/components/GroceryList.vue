<template>
<Page @loaded="onPageLoad">
  <ActionBar flat="true">
    <GridLayout rows="*" columns="auto, *, auto">
      <MDButton class="bx left" variant="text" :text="icon.menu" automationText="Back" @tap="showDrawer" col="0" />
      <Label class="title orkm" :text="'grocery' | L" col="1" />
      <MDButton class="bx left" variant="text" :text="icon.today" automationText="today" col="2" />
    </GridLayout>
  </ActionBar>
  <GridLayout columns="" rows="">

  </GridLayout>
</Page>
</template>

<script>
import {
  ApplicationSettings,
  Color,
  Page,
  Observable,
  Device
}
from "@nativescript/core"
import {
  SnackBar
} from '@nativescript-community/ui-material-snackbar';
const snackbar = new SnackBar();
import {
  mapState,
  mapActions
}
from "vuex"
import ConfirmDialog from "./modal/ConfirmDialog.vue"
import * as utils from "~/shared/utils"
export default {
  data() {
    return {
      viewIsScrolled: false,
      appTheme: "Light",
    }
  },
  computed: {
    ...mapState( [ "icon", "recipes", "mealPlans" ] ),
    isLightMode() {
      return this.appTheme === "Light"
    },

  },
  methods: {
    ...mapActions( [ "setCurrentComponentAction" ] ),
    onPageLoad( args ) {
      const page = args.object;
      page.bindingContext = new Observable();
      this.setCurrentComponentAction( "GroceryList" )
    },
    // HELPERS
    showDrawer() {
      utils.showDrawer()
    },
    onScroll( args ) {
      this.viewIsScrolled = args.scrollY ? true : false
    },

    // NAVIGATION HANDLERS
    viewRecipe( recipeID ) {
      let recipe = this.recipes.filter( ( e ) => e.id === recipeID )[ 0 ]
      if ( recipe ) {
        this.$navigateTo( ViewRecipe, {
          props: {
            filterTrylater: true,
            recipeID,
          },
          backstackVisible: false,
        } )
      }
    },
    // DATA HANDLERS
    undoRemove( message ) {
      return snackbar
        .action( {
          message,
          textColor: this.appTheme == "Light" ? "#f1f3f5" : "#212529",
          actionTextColor: '#ff5200',
          backgroundColor: this.appTheme == "Light" ? "#212529" : "#f1f3f5",
          actionText: 'Undo',
          hideDelay: 5000
        } )
    },
  },
  created() {
    this.appTheme = ApplicationSettings.getString( "appTheme", "Light" )
  },
}
</script>
