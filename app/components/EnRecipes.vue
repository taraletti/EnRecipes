<template>
  <Frame @loaded="onFrameLoad" :class="appTheme">
    <Page @loaded="onPageLoad" @unloaded="onPageUnload" actionBarHidden="true">
      <GridLayout rows="*, auto, auto" columns="*">
        <CollectionView
          rowSpan="3"
          :spanSize="getSpanSize"
          for="recipe in getList"
          @loaded="onListLoad"
          :itemTemplateSelector="getLayout"
          :colWidth="layout == 'grid' || layout == 'photogrid' ? '50%' : '100%'"
          @scroll="!selectMode && onScroll($event)"
        >
          <v-template name="header">
            <GridLayout rows="auto" columns="*, auto, 12">
              <Label class="pageTitle" :text="`${currentComponent}` | L" />
              <Button
                col="1"
                class="ico"
                :text="icon.cog"
                @tap="navigateTo(Settings, 'Settings', true)"
              />
            </GridLayout>
          </v-template>
          <v-template name="lists">
            <StackLayout orientation="horizontal" padding="0 16 16">
              <GridLayout
                rows="48"
                columns="auto, auto"
                class="segment"
                v-for="(item, index) in topmenu"
                :key="index"
                :class="{
                  select: currentComponent === item.title,
                }"
                @touch="touchSelector($event, item.title, item.title)"
              >
                <Label class="ico" :text="icon[item.icon]" />
                <Label
                  class="value"
                  :hidden="!getRecipeCount(item.title)"
                  :text="getRecipeCount(item.title)"
                  col="1"
                />
              </GridLayout>
              <GridLayout
                :hidden="currentComponent !== 'Filtered recipes'"
                rows="48"
                columns="auto, auto"
                class="segment"
                :class="{
                  select: currentComponent === 'Filtered recipes',
                }"
              >
                <Label class="ico" :text="icon.filter" />
                <Label
                  class="value"
                  :text="getRecipeCount('filtered')"
                  col="1"
                />
              </GridLayout>
            </StackLayout>
          </v-template>
          <v-template name="detailed">
            <GridLayout
              class="recipeItem"
              :class="getItemPos(recipe.id)"
              rows="auto"
              columns="96, *"
              ref="recipe"
              @longPress="
                selectMode ? viewRecipe(recipe.id) : addToSelection(recipe.id)
              "
              @tap="
                selectMode ? addToSelection(recipe.id) : viewRecipe(recipe.id)
              "
            >
              <Image
                class="imgHolder"
                verticalAlignment="top"
                v-if="recipe.imageSrc"
                :src="recipe.imageSrc"
                stretch="none"
                decodeWidth="96"
                decodeHeight="96"
                loadMode="async"
              />
              <Label
                v-else
                class="ico imgHolder"
                verticalAlignment="top"
                @loaded="centerLabel"
                width="96"
                height="96"
                fontSize="48"
                :text="icon.img"
              />
              <StackLayout class="recipeInfo" col="1">
                <Label :text="recipe.title" class="tb title tw" />
                <StackLayout class="attributes" orientation="horizontal"
                  ><Label class="ico sm" :text="icon.cuisine" />
                  <Label class="attr" :text="recipe.cuisine | L" />
                  <Label class="ico sm" :text="icon.category" />
                  <Label class="attr" :text="recipe.category | L" />
                </StackLayout>
                <StackLayout
                  :hidden="!recipe.tags.length"
                  class="attributes"
                  orientation="horizontal"
                >
                  <Label class="ico sm" :text="icon.tag" />
                  <Label class="attr" :text="getTags(recipe.tags)" />
                </StackLayout>
                <StackLayout class="attributes" orientation="horizontal">
                  <Label class="ico sm" :text="icon.star" />
                  <Label class="attr" :text="recipe.rating" />
                  <Label class="ico sm" :text="icon.time" />
                  <Label
                    class="attr"
                    :text="`${
                      formattedTotalTime(recipe.prepTime, recipe.cookTime).time
                    }`"
                  />
                  <Label class="ico sm" :text="icon.diff" />
                  <Label class="attr" :text="recipe.difficulty | L" />
                </StackLayout>
              </StackLayout>
            </GridLayout>
          </v-template>
          <v-template name="grid">
            <GridLayout
              class="recipeItem grid"
              :class="getItemPos(recipe.id)"
              rows="auto, auto"
              columns="*"
              ref="recipe"
              @longPress="
                selectMode ? viewRecipe(recipe.id) : addToSelection(recipe.id)
              "
              @tap="
                selectMode ? addToSelection(recipe.id) : viewRecipe(recipe.id)
              "
            >
              <Image
                class="imgHolder"
                v-if="recipe.imageSrc"
                :src="recipe.imageSrc"
                stretch="aspectFit"
                :decodeWidth="imgWidth"
                :decodeHeight="imgWidth"
                loadMode="async"
              />
              <Label
                v-else
                width="100%"
                :height="imgWidth"
                @loaded="centerLabel"
                class="ico imgHolder"
                :fontSize="imgWidth / 2"
                :text="icon.img"
              />
              <StackLayout class="recipeInfo" row="1">
                <Label :text="recipe.title" class="tb title tw" />
                <StackLayout class="attributes" orientation="horizontal">
                  <Label class="ico sm" :text="icon.cuisine" />
                  <Label class="attr" :text="recipe.cuisine | L" />
                </StackLayout>
                <StackLayout class="attributes" orientation="horizontal">
                  <Label class="ico sm" :text="icon.category" />
                  <Label class="attr" :text="recipe.category | L" />
                </StackLayout>
                <StackLayout
                  :hidden="!recipe.tags.length"
                  class="attributes"
                  orientation="horizontal"
                >
                  <Label class="ico sm" :text="icon.tag" />
                  <Label class="attr" :text="getTags(recipe.tags)" />
                </StackLayout>
              </StackLayout>
            </GridLayout>
          </v-template>
          <v-template name="photogrid">
            <GridLayout
              class="recipeItem grid"
              :class="getItemPos(recipe.id)"
              rows="auto, auto"
              columns="*"
              ref="recipe"
              @longPress="
                selectMode ? viewRecipe(recipe.id) : addToSelection(recipe.id)
              "
              @tap="
                selectMode ? addToSelection(recipe.id) : viewRecipe(recipe.id)
              "
            >
              <Image
                class="imgHolder"
                v-if="recipe.imageSrc"
                :src="recipe.imageSrc"
                stretch="aspectFit"
                :decodeWidth="imgWidth"
                :decodeHeight="imgWidth"
                loadMode="async"
              />
              <Label
                v-else
                width="100%"
                :height="imgWidth"
                @loaded="centerLabel"
                class="ico imgHolder"
                :fontSize="imgWidth / 2"
                :text="icon.img"
              />
              <StackLayout class="recipeInfo" row="1">
                <Label :text="recipe.title" class="tb title tw" />
              </StackLayout>
            </GridLayout>
          </v-template>
          <v-template name="simple">
            <GridLayout
              class="recipeItem simple"
              :class="getItemPos(recipe.id)"
              columns="*"
              ref="recipe"
              @longPress="
                selectMode ? viewRecipe(recipe.id) : addToSelection(recipe.id)
              "
              @tap="
                selectMode ? addToSelection(recipe.id) : viewRecipe(recipe.id)
              "
            >
              <StackLayout class="recipeInfo">
                <Label :text="recipe.title" class="tb title tw" />
                <StackLayout class="attributes" orientation="horizontal">
                  <Label class="ico sm" :text="icon.cuisine" />
                  <Label class="attr" :text="recipe.cuisine | L" />
                  <Label class="ico sm" :text="icon.category" />
                  <Label class="attr" :text="recipe.category | L" />
                </StackLayout>
                <StackLayout
                  :hidden="!recipe.tags.length"
                  class="attributes"
                  orientation="horizontal"
                >
                  <Label class="ico sm" :text="icon.tag" />
                  <Label class="attr" :text="getTags(recipe.tags)" />
                </StackLayout>
              </StackLayout>
            </GridLayout>
          </v-template>
          <v-template name="minimal">
            <GridLayout
              class="recipeItem simple minimal"
              :class="getItemPos(recipe.id)"
              columns="*"
              ref="recipe"
              @longPress="
                selectMode ? viewRecipe(recipe.id) : addToSelection(recipe.id)
              "
              @tap="
                selectMode ? addToSelection(recipe.id) : viewRecipe(recipe.id)
              "
            >
              <StackLayout class="recipeInfo">
                <Label :text="recipe.title" class="tb title tw" />
              </StackLayout>
            </GridLayout>
          </v-template>
        </CollectionView>
        <GridLayout rowSpan="2" rows="*, auto" columns="*">
          <StackLayout
            row="1"
            class="emptyState"
            v-if="!recipes.length && !filterFavourites && !filterTrylater"
          >
            <Label class="title" :text="'strAdd' | L" />
            <Label :text="'plsAdd' | L" />
          </StackLayout>
          <StackLayout
            row="1"
            class="emptyState"
            v-if="!filteredRecipes.length && filterTrylater && !searchQuery"
          >
            <Label class="title" :text="'aD' | L" />
            <Label :text="'tLInfo' | L" />
          </StackLayout>
          <StackLayout
            row="1"
            class="emptyState"
            v-if="!filteredRecipes.length && filterFavourites && !searchQuery"
          >
            <Label class="title" :text="'noFavs' | L" />
            <Label :text="'fsList' | L" />
          </StackLayout>
          <StackLayout
            row="1"
            class="emptyState"
            v-if="!filteredRecipes.length && searchQuery"
          >
            <Label class="title" :text="`${noResultFor}` | L" />
            <Button
              v-if="filterFavourites || filterTrylater || selectedCuisine"
              class="text big"
              :text="'trySer' | L"
              @tap="goToHome"
            />
          </StackLayout>
        </GridLayout>
        <GridLayout
          row="1"
          rows="auto"
          columns="auto"
          class="appbar toolbar"
          :hidden="!showTools"
        >
          <GridLayout
            row="1"
            rows="48"
            class="tool"
            columns="auto, *"
            @touch="touchTool($event, MealPlanner, 'MealPlanner')"
          >
            <Label class="ico" :text="icon.cal" />
            <Label col="1" :text="'planner' | L" />
          </GridLayout>
        </GridLayout>
        <GridLayout
          row="2"
          @loaded="onAppBarLoad"
          class="appbar"
          columns="auto, *, auto, auto, auto, auto"
        >
          <Button
            class="ico"
            @tap="
              showSearch
                ? closeSearch()
                : selectMode
                ? clearSelection()
                : toggleTools()
            "
            :text="
              showSearch
                ? icon.back
                : selectMode || showTools
                ? icon.x
                : icon.menu
            "
          />
          <TextField
            id="searchBar"
            @loaded="focusField"
            v-if="showSearch"
            col="1"
            colSpan="5"
            :hint="'ser' | L"
            @textChange="updateList($event.value)"
          />
          <Label
            :hidden="!selectMode"
            class="title"
            :text="`${selection.length} ${$options.filters.L('sltd')}`"
            col="1"
          />
          <StackLayout
            col="2"
            colSpan="3"
            orientation="horizontal"
            :hidden="!recipes.length || selectMode || showSearch"
          >
            <Button
              class="ico"
              :text="selectMode ? icon.exp : icon.sear"
              @tap="selectMode ? exportSelection() : openSearch()"
            />
            <Button class="ico" :text="icon.sort" @tap="openSort" />
            <Button class="ico" :text="icon.filter" @tap="openFilters" />
          </StackLayout>
          <Button
            :hidden="showSearch || selectMode"
            class="ico fab"
            :text="icon.plus"
            col="5"
            @tap="addRecipe"
          />
          <Button
            :hidden="!selectMode"
            class="ico"
            :text="icon.del"
            col="5"
            @tap="deleteSelection"
          />
        </GridLayout>
      </GridLayout>
    </Page>
  </Frame>
</template>

<script>
import {
  ApplicationSettings,
  AndroidApplication,
  Application,
  Utils,
  Observable,
  Device,
  Screen,
  Color,
  CoreTypes,
} from "@nativescript/core";
import { localize } from "@nativescript/localize";
import {
  startAccelerometerUpdates,
  stopAccelerometerUpdates,
} from "@triniwiz/nativescript-accelerometer";
import { mapActions, mapState } from "vuex";
import ViewRecipe from "./ViewRecipe";
import EditRecipe from "./EditRecipe";
import MealPlanner from "./MealPlanner";
import GroceryList from "./GroceryList";
import Settings from "./Settings";
import ActionDialog from "./modal/ActionDialog.vue";
import ConfirmDialog from "./modal/ConfirmDialog.vue";
import Filters from "./modal/Filters.vue";
import * as utils from "~/shared/utils";
let lastTime = 0;
let lastShake = 0;
let lastForce = 0;
let shakeCount = 0;
let typingTimer;
let filterTimer;
export default {
  data() {
    return {
      searchQuery: "",
      showSearch: false,
      deletionDialogActive: false,
      selection: [],
      selectMode: false,
      listview: null,
      appbar: null,
      scrollPos: 1,
      filterFavourites: false,
      filterTrylater: false,
      MealPlanner: MealPlanner,
      GroceryList: GroceryList,
      Settings: Settings,
      topmenu: [
        {
          title: "EnRecipes",
          icon: "home",
        },
        {
          title: "trylater",
          icon: "try",
        },
        {
          title: "favourites",
          icon: "fav",
        },
      ],
      showTools: false,
    };
  },
  components: {
    ViewRecipe,
    EditRecipe,
    MealPlanner,
    GroceryList,
    Settings,
  },
  computed: {
    ...mapState([
      "icon",
      "sortType",
      "recipes",
      "cuisines",
      "categories",
      "yieldUnits",
      "mealPlans",
      "shakeEnabled",
      "currentComponent",
      "layout",
      "selectedCuisine",
      "selectedCategory",
      "selectedTag",
      "appTheme",
    ]),
    filteredRecipes() {
      let vm = this;
      function getIngredients(e) {
        return e.ingredients
          .map((f) => f.item.toLowerCase())
          .join()
          .includes(vm.searchQuery);
      }
      if (this.filterFavourites) {
        return this.recipes
          .filter(
            (e) =>
              e.isFavorite &&
              (e.title.toLowerCase().includes(this.searchQuery) ||
                getIngredients(e))
          )
          .sort(this.sortFunction);
      } else if (this.filterTrylater) {
        return this.recipes
          .filter(
            (e) =>
              !e.tried &&
              (e.title.toLowerCase().includes(this.searchQuery) ||
                getIngredients(e))
          )
          .sort(this.sortFunction);
      } else if (this.selectedCuisine) {
        return this.recipes
          .filter((e) => {
            return (
              this.recipeFilter(e) &&
              (e.title.toLowerCase().includes(this.searchQuery) ||
                getIngredients(e))
            );
          })
          .sort(this.sortFunction);
      } else {
        return this.recipes
          .filter(
            (e) =>
              e.title.toLowerCase().includes(this.searchQuery) ||
              getIngredients(e)
          )
          .sort(this.sortFunction);
      }
    },
    getList() {
      return [{}, {}].concat(this.filteredRecipes);
    },
    noResultFor() {
      if (this.filterFavourites || this.filterTrylater || this.selectedCuisine)
        return "noRecsInL";
      return "noRecs";
    },
    imgWidth() {
      return Screen.mainScreen.widthDIPs / 2 - 24;
    },
  },
  methods: {
    ...mapActions([
      "setComponent",
      "initListItems",
      "initRecipes",
      "initMealPlans",
      "setShake",
      "setFirstDay",
      "setLayout",
      "setSortType",
      "deleteRecipeAction",
      "deleteRecipesAction",
      "clearFilter",
      "setTheme",
    ]),
    onFrameLoad() {
      const View = android.view.View;
      const window = Application.android.startActivity.getWindow();
      const decorView = window.getDecorView();
      let sdkv = Device.sdkVersion;
      this.appTheme == "Light"
        ? decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR)
        : decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_DARK_STATUS_BAR);
      function setColors(color) {
        window.setStatusBarColor(new Color(color).android);
        sdkv >= 27 && window.setNavigationBarColor(new Color(color).android);
      }
      switch (this.appTheme) {
        case "Light":
          setColors("#f1f3f5");
          break;
        case "Dark":
          setColors("#212529");
          break;
        default:
          setColors("#000000");
          break;
      }
      if (sdkv >= 27)
        this.appTheme == "Light"
          ? decorView.setSystemUiVisibility(
              View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
            )
          : decorView.setSystemUiVisibility(
              View.SYSTEM_UI_FLAG_DARK_NAVIGATION_BAR
            );
    },
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
      this.filterFavourites
        ? this.setComponent("favourites")
        : this.filterTrylater
        ? this.setComponent("trylater")
        : this.selectedCuisine
        ? this.setComponent("Filtered recipes")
        : this.setComponent("EnRecipes");
      if (this.shakeEnabled) {
        if (utils.hasAccelerometer())
          startAccelerometerUpdates((data) => this.onSensorData(data));
        else this.setShake(false);
      }
      this.hijackBackEvent();
      setTimeout(() => {
        if (this.listview) this.listview.refresh();
      }, 1000);
      this.showTools = false;
    },
    onPageUnload() {
      if (this.shakeEnabled) stopAccelerometerUpdates();
    },
    onAppBarLoad({ object }) {
      this.appbar = object;
    },

    // COLLECTIONVIEW
    onListLoad({ object }) {
      const View = android.view.View;
      object.android.setOverScrollMode(View.OVER_SCROLL_NEVER);
      this.listview = object;
    },
    onScroll(args) {
      this.showTools = false;
      let scrollUp;
      let y = args.object.scrollOffset;
      if (y) {
        scrollUp = y < this.scrollPos;
        this.scrollPos = Math.abs(y);
        let ab = this.appbar.translateY;
        if (!scrollUp && ab == 0) {
          this.appbar.animate({
            translate: { x: 0, y: 64 },
            duration: 250,
            curve: CoreTypes.AnimationCurve.ease,
          });
        } else if (scrollUp && ab == 64) {
          this.appbar.animate({
            translate: { x: 0, y: 0 },
            duration: 250,
            curve: CoreTypes.AnimationCurve.ease,
          });
        }
      }
    },
    getSpanSize(index) {
      return (this.layout == "grid" || this.layout == "photogrid") &&
        (index == 0 || index == 1)
        ? 2
        : 1;
    },
    getLayout(args, index, items) {
      return index == 0 ? "header" : index == 1 ? "lists" : this.layout;
    },

    // SEARCH
    openSearch() {
      this.showTools = false;
      this.showSearch = true;
    },
    closeSearch() {
      this.searchQuery = "";
      Utils.ad.dismissSoftInput();
      this.showSearch = false;
    },

    //SORT
    openSort() {
      this.showTools = false;
      this.releaseBackEvent();
      this.$showModal(ActionDialog, {
        props: {
          title: "srt",
          list: [
            "title",
            "Rating",
            "Quickest first",
            "Slowest first",
            "Difficulty level",
            "Last updated",
            "Newest first",
            "Oldest first",
          ],
        },
      }).then((action) => {
        if (action && action !== "Cancel" && this.sortType !== action) {
          this.setSortType(action);
          ApplicationSettings.setString("sortType", action);
          this.updateSort();
        }
        this.hijackBackEvent();
      });
    },

    //FILTER
    openFilters() {
      this.setComponent("EnRecipes");
      this.filterFavourites = this.filterTrylater = false;
      this.showTools = false;
      this.releaseBackEvent();
      this.$showModal(Filters).then(() => this.hijackBackEvent());
    },

    // TOOLS
    toggleTools() {
      this.showTools = !this.showTools;
    },

    // LIST HANDLERS
    addToSelection(id) {
      this.showTools = false;
      this.selectMode = true;
      this.appbar.translateY = 0;
      this.selection.includes(id)
        ? this.selection.splice(this.selection.indexOf(id), 1)
        : this.selection.push(id);
      this.selection.length ? this.listview.refresh() : this.clearSelection();
    },
    clearSelection() {
      this.selectMode = false;
      this.selection = [];
      this.listview.refresh();
    },
    deleteSelection() {
      this.selection.length === 1
        ? this.deleteRecipe(this.selection[0])
        : this.deleteRecipes(this.selection);
    },
    exportSelection() {},
    deleteRecipe(id) {
      this.deletionDialogActive = true;
      let index = this.recipes.findIndex((e) => e.id === id);
      let recipeTitle = `"${this.recipes[index].title}"`;
      this.$showModal(ConfirmDialog, {
        props: {
          title: localize("conf"),
          description: `${localize("delRecInfo", recipeTitle)}`,
          cancelButtonText: "cBtn",
          okButtonText: "dBtn",
        },
      }).then((action) => {
        if (action) {
          this.deleteRecipeAction({
            index,
            id,
          });
          if (!this.filteredRecipes.length) this.goToHome();
          this.clearSelection();
        }
        this.deletionDialogActive = false;
      });
    },
    deleteRecipes(idsArr) {
      this.deletionDialogActive = true;
      let selectionCount = `${this.selection.length} ${localize("recs")}`;
      this.$showModal(ConfirmDialog, {
        props: {
          title: localize("conf"),
          description: `${localize("delRecsInfo", selectionCount)}`,
          cancelButtonText: "cBtn",
          okButtonText: "dBtn",
        },
      }).then((action) => {
        if (action) {
          this.deleteRecipesAction(idsArr);
          if (!this.filteredRecipes.length) this.goToHome();
          this.clearSelection();
        }
        this.deletionDialogActive = false;
      });
    },

    // SHAKE DETECTOR
    onSensorData({ x, y, z }) {
      x = x.toFixed(2);
      y = y.toFixed(2);
      z = z.toFixed(2);
      const FORCE_THRESHOLD = 1;
      const TIME_THRESHOLD = 150;
      const SHAKE_TIMEOUT = 600;
      const SHAKE_THROTTLE = 600;
      const SHAKE_COUNT = 3;
      const now = Date.now();
      if (now - lastForce > SHAKE_TIMEOUT) {
        shakeCount = 0;
      }
      let timeDelta = now - lastTime;
      if (timeDelta > TIME_THRESHOLD) {
        let forceVector = Math.abs(
          Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2)) - 1
        );
        if (forceVector > FORCE_THRESHOLD) {
          shakeCount++;
          if (shakeCount >= SHAKE_COUNT && now - lastShake > SHAKE_THROTTLE) {
            lastShake = now;
            shakeCount = 0;
            if (this.filteredRecipes.length) {
              utils.vibrate(100);
              this.viewRandomRecipe();
            }
          }
          lastForce = now;
        }
        lastTime = now;
      }
    },

    // HELPERS
    getRecipeCount(arg) {
      let count = 0;
      let a = this.selectedCuisine;
      let b = this.selectedCategory;
      let c = this.selectedTag;
      let cuisine = a && a != "allCuis";
      let category = b && b != "allCats";
      let tag = c && c != "allTs";
      let allCuisines = a && a == "allCuis";
      let allCategories = b && b == "allCats";
      let allTags = c && c == "allTs";
      switch (arg) {
        case "EnRecipes":
          count = this.recipes.length;
          break;
        case "trylater":
          count = this.recipes.filter((e) => !e.tried).length;
          break;
        case "favourites":
          count = this.recipes.filter((e) => e.isFavorite).length;
          break;
        default:
          count = this.recipes.filter((e) => {
            let cui = e.cuisine === a;
            let cat = e.category === b;
            let t = e.tags.includes(c);
            return allCuisines
              ? allCategories
                ? tag
                  ? t
                  : true
                : category
                ? allTags
                  ? cat
                  : tag
                  ? cat && t
                  : cat
                : true
              : cuisine
              ? allCategories
                ? allTags
                  ? cui
                  : tag
                  ? cui && t
                  : cui
                : category
                ? allTags
                  ? cui && cat
                  : tag
                  ? cui && cat && t
                  : cui && cat
                : cui
              : false;
          }).length;
          break;
      }
      return count;
    },
    centerLabel(args) {
      args.object.android.setGravity(17);
    },
    focusField(args) {
      setTimeout((e) => {
        args.object.focus();
        setTimeout((e) => Utils.ad.showSoftInput(args.object.android), 100);
      }, 100);
    },
    updateList(value) {
      clearTimeout(typingTimer);
      typingTimer = setTimeout((e) => {
        this.searchQuery = value.toLowerCase();
      }, 750);
    },
    formattedTotalTime(prepTime, cookTime) {
      let t1 = prepTime.split(":");
      let t2 = cookTime.split(":");
      let minutes = parseInt(t1[1]) + parseInt(t2[1]);
      let m = minutes % 60;
      let h = parseInt(t1[0]) + parseInt(t2[0]) + Math.floor(minutes / 60);
      let hr = localize("hr");
      let min = localize("min");
      let mins = h * 60 + m;
      return {
        time: h ? (m ? `${h} ${hr} ${m} ${min}` : `${h} ${hr}`) : `${m} ${min}`,
        duration: `${mins}`,
      };
    },
    randomRecipeID() {
      // TODO: show only from selected filter
      let min = 0;
      let max = this.filteredRecipes.length - 1;
      let randomIndex = Math.round(Math.random() * (max - min));
      return this.filteredRecipes[randomIndex].id;
    },
    recipeFilter(e) {
      let cuisineMatched = e.cuisine === this.selectedCuisine;
      let allCuisines = /allCuis/.test(this.selectedCuisine);
      let categoryMatched = e.category === this.selectedCategory;
      let allCategories = /allCats/.test(this.selectedCategory);
      let tagMatched = e.tags.includes(this.selectedTag);
      let allTags = /allTs/.test(this.selectedTag);
      let cuisine = cuisineMatched || allCuisines;

      return this.selectedTag && !allTags
        ? (categoryMatched || allCategories) && cuisine && tagMatched
        : this.selectedCategory && !allCategories
        ? cuisine && categoryMatched
        : cuisine;
    },
    sortFunction(a, b) {
      const titleOrder = a.title
        .toLowerCase()
        .localeCompare(b.title.toLowerCase(), Device.language, {
          ignorePunctuation: true,
        });
      let d1 = this.formattedTotalTime(a.prepTime, a.cookTime).duration;
      let d2 = this.formattedTotalTime(b.prepTime, b.cookTime).duration;
      let ld1 = new Date(a.lastModified);
      let ld2 = new Date(b.lastModified);
      let cd1 = new Date(a.created);
      let cd2 = new Date(b.created);
      let r1 = a.rating;
      let r2 = b.rating;

      function difficultyLevel(l) {
        switch (l) {
          case "Easy":
            return 1;
          case "Moderate":
            return 2;
          case "Challenging":
            return 3;
        }
      }
      let dl1 = difficultyLevel(a.difficulty);
      let dl2 = difficultyLevel(b.difficulty);
      switch (this.sortType) {
        case "title":
          return titleOrder > 0 ? 1 : titleOrder < 0 ? -1 : 0;
        case "Quickest first":
          return d1 > d2 ? 1 : d1 < d2 ? -1 : 0;
        case "Slowest first":
          return d1 > d2 ? -1 : d1 < d2 ? 1 : 0;
        case "Rating":
          return r1 > r2 ? -1 : r1 < r2 ? 1 : 0;
        case "Difficulty level":
          return dl1 > dl2 ? 1 : dl1 < dl2 ? -1 : 0;
        case "Last updated":
          return ld1 < ld2 ? 1 : ld1 > ld2 ? -1 : 0;
        case "Newest first":
          return cd1 < cd2 ? 1 : cd1 > cd2 ? -1 : 0;
        case "Oldest first":
          return cd1 < cd2 ? -1 : cd1 > cd2 ? 1 : 0;
      }
    },
    getItemPos(id) {
      let length = this.filteredRecipes.length;
      let l2 = this.layout == "grid" || this.layout == "photogrid";
      let oddOrEven = this.oddOrEven(id);
      let itemPos =
        id == this.filteredRecipes[0].id ||
        (length > 1 && l2 && id == this.filteredRecipes[1].id)
          ? "firstItem"
          : id == this.filteredRecipes[length - 1].id ||
            (length > 1 &&
              l2 &&
              oddOrEven == " odd" &&
              id == this.filteredRecipes[length - 2].id)
          ? "lastItem"
          : "";
      let selection = this.selection.includes(id) ? "selected" : "unselected";
      let classes = itemPos + " " + selection;
      return l2 ? classes + oddOrEven : classes;
    },
    oddOrEven(id) {
      return this.filteredRecipes.map((e) => e.id).indexOf(id) % 2 === 0
        ? " odd"
        : " even";
    },
    getTags(tags) {
      return tags.join(" · ");
    },

    // NAVIGATION HANDLERS
    barsVisibility(bool) {
      this.showTools = bool;
    },
    hijackBackEvent() {
      AndroidApplication.on(
        AndroidApplication.activityBackPressedEvent,
        this.backEvent
      );
    },
    releaseBackEvent() {
      AndroidApplication.off(
        AndroidApplication.activityBackPressedEvent,
        this.backEvent
      );
    },
    backEvent(args) {
      if (this.showSearch) {
        args.cancel = true;
        this.closeSearch();
      } else if (this.selectMode) {
        args.cancel = true;
        this.clearSelection();
      } else if (
        ["favourites", "trylater", "Filtered recipes"].includes(
          this.currentComponent
        )
      ) {
        args.cancel = true;
        this.goToHome();
      }
    },
    goToHome() {
      this.setComponent("EnRecipes");
      this.filterFavourites = this.filterTrylater = null;
      this.clearFilter();
    },
    navigateTo(to, title, page) {
      this.showTools = false;
      if (page) {
        this.$navigateTo(to, {
          transition: {
            name: "fade",
            duration: 250,
            curve: "easeOut",
          },
        });
      } else if (title !== this.currentComponent) {
        this.setComponent(title);
        this.filterFavourites = to == "favourites";
        this.filterTrylater = to == "trylater";
        this.clearFilter();
      }
    },
    addRecipe() {
      this.barsVisibility(false);
      this.$navigateTo(EditRecipe, {
        props: {
          filterFavourites: this.filterFavourites,
          filterTrylater: this.filterTrylater,
        },
        transition: {
          name: "fade",
          duration: 250,
          curve: "easeOut",
        },
      });
    },
    viewRecipe(recipeID) {
      this.barsVisibility(false);
      this.$navigateTo(ViewRecipe, {
        props: {
          filterTrylater: this.filterTrylater,
          recipeID,
        },
        transition: {
          name: "fade",
          duration: 250,
          curve: "easeOut",
        },
      });
    },
    viewRandomRecipe() {
      this.showTools = false;
      this.$navigateTo(ViewRecipe, {
        props: {
          filterTrylater: true,
          recipeID: this.randomRecipeID(),
        },
        transition: {
          name: "fade",
          duration: 250,
          curve: "easeOut",
        },
      });
    },
    touchSelector({ object, action }, comp, title) {
      let selected = this.currentComponent == comp;
      object.className = action.match(/down|move/)
        ? `segment ${selected ? "select" : "fade"}`
        : `segment ${selected && "select"}`;
      if (action == "up") this.navigateTo(comp, title);
    },
    touchTool({ object, action }, comp, value) {
      object.className = action.match(/down|move/) ? `tool fade` : `tool`;
      if (action == "up") this.navigateTo(comp, value, true);
    },
  },
  created() {
    this.setTheme(ApplicationSettings.getString("appTheme", "Light"));
    this.setLayout(ApplicationSettings.getString("layout", "detailed"));
    if (!this.recipes.length) this.initRecipes();
    this.initListItems();
    if (!this.mealPlans.length) this.initMealPlans();
    this.setShake(ApplicationSettings.getBoolean("shakeEnabled", true));
    this.setFirstDay(ApplicationSettings.getBoolean("mondayFirst", false));
  },
};
</script>
