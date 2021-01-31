<template>
<Page @loaded="onPageLoad" actionBarHidden="true" :androidStatusBarBackground="appTheme == 'Light' ? '#f0f0f0' : '#1A1A1A'">

  <Drawer @loaded="drawerLoad" :gestureEnabled="gestures" leftSwipeDistance="128">
    <GridLayout ~leftDrawer rows="*, auto" columns="*" width="280" class="sd">
      <StackLayout row="0">
        <GridLayout rows="48" columns="auto, *, auto" v-for="(item, index) in topmenu" :key="index" class="sd-item orkm" :class="{
              'selected': currentComponent === item.component,
            }">
          <MDRipple colSpan="3" @tap="navigateTo(item.component, item.component, false)" />
          <Label col="0" class="er" :text="icon[item.icon]" />
          <Label col="1" :text="`${item.title}` | L" />
          <Label class="recipeCount" v-if="getRecipeCount(item.title)" :text="getRecipeCount(item.title)" col="2" />
        </GridLayout>
        <GridLayout class="sd-group-header orkm" rows="auto" columns="*, auto" v-if="cuisinesWithRecipes.length">
          <Label class="filterPath" verticalAlignment="center" col="0" :text="getCurrentPath | L" textWrap='true' />
          <MDButton :visibility="selectedCuisine?'visible':'hidden'" variant="text" @tap="previousRecipeFilter" class="er" col="2" :text="icon.back" />
        </GridLayout>
        <ScrollView height="100%">
          <StackLayout>
            <GridLayout v-for="(item, index) in getRecipeList" :key="index" class="sd-item orkm" :class="{
                  'selected': selectedTag == item,
                }" columns="auto, *, auto">
              <MDRipple colSpan="3" @tap="setFilter && setRecipeFilter(item)" />
              <Label col="0" class="er" :text="icon[selectedFilterType]" />
              <Label col="1" :text="`${item}` | L" />
              <Label class="recipeCount" :text="getRecipeCount(item)" col="2" />
            </GridLayout>
            <GridLayout v-if="selectedFilterType =='tag' && !tagsWithRecipes.length" columns="*" rows="*">
              <Label class="noTags" :text="'noTs' | L" textWrap="true" />
            </GridLayout>
          </StackLayout>
        </ScrollView>
      </StackLayout>
      <StackLayout row="1">
        <StackLayout class="hr" margin="0 8 8"></StackLayout>
        <GridLayout rows="48" columns="auto, *" class="sd-item orkm" :class="{
              'selected': currentComponent == 'MealPlanner',
            }">
          <MDRipple row="0" colSpan="3" @tap="navigateTo(MealPlanner, 'MealPlanner', true)" />
          <Label col="0" class="er" :text="icon.cal" />
          <Label col="2" :text="'planner' | L" />
        </GridLayout>

        <!-- <GridLayout rows="48" columns="auto, *" class="sd-item orkm" :class="{
              'selected': currentComponent == 'GroceryList',
            }">
          <MDRipple row="0" colSpan="3" @tap="navigateTo(GroceryList, 'GroceryList', true)" />
          <Label col="0" class="er" :text="icon.bag" />
          <Label col="2" :text="'grocery' | L" />
        </GridLayout>
        <GridLayout rows="48" columns="auto, *" class="sd-item orkm" :class="{
              'selected': currentComponent == 'GroceryList',
            }">
          <MDRipple row="0" colSpan="3" @tap="navigateTo(GroceryList, 'GroceryList', true)" />
          <Label col="0" class="er" :text="icon.price" />
          <Label col="2" :text="'Price List' | L" />
        </GridLayout> -->

        <StackLayout class="hr" margin="8"></StackLayout>

        <GridLayout class="sd-item orkm" :class="{
              'selected': currentComponent == 'Settings',
            }" rows="48" columns="auto, *">
          <MDRipple colSpan="3" @tap="navigateTo(Settings, 'Settings', true)" />
          <Label class="er" col="0" :text="icon.cog" />
          <Label col="2" :text="'Settings' | L" />
        </GridLayout>

      </StackLayout>
    </GridLayout>
    <Frame ~mainContent id="main-frame">
      <EnRecipes ref="enrecipes" :filterFavourites="filterFavourites" :filterTrylater="filterTrylater" :selectedCuisine="selectedCuisine" :selectedCategory="selectedCategory" :selectedTag="selectedTag" :closeDrawer="closeDrawer"
        :hijackGlobalBackEvent="hijackGlobalBackEvent" :releaseGlobalBackEvent="releaseGlobalBackEvent" @backToHome="backToHome" :showDrawer="showDrawer" @selectModeOn="selectModeOn" />
    </Frame>
  </Drawer>
</Page>
</template>

<script>
import {
  ApplicationSettings,
  AndroidApplication,
  Application,
}
from "@nativescript/core"
import Theme from "@nativescript/theme"
import {
  localize
}
from "@nativescript/localize"
import {
  mapActions,
  mapState
}
from "vuex"
import EnRecipes from "./EnRecipes"
import ViewRecipe from "./ViewRecipe"
import MealPlanner from "./MealPlanner"
import GroceryList from "./GroceryList"
import Settings from "./Settings"
import PromptDialog from "./modal/PromptDialog"
let filterTimer;
export default {
  data() {
    return {
      selectedCuisine: null,
      selectedCategory: null,
      selectedTag: null,
      selectedFilterType: 'cuisine',
      filterFavourites: false,
      filterTrylater: false,
      MealPlanner: MealPlanner,
      GroceryList: GroceryList,
      Settings: Settings,
      topmenu: [ {
        title: "EnRecipes",
        component: "EnRecipes",
        icon: "home",
      }, {
        title: "trylater",
        component: "Try Later",
        icon: "try",
      }, {
        title: "favourites",
        component: "Favourites",
        icon: "fav",
      }, ],
      appTheme: "Light",
      setFilter: true,
      gestures: true,
      drawer: null,
    }
  },
  components: {
    EnRecipes,
    ViewRecipe,
    MealPlanner,
    GroceryList,
    Settings
  },
  computed: {
    ...mapState( [ "icon", "recipes", "cuisines", "categories", "yieldUnits", "mealPlans", "currentComponent" ] ),
    getCurrentPath() {
      let path = "/"
      if ( this.selectedCuisine ) path += localize( this.selectedCuisine )
      else path = "cuis"
      if ( this.selectedCategory ) path += "/" + localize( this.selectedCategory )
      if ( this.selectedTag ) path += "/" + localize( this.selectedTag )
      return path;
    },
    getRecipeList() {
      switch ( this.selectedFilterType ) {
        case 'cuisine':
          return this.cuisinesWithRecipes
          break;
        case 'category':
          return this.categoriesWithRecipes
          break;
        case 'tag':
          return this.tagsWithRecipes
          break;
      }
    },
    cuisinesWithRecipes() {
      let arr = this.recipes.map( ( e ) => e.cuisine ).sort()
      return arr.length ? [ "allCuis", ...new Set( arr ) ] : []
    },
    categoriesWithRecipes() {
      let arr = this.recipes.map( e => ( this.selectedCuisine === "allCuis" || e.cuisine === this.selectedCuisine ) && e.category ).filter( e => e ).sort()
      return arr.length ? [ "allCats", ...new Set( arr ) ] : []
    },
    tagsWithRecipes() {
      let arr = this.recipes.map( e => {
        if ( this.selectedCuisine === "allCuis" && this.selectedCategory === "allCats" && e.tags.length ) return e.tags;
        else if ( this.selectedCuisine === "allCuis" && e.category === this.selectedCategory && e.tags.length ) return e.tags;
        else if ( this.selectedCategory === "allCats" && e.cuisine === this.selectedCuisine && e.tags.length ) return e.tags;
        else if ( e.category === this.selectedCategory && e.cuisine === this.selectedCuisine && e.tags.length ) return e.tags;
      } ).flat().filter( e => e ).sort()
      let showAllTags = this.selectedCuisine === "allCuis" && this.selectedCategory === "allCats"
      return arr.length ? [ !showAllTags && "allTs", ...new Set( arr ) ].filter( e => e ) : []
    },
  },
  methods: {
    ...mapActions( [ "setCurrentComponentAction", "initializeListItems", "initializeRecipes", "initializeMealPlans", "setShakeAction" ] ),
    onPageLoad() {
      if ( this.appTheme === "Light" ) {
        const View = android.view.View
        const window = Application.android.startActivity.getWindow()
        const decorView = window.getDecorView()
        decorView.setSystemUiVisibility( View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR )
      }
    },
    drawerLoad( args ) {
      this.drawer = args.object
    },

    // HELPERS
    setRecipeFilter( item ) {
      this.setFilter = this.filterFavourites = this.filterTrylater = false
      this.$navigateBack( {
        frame: "main-frame",
        backstackVisible: false
      } )
      setTimeout( e => {
        if ( this.selectedCuisine == null ) {
          this.selectedCuisine = item
          this.selectedFilterType = 'category'
        } else if ( this.selectedCategory == null ) {
          this.selectedCategory = item
          this.selectedFilterType = 'tag'
          if ( !this.tagsWithRecipes.length ) this.closeDrawer()
        } else {
          this.selectedTag = item;
          this.closeDrawer()
        }
        this.setFilter = true
      }, 250 )
      this.setCurrentComponentAction( "Filtered recipes" )
    },
    previousRecipeFilter() {
      if ( this.selectedCategory ) {
        this.selectedFilterType = 'category'
        this.selectedTag = this.selectedCategory = null
        this.setCurrentComponentAction( "Filtered recipes" )
      } else {
        this.selectedFilterType = 'cuisine'
        this.selectedCuisine = null
        this.setCurrentComponentAction( "EnRecipes" )
      }
    },
    showDrawer() {
      this.drawer.open()
    },
    closeDrawer() {
      this.drawer.close()
    },
    getRecipeCount( arg ) {
      let count = ''
      switch ( arg ) {
        case 'EnRecipes':
          count = this.recipes.length
          break;
        case 'trylater':
          count = this.recipes.filter( e => !e.tried ).length
          break;
        case 'favourites':
          count = this.recipes.filter( e => e.isFavorite ).length
          break;
        default: {
          switch ( this.selectedFilterType ) {
            case 'cuisine':
              count = this.recipes.filter( e => arg === "allCuis" ? e.cuisine : e.cuisine === arg ).length
              break;
            case 'category':
              count = this.recipes.filter( e => this.selectedCuisine === "allCuis" ? arg === "allCats" ? e.category : e.category === arg : arg === "allCats" ? e.cuisine === this.selectedCuisine && e.category : e.cuisine === this
                .selectedCuisine && e.category === arg ).length
              break;
            case 'tag':
              count = this.recipes.filter( e => {
                if ( this.selectedCuisine === "allCuis" && this.selectedCategory === "allCats" ) {
                  return e.tags.includes( arg ) || arg === "allTs"
                } else if ( this.selectedCuisine === "allCuis" && e.category === this.selectedCategory ) {
                  return e.tags.includes( arg ) || arg === "allTs"
                } else if ( this.selectedCategory === "allCats" && e.cuisine === this.selectedCuisine ) {
                  return e.tags.includes( arg ) || arg === "allTs"
                } else if ( e.category === this.selectedCategory && e.cuisine === this.selectedCuisine ) {
                  return e.tags.includes( arg ) || arg === "allTs"
                }
              } ).length
              break;
          }
        }
      }
      return count
    },
    selectModeOn( bool ) {
      this.gestures = bool
    },
    // NAVIGATION HANDLERS
    hijackGlobalBackEvent() {
      AndroidApplication.on( AndroidApplication.activityBackPressedEvent, this.globalBackEvent )
    },
    releaseGlobalBackEvent() {
      AndroidApplication.off( AndroidApplication.activityBackPressedEvent, this.globalBackEvent )
    },
    globalBackEvent( args ) {
      if ( this.drawer && this.drawer.isOpened() ) {
        args.cancel = true
        this.closeDrawer()
      } else if (
        [ "Favourites", "Try Later", "Filtered recipes" ].includes( this.currentComponent ) ) {
        args.cancel = true
        this.backToHome()
      }
    },
    backToHome() {
      this.setCurrentComponentAction( "EnRecipes" )
      this.filterFavourites = this.filterTrylater = false
      this.selectedTag = this.selectedCategory = this.selectedCuisine = null
      this.selectedFilterType = "cuisine"
    },
    navigateTo( to, title, isTrueComponent ) {
      if ( title !== this.currentComponent ) {
        if ( isTrueComponent ) {
          this.$navigateTo( to, {
            backstackVisible: true
          } )
          this.closeDrawer()
        } else {
          this.setCurrentComponentAction( to )
          this.$navigateBack( {
            frame: "main-frame",
            backstackVisible: false
          } )
          this.filterFavourites = to === "Favourites"
          this.filterTrylater = to === "Try Later"
          this.closeDrawer()
          this.selectedTag = this.selectedCategory = this.selectedCuisine = null
          this.selectedFilterType = "cuisine"
        }
      } else {
        this.closeDrawer()
      }
    },
  },
  created() {
    this.appTheme = ApplicationSettings.getString( "appTheme", "Light" )
    setTimeout( ( e ) => {
      Theme.setMode( Theme[ this.appTheme ] )
    }, 10 )
    if ( !this.recipes.length ) this.initializeRecipes()
    this.initializeListItems()
    if ( !this.mealPlans.length ) this.initializeMealPlans()
    this.setShakeAction( ApplicationSettings.getBoolean( "shakeEnabled", true ) )
  },
}
</script>
