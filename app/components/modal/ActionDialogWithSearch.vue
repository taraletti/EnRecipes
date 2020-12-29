<template>
<Page>
  <GridLayout columns="*" rows="auto, auto, *, auto" class="dialogContainer" :class="appTheme">
    <Label row="0" class="dialogTitle orkm" :text="`${title}` | L" textWrap='true' />
    <StackLayout row="1" v-if="filteredRecipes.length || searchQuery" padding="0 24 24">
      <TextField :hint="'Search' | L" v-model="searchQuery" />
    </StackLayout>
    <ScrollView row="2" width="100%" :height="height ? height : ''">
      <StackLayout>
        <MDButton v-for="(recipe, index) in filteredRecipes" :key="index" class="actionItem" variant="text" :rippleColor="rippleColor" :text="recipe.title" @loaded="onLabelLoaded" @tap="tapAction(recipe)" />
        <Label padding="24" lineHeight="6" v-if="!filteredRecipes.length" :text="'Nothing here! Add some recipes and try again.' | L" textAlignment="center" textWrap="true" />
      </StackLayout>
    </ScrollView>
    <GridLayout row="3" rows="auto" columns="auto, *, auto" class="actionsContainer">
      <MDButton :rippleColor="rippleColor" variant="text" v-if="action" col="0" class="action orkm pull-left" :text="`${action}` | L" @tap="$modal.close(action)" />
      <MDButton :rippleColor="rippleColor" variant="text" col="2" class="action orkm pull-right" :text="'CANCEL' | L" @tap="$modal.close(false)" />
    </GridLayout>
  </GridLayout>
</Page>
</template>

<script>
import {
  Application,
  Screen
}
from "@nativescript/core"
export default {
  props: [ "title", "recipes", "height", "action" ],
  data() {
    return {
      searchQuery: "",
    }
  },
  computed: {
    appTheme() {
      return Application.systemAppearance()
    },
    rippleColor() {
      return this.appTheme == "light" ? "rgba(134,142,150,0.2)" : "rgba(206,212,218,0.1)"
    },
    screenHeight() {
      return Math.round( Screen.mainScreen.heightDIPs )
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
    onLabelLoaded( args ) {
      args.object.android.setGravity( 16 )
    },
    recipeFilter( e ) {
      let searchQuery = this.searchQuery.toLowerCase()
      return e.title.includes( searchQuery ) || e.cuisine.includes( searchQuery ) || e.category.includes( searchQuery ) || e.tags.includes( searchQuery ) || e.ingredients.includes( searchQuery )
    },
  },
}
</script>
