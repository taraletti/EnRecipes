<template>
<Page @loaded="onPageLoad" @unloaded="onPageUnload">
  <ActionBar :androidElevation="viewIsScrolled ? 4 : 0">
    <GridLayout v-if="showSearch" columns="auto, *" verticalAlignment="center">
      <MDButton class="bx" :text="icon.back" variant="text" automationText="Back" col="0" @tap="closeSearch" />
      <SearchBar col="1" :hint="'ser' | L" v-model="searchQuery" @textChange="callUpdateFilter" @clear="clearSearch" />
    </GridLayout>
    <GridLayout v-else columns="auto, *, auto, auto">
      <MDButton class="bx" col="0" variant="text" @tap="showDrawer" :text="icon.menu" automationText="Back" />
      <Label class="title orkm" :text="`${currentComponent}` | L" col="1" />
      <MDButton v-if="recipes.length" class="bx" :text="icon.search" variant="text" col="2" @tap="openSearch" />
      <MDButton v-if="recipes.length" class="bx" :text="icon.sort" variant="text" col="3" @tap="sortDialog" />
    </GridLayout>
  </ActionBar>
  <AbsoluteLayout>
    <RadListView ref="listView" itemHeight="104" for="recipe in recipes" swipeActions="true" @itemSwipeProgressChanged="onSwiping" @itemSwipeProgressEnded="onSwipeEnded" @scrolled="onScroll" :filteringFunction="filterFunction"
      :sortingFunction="sortFunction">
      <v-template name="header">
        <StackLayout height="4"></StackLayout>
      </v-template>
      <v-template>
        <GridLayout class="recipeItem" rows="104" columns="104, *" androidElevation="1">
          <MDRipple colSpan="2" @tap="viewRecipe(recipe.id)" />
          <GridLayout class="imageHolder card" rows="104" columns="104">
            <Image row="0" col="0" v-if="recipe.imageSrc" :src="recipe.imageSrc" stretch="aspectFill" decodeWidth="104" decodeHeight="104" loadMode="async" />
            <Label v-else row="0" col="0" horizontalAlignment="center" class="bx" fontSize="56" :text="icon.image" />
          </GridLayout>
          <StackLayout class="recipeInfo" col="1">
            <Label :text="`${$options.filters.L(recipe.cuisine)} • ${$options.filters.L(recipe.category)}`" class="category" />
            <Label :text="recipe.title" class="orkm title" />
            <GridLayout columns="*" rows="auto, *, auto">
              <StackLayout class="attrContainer" orientation="horizontal" row="0">
                <Label class="bx small" :text="icon.starLine" />
                <Label class="attr" :text="recipe.rating" />
                <Label class="bx small" :text="icon.meterLine" />
                <Label class="attr" :text="`${recipe.difficulty}` | L" />
                <Label class="bx small" :text="icon.timeLine" />
                <Label class="attr" :text="
              `${
                formattedTotalTime(recipe.prepTime, recipe.cookTime).time
              }`
              " />
              </StackLayout>
              <FlexboxLayout class="tagsContainer" flexWrap="wrap" row="2">
                <Label v-for="(tag, index) in recipe.tags" :key="index" v-if="tag && index < 2" class="tag" :text="tag" />
                <Label class="collapsedTagsCount" v-if="recipe.tags.length > 2" :text="recipe.tags.length - 2 +'+'" />
              </FlexboxLayout>
            </GridLayout>
          </StackLayout>
        </GridLayout>
      </v-template>
      <v-template name="itemswipe">
        <GridLayout columns="*, auto" padding="0">
          <StackLayout id="delete-action" col="1" class="swipe-item right">
            <Label class="bx" padding="8" :text="icon.trash" />
          </StackLayout>
        </GridLayout>
      </v-template>
      <v-template name="footer">
        <StackLayout height="84"></StackLayout>
      </v-template>
    </RadListView>
    <GridLayout rows="*, auto, *, 88" columns="*" class="emptyStateContainer">
      <StackLayout row="1" class="emptyState" v-if="
            !recipes.length &&
              !filterFavourites &&
              !filterTrylater
          " @tap="addRecipe">
        <Label class="bx icon" :text="icon.plusCircle" />
        <Label class="title orkm" :text="'strAdd' | L" textWrap="true" />
        <StackLayout orientation="horizontal" horizontalAlignment="center">
          <Label :text="'plsAdd' | L" textWrap="true" />
        </StackLayout>
      </StackLayout>
      <StackLayout row="1" class="emptyState" v-if="!filteredRecipes.length && filterTrylater && !searchQuery">
        <Label class="bx icon" :text="icon.trylaterLine" textWrap="true" />
        <Label class="title orkm" :text="'aD' | L" textWrap="true" />
        <Label :text="'tLInfo' | L" textWrap="true" />
      </StackLayout>
      <StackLayout row="1" class="emptyState" v-if="!filteredRecipes.length && filterFavourites && !searchQuery">
        <Label class="bx icon" :text="icon.heartLine" textWrap="true" />
        <Label class="title orkm" :text="'noFavs' | L" textWrap="true" />
        <Label :text="'fsList' | L" textWrap="true" />
      </StackLayout>
      <StackLayout row="1" class="emptyState" v-if="!filteredRecipes.length && searchQuery">
        <Label class="bx icon" :text="icon.search" textWrap="true" />
        <Label class="title orkm" :text="`${noResultFor}` | L" textWrap="true" />
        <MDButton v-if="filterFavourites || filterTrylater || selectedCuisine" variant="text" class="searchAll orkm" :text="'trySer' | L" @tap="searchAll" />
      </StackLayout>
    </GridLayout>
    <GridLayout id="btnFabContainer" rows="*, auto" columns="*, auto">
      <transition name="bounce">
        <MDFloatingActionButton v-if="showFAB" row="1" col="1" class="bx fab-button" src="res://plus" @tap="addRecipe" />
      </transition>
    </GridLayout>
  </AbsoluteLayout>
</Page>
</template>

<script>
import {
  Frame,
  ApplicationSettings,
  AndroidApplication,
  Utils,
  Observable,
  Device,
}
from "@nativescript/core";
import {
  localize
}
from "@nativescript/localize"
import {
  time
} from "tns-core-modules/profiling"
import {
  startAccelerometerUpdates,
  stopAccelerometerUpdates,
} from "nativescript-accelerometer"
import {
  Vibrate
} from 'nativescript-vibrate';
let vibrator = new Vibrate();
import {
  mapActions,
  mapState
}
from "vuex";
import EditRecipe from "./EditRecipe.vue";
import ViewRecipe from "./ViewRecipe.vue";
import ActionDialog from "./modal/ActionDialog.vue";
import ConfirmDialog from "./modal/ConfirmDialog.vue";
import * as utils from "~/shared/utils";
let lastTime = 0;
let lastShake = 0;
let lastForce = 0;
let shakeCount = 0;
let typingTimer;
export default {
  props: [ "filterFavourites", "filterTrylater", "closeDrawer", "selectedCategory", "selectedCuisine", "selectedTag", "hijackGlobalBackEvent", "releaseGlobalBackEvent" ],
  components: {
    EditRecipe,
    ViewRecipe
  },
  data() {
    return {
      searchQuery: "",
      viewIsScrolled: false,
      showSearch: false,
      rightAction: false,
      deletionDialogActive: false,
      showFAB: false,
      filterDone: true,
    };
  },
  computed: {
    ...mapState( [ "sortType", "icon", "recipes", "currentComponent", "shakeEnabled" ] ),
    filteredRecipes() {
      let ingredients = this.recipes.map( e => e.ingredients.map( f => f.item.toLowerCase() ).join() ).join()

      let vm = this

      function getIngredients( e ) {
        return e.ingredients.map( f => f.item.toLowerCase() ).join().includes( vm.searchQuery );
      }
      if ( this.filterDone ) {
        if ( this.filterFavourites ) {
          return this.recipes.filter( e => e.isFavorite && ( e.title.toLowerCase().includes( this.searchQuery ) || getIngredients( e ) ) )
        } else if ( this.filterTrylater ) {
          return this.recipes.filter( e => !e.tried && ( e.title.toLowerCase().includes( this.searchQuery ) || getIngredients( e ) ) )
        } else if ( this.selectedCuisine ) {
          return this.recipes.filter( e => {
            return this.recipeFilter( e ) && ( e.title.toLowerCase().includes( this.searchQuery ) || getIngredients( e ) )
          } )
        } else {
          return this.recipes.filter( e => e.title.toLowerCase().includes( this.searchQuery ) || getIngredients( e ) )
        }
      } else {
        return "A";
      }
    },
    noResultFor() {
      if ( this.filterFavourites ) return "noRecsInFavs";
      if ( this.filterTrylater ) return "noRecsInTL";
      if ( this.selectedCuisine ) return "noRecsInFtr";
      return "noRecs";
    },
  },
  methods: {
    ...mapActions( [ "setCurrentComponentAction", "setSortTypeAction", "deleteRecipeAction" ] ),
    onPageLoad( args ) {
      const page = args.object;
      page.bindingContext = new Observable();
      this.filterFavourites ? this.setComponent( "Favourites" ) : this.filterTrylater ? this.setComponent( "Try Later" ) : this.selectedCuisine ? this.setComponent( "Filtered recipes" ) : this.setComponent( "EnRecipes" );
      this.showFAB = true;
      if ( this.shakeEnabled ) startAccelerometerUpdates( data => this.onSensorData( data ) )
      if ( this.showSearch )
        this.hijackLocalBackEvent()

    },
    onPageUnload() {
      if ( this.shakeEnabled ) stopAccelerometerUpdates();
      this.releaseGlobalBackEvent();
      this.releaseLocalBackEvent();
    },
    // HELPERS
    showDrawer() {
      utils.showDrawer();
    },
    openSearch() {
      this.showSearch = true;
      this.showFAB = false;
      this.hijackLocalBackEvent();
    },
    closeSearch() {
      if ( this.searchQuery ) this.updateFilter();
      this.searchQuery = "";
      Utils.ad.dismissSoftInput();
      this.showSearch = false;
      this.showFAB = true;
      this.releaseLocalBackEvent();
    },
    setComponent( comp ) {
      this.setCurrentComponentAction( comp );
      this.hijackGlobalBackEvent();
    },
    clearSearch() {
      if ( this.searchQuery !== "" ) {
        this.updateFilter();
      }
    },
    formattedTotalTime( prepTime, cookTime ) {
      let t1 = prepTime.split( ":" );
      let t2 = cookTime.split( ":" );
      let minutes = parseInt( t1[ 1 ] ) + parseInt( t2[ 1 ] )
      let m = minutes % 60
      let h = parseInt( t1[ 0 ] ) + parseInt( t2[ 0 ] ) + Math.floor( minutes / 60 );
      let hr = localize( 'hr' )
      let min = localize( 'min' )
      return {
        time: h ? ( m ? `${h} ${hr} ${m} ${min}` : `${h} ${hr}` ) : `${m} ${min}`,
        duration: `${h}${m}`
      };
    },
    onScroll( args ) {
      this.viewIsScrolled = args.scrollOffset ? true : false;
    },
    randomRecipeID() { // TODO: show only from selected filter
      let min = 0
      let max = this.filteredRecipes.length - 1
      let randomIndex = Math.round( Math.random() * ( max - min ) )
      return this.filteredRecipes[ randomIndex ].id
    },
    recipeFilter( e ) {
      let cuisineMatched = e.cuisine === this.selectedCuisine
      let allCuisines = /allCuis/.test( this.selectedCuisine )
      let categoryMatched = e.category === this.selectedCategory
      let allCategories = /allCats/.test( this.selectedCategory )
      let tagMatched = e.tags.includes( this.selectedTag )
      let allTags = /allTs/.test( this.selectedTag )
      let cuisine = cuisineMatched || allCuisines

      return this.selectedTag && !allTags ? ( categoryMatched || allCategories ) && cuisine && tagMatched : this.selectedCategory && !allCategories ? cuisine && categoryMatched : cuisine
    },
    searchAll() {
      this.$emit( "backToHome" )
    },
    // NAVIGATION HANDLERS
    hijackLocalBackEvent() {
      this.releaseGlobalBackEvent();
      AndroidApplication.on( AndroidApplication.activityBackPressedEvent, this.searchBackEvent );
    },
    releaseLocalBackEvent() {
      AndroidApplication.off( AndroidApplication.activityBackPressedEvent, this.searchBackEvent );
      this.hijackGlobalBackEvent();
    },
    searchBackEvent( args ) {
      args.cancel = true;
      this.closeDrawer();
      this.closeSearch();
    },
    addRecipe() {
      this.showFAB = false;
      this.releaseGlobalBackEvent();
      this.$navigateTo( EditRecipe, {
        props: {
          selectedCuisine: this.selectedCuisine,
          selectedCategory: this.selectedCategory,
          selectedTag: this.selectedTag,
          filterFavourites: this.filterFavourites,
          filterTrylater: this.filterTrylater,
        }
      } );
    },
    viewRecipe( recipeID ) {
      this.showFAB = false;
      this.$navigateTo( ViewRecipe, {
        props: {
          filterTrylater: this.filterTrylater,
          recipeID
        },
        backstackVisible: false
      } );
    },
    viewRandomRecipe() {
      this.showFAB = false;
      this.$navigateTo( ViewRecipe, {
        props: {
          filterTrylater: false,
          recipeID: this.randomRecipeID()
        },
        backstackVisible: false
      } );
    },
    // LIST HANDLERS
    sortDialog() {
      this.releaseGlobalBackEvent();
      this.$showModal( ActionDialog, {
        props: {
          title: "srt",
          list: [ "Title", "Quickest first", "Slowest first", "Rating", "Difficulty level", "Last updated", "Newest first", "Oldest first" ],
          stretch: false,
          helpIcon: 'sort',
          bgColor: '#adb5bd',
        }
      } ).then( action => {
        if ( action && action !== "Cancel" && this.sortType !== action ) {
          this.setSortTypeAction( action )
          ApplicationSettings.setString( "sortType", action )
          this.updateSort();
        }
        this.hijackGlobalBackEvent();
      } );
    },
    updateSort() {
      let listView = this.$refs.listView.nativeView;
      listView.sortingFunction = undefined;
      listView.sortingFunction = this.sortFunction;
    },
    sortFunction( item, otherItem ) {
      const titleOrder = item.title.toLowerCase().localeCompare( otherItem.title.toLowerCase(), Device.language, {
        ignorePunctuation: true
      } );
      let d1 = this.formattedTotalTime( item.prepTime, item.cookTime ).duration;
      let d2 = this.formattedTotalTime( otherItem.prepTime, otherItem.cookTime ).duration;
      let ld1 = new Date( item.lastModified );
      let ld2 = new Date( otherItem.lastModified );
      let cd1 = new Date( item.created );
      let cd2 = new Date( otherItem.created );
      let r1 = item.rating
      let r2 = otherItem.rating

      function difficultyLevel( level ) {
        switch ( level ) {
          case "Easy":
            return 1;
          case "Moderate":
            return 2;
          case "Challenging":
            return 3;
        }
      }
      let dl1 = difficultyLevel( item.difficulty )
      let dl2 = difficultyLevel( otherItem.difficulty )
      switch ( this.sortType ) {
        case "Title":
          return titleOrder > 0 ? -1 : titleOrder < 0 ? 1 : 0;
          break;
        case "Quickest first":
          return d1 > d2 ? -1 : d1 < d2 ? 1 : 0;
          break;
        case "Slowest first":
          return d1 > d2 ? 1 : d1 < d2 ? -1 : 0;
          break;
        case "Rating":
          return r1 > r2 ? 1 : r1 < r2 ? -1 : 0;
          break;
        case "Difficulty level":
          return dl1 > dl2 ? -1 : dl1 < dl2 ? 1 : 0;
          break;
        case "Last updated":
          return ld1 < ld2 ? -1 : ld1 > ld2 ? 1 : 0;
          break;
        case "Newest first":
          return cd1 < cd2 ? -1 : cd1 > cd2 ? 1 : 0;
          break;
        case "Oldest first":
          return cd1 < cd2 ? 1 : cd1 > cd2 ? -1 : 0;
          break;
      }
    },
    callUpdateFilter() {
      clearTimeout( typingTimer )
      this.filterDone = false
      typingTimer = setTimeout( e => {
        this.updateFilter()
      }, 750 )
    },
    updateFilter() {
      let listView = this.$refs.listView.nativeView;
      setTimeout( e => {
        listView.filteringFunction = undefined;
        listView.filteringFunction = this.filterFunction;
      }, 1 );
      this.filterDone = true
    },
    filterFunction( e ) {
      let ingredients = e.ingredients.map( e => e.item.toLowerCase() ).join().includes( this.searchQuery )
      if ( this.filterFavourites ) {
        return e.isFavorite ? e.title.toLowerCase().includes( this.searchQuery ) || ingredients : false;
      } else if ( this.filterTrylater ) {
        return e.tried ? false : e.title.toLowerCase().includes( this.searchQuery ) || ingredients
      } else if ( this.selectedCuisine ) {
        return this.recipeFilter( e ) ? e.title.toLowerCase().includes( this.searchQuery ) || ingredients : false;
      } else {
        return e.title.toLowerCase().includes( this.searchQuery ) || ingredients
      }
    },
    onSwiping( {
      data,
      object
    } ) {
      const swipeLimits = data.swipeLimits;
      const swipeView = object;
      const rightItem = swipeView.getViewById( "delete-action" );
      swipeLimits.right = rightItem.getMeasuredWidth() - 8;
      swipeLimits.threshold = swipeLimits.right - 4;
      if ( data.x < -swipeLimits.threshold ) {
        this.rightAction = true;
        swipeView.notifySwipeToExecuteFinished();
      }
    },
    onSwipeEnded( {
      index
    } ) {
      let recipeID = this.recipes[ index ].id;
      if ( this.rightAction && !this.deletionDialogActive ) this.deleteRecipe( index, recipeID );
      this.rightAction = false;
    },
    // DATA HANDLERS
    deleteRecipe( index, recipeID ) {
      this.deletionDialogActive = true;
      this.$showModal( ConfirmDialog, {
        props: {
          title: localize( "conf" ),
          description: `${localize('delRecInfo')} "${this.recipes[index].title}"`,
          cancelButtonText: "cBtn",
          okButtonText: "dBtn",
          helpIcon: 'trash',
          bgColor: '#c92a2a',
        }
      } ).then( action => {
        if ( action ) {
          this.deleteRecipeAction( {
            index,
            id: recipeID
          } );
          if ( !this.filteredRecipes.length )
            this.$emit( 'backToHome' )
        }
        this.deletionDialogActive = false;
      } );
    },
    // SHAKE DETECTOR
    onSensorData( {
      x,
      y,
      z
    } ) {
      x = x.toFixed( 2 )
      y = y.toFixed( 2 )
      z = z.toFixed( 2 )
      const FORCE_THRESHOLD = 1;
      const TIME_THRESHOLD = 150;
      const SHAKE_TIMEOUT = 600;
      const SHAKE_THROTTLE = 600;
      const SHAKE_COUNT = 3;
      const now = time()
      if ( ( now - lastForce ) > SHAKE_TIMEOUT ) {
        shakeCount = 0;
      }
      let timeDelta = now - lastTime;
      if ( timeDelta > TIME_THRESHOLD ) {
        let forceVector = Math.abs( Math.sqrt( Math.pow( x, 2 ) + Math.pow( y, 2 ) + Math.pow( z, 2 ) ) - 1 );
        if ( forceVector > FORCE_THRESHOLD ) {
          shakeCount++;
          if ( ( shakeCount >= SHAKE_COUNT ) && ( now - lastShake > SHAKE_THROTTLE ) ) {
            lastShake = now;
            shakeCount = 0;
            if ( this.filteredRecipes.length ) {
              vibrator.vibrate( 100 )
              this.viewRandomRecipe()
            }
          }
          lastForce = now;
        }
        lastTime = now;
      }
    },
  },
  mounted() {
    this.showFAB = true;
  }
};
</script>
