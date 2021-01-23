<template>
<Page>
  <GridLayout columns="*" rows="auto, auto, auto, *, auto" class="dialogContainer" :class="appTheme">
    <Label row="0" class="er dialogIcon" backgroundColor="#858585" :color="iconColor" :text="icon[helpIcon]" />
    <Label row="1" class="dialogTitle orkm" :text="`${title}` | L" textWrap='true' />
    <StackLayout row="2" v-if="filteredRecipes.length || searchQuery" padding="0 24 24">
      <TextField :hint="'Search' | L" v-model="searchQuery" />
    </StackLayout>
    <ScrollView row="3" width="100%" :height="height ? height : ''">
      <StackLayout>
        <MDButton v-for="(recipe, index) in filteredRecipes" :key="index" class="actionItem" variant="text" :rippleColor="rippleColor" :text="recipe.title" @loaded="centerLabel" @tap="tapAction(recipe)" />
        <Label padding="24" lineHeight="6" v-if="!filteredRecipes.length && !searchQuery" :text="'recListEmp' | L" textAlignment="center" textWrap="true" />
        <Label padding="24" lineHeight="6" v-if="!filteredRecipes.length && searchQuery" :text="'noRecs' | L" textAlignment="center" textWrap="true" />
      </StackLayout>
    </ScrollView>
    <GridLayout row="4" rows="auto" columns="auto, *, auto" class="actionsContainer">
      <MDButton :rippleColor="rippleColor" variant="text" v-if="action" col="0" class="action orkm pull-left" :text="`${action}` | L" @tap="$modal.close(action)" />
      <MDButton :rippleColor="rippleColor" variant="text" col="2" class="action orkm pull-right" :text="'CANCEL' | L" @tap="$modal.close(false)" />
    </GridLayout>
  </GridLayout>
</Page>
</template>

<script>
import {
  Application
}
from "@nativescript/core"
import {
  mapState
}
from "vuex"
export default {
  props: [ "title", "recipes", "height", "action", "helpIcon" ],
  data() {
    return {
      searchQuery: "",
    }
  },
  computed: {
    ...mapState( [ 'icon' ] ),
    appTheme() {
      return Application.systemAppearance()
    },
    isLightMode() {
      return this.appTheme == "light"
    },
    rippleColor() {
      return "rgba(133,133,133,0.2)"
    },
    iconColor() {
      return this.isLightMode ? "#f0f0f0" : "#1A1A1A"
    },
    filteredRecipes() {
      return this.recipes.map( ( e, i ) => {
        return {
          id: e.id,
          title: e.title,
          cuisine: e.cuisine,
          category: e.category,
          tags: e.tags.map( e => e.toLowerCase() ).join(),
          ingredients: e.ingredients.map( e => e.item.toLowerCase() ).join(),
        }
      } ).filter( ( e ) => this.recipeFilter( e ) )
    },

  },
  methods: {
    tapAction( recipe ) {
      this.$modal.close( recipe.id )
    },
    centerLabel( args ) {
      args.object.android.setGravity( 16 )
    },
    recipeFilter( e ) {
      let searchQuery = this.searchQuery.toLowerCase()
      return e.title.includes( searchQuery ) || e.cuisine.includes( searchQuery ) || e.category.includes( searchQuery ) || e.tags.includes( searchQuery ) || e.ingredients.includes( searchQuery )
    },
  },
}
</script>
