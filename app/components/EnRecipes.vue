<template>
  <Page @loaded="onPageLoad" @unloaded="onPageUnload">
    <ActionBar flat="true">
      <GridLayout
        v-if="showSearch"
        columns="auto, *"
        verticalAlignment="center"
      >
        <MDButton
          class="er"
          :text="icon.back"
          variant="text"
          automationText="Back"
          col="0"
          @tap="closeSearch"
        />
        <SearchBar
          col="1"
          :hint="'ser' | L"
          @textChange="updateList($event.value)"
          @clear="clearSearch"
        />
      </GridLayout>
      <GridLayout v-else columns="auto, *, auto, auto">
        <MDButton
          class="er"
          col="0"
          variant="text"
          @tap="selectMode ? clearSelection() : showDrawer()"
          :text="selectMode ? icon.x : icon.menu"
        />
        <Label
          v-if="selectMode"
          class="title orkm"
          :text="`${selection.length} ${$options.filters.L('sltd')}`"
          col="1"
        />
        <Label
          v-else
          class="title orkm"
          :text="`${currentComponent}` | L"
          col="1"
        />
        <MDButton
          v-if="recipes.length && !selectMode"
          class="er"
          :text="selectMode ? icon.export : icon.sear"
          variant="text"
          col="2"
          @tap="selectMode ? exportSelection() : openSearch()"
        />
        <MDButton
          v-if="recipes.length"
          class="er"
          :text="selectMode ? icon.del : icon.sort"
          variant="text"
          col="3"
          @tap="selectMode ? deleteSelection() : sortDialog()"
        />
      </GridLayout>
    </ActionBar>
    <AbsoluteLayout>
      <CollectionView
        width="100%"
        height="100%"
        for="recipe in filteredRecipes"
        ref="listview"
        :itemTemplateSelector="getLayout"
        :colWidth="layout == 'grid' ? '50%' : '100%'"
      >
        <v-template name="detailed">
          <GridLayout class="recipeContainer" :class="getItemPos(recipe.id)">
            <!-- elevation="1" -->
            <GridLayout
              class="recipeItem layout1 mdr"
              rows="104"
              columns="104, *"
              ref="recipe"
              @longPress="
                selectMode
                  ? viewRecipe(recipe.id)
                  : addToSelection($event, recipe.id)
              "
              @tap="
                selectMode
                  ? addToSelection($event, recipe.id)
                  : viewRecipe(recipe.id)
              "
            >
              <GridLayout class="imageHolder card" rows="104" columns="104">
                <Image
                  row="0"
                  col="0"
                  v-if="recipe.imageSrc"
                  :src="recipe.imageSrc"
                  stretch="aspectFill"
                  decodeWidth="104"
                  decodeHeight="104"
                  loadMode="async"
                />
                <Label
                  v-else
                  row="0"
                  col="0"
                  horizontalAlignment="center"
                  class="er"
                  fontSize="56"
                  :text="icon.img"
                />
              </GridLayout>
              <StackLayout class="recipeInfo" col="1">
                <Label
                  :text="`${$options.filters.L(
                    recipe.cuisine
                  )} • ${$options.filters.L(recipe.category)}`"
                  class="category"
                />
                <Label :text="recipe.title" class="orkm title" />
                <GridLayout columns="*" rows="auto, auto">
                  <StackLayout
                    class="attrContainer"
                    orientation="horizontal"
                    row="0"
                  >
                    <Label class="er small" :text="icon.star" />
                    <Label class="attr" :text="recipe.rating" />
                    <Label class="er small" :text="icon.diff" />
                    <Label class="attr" :text="`${recipe.difficulty}` | L" />
                    <Label class="er small" :text="icon.time" />
                    <Label
                      class="attr"
                      :text="`${
                        formattedTotalTime(recipe.prepTime, recipe.cookTime)
                          .time
                      }`"
                    />
                  </StackLayout>
                  <StackLayout
                    class="tagsContainer"
                    orientation="horizontal"
                    row="1"
                  >
                    <Label
                      v-for="(tag, index) in recipe.tags"
                      :key="index"
                      class="tag"
                      :text="tag"
                    />
                  </StackLayout>
                </GridLayout>
              </StackLayout>
            </GridLayout>
          </GridLayout>
        </v-template>
        <v-template name="simple">
          <GridLayout class="recipeContainer" :class="getItemPos(recipe.id)">
            <!-- elevation="1" -->
            <GridLayout
              class="recipeItem layout1 layout2 mdr"
              rows="auto"
              columns="*"
              ref="recipe"
              @longPress="
                selectMode
                  ? viewRecipe(recipe.id)
                  : addToSelection($event, recipe.id)
              "
              @tap="
                selectMode
                  ? addToSelection($event, recipe.id)
                  : viewRecipe(recipe.id)
              "
            >
              <StackLayout class="recipeInfo">
                <Label
                  :text="`${$options.filters.L(
                    recipe.cuisine
                  )} • ${$options.filters.L(recipe.category)}`"
                  class="category"
                />
                <Label :text="recipe.title" class="orkm title" />
                <StackLayout
                  class="tagsContainer"
                  v-if="recipe.tags.length"
                  orientation="horizontal"
                >
                  <Label
                    v-for="(tag, index) in recipe.tags"
                    :key="index"
                    v-if="tag"
                    class="tag"
                    :text="tag"
                  />
                </StackLayout>
              </StackLayout>
            </GridLayout>
          </GridLayout>
        </v-template>
        <v-template name="grid">
          <GridLayout class="recipeContainer" :class="getItemPos(recipe.id)">
            <!-- elevation="1" -->
            <GridLayout
              class="recipeItem layout3 mdr"
              rows="auto, auto"
              columns="*"
              ref="recipe"
              @longPress="
                selectMode
                  ? viewRecipe(recipe.id)
                  : addToSelection($event, recipe.id)
              "
              @tap="
                selectMode
                  ? addToSelection($event, recipe.id)
                  : viewRecipe(recipe.id)
              "
            >
              <GridLayout class="imageHolder card" :rows="imgWidth" columns="*">
                <Image
                  row="0"
                  col="0"
                  v-if="recipe.imageSrc"
                  :src="recipe.imageSrc"
                  stretch="aspectFill"
                  :decodeWidth="imgWidth"
                  :decodeHeight="imgWidth"
                  loadMode="async"
                />
                <Label
                  v-else
                  row="0"
                  col="0"
                  horizontalAlignment="center"
                  class="er"
                  :fontSize="imgWidth / 2"
                  :text="icon.img"
                />
              </GridLayout>
              <StackLayout class="recipeInfo" row="1">
                <Label
                  :text="`${$options.filters.L(
                    recipe.cuisine
                  )} • ${$options.filters.L(recipe.category)}`"
                  class="category"
                />
                <Label :text="recipe.title" class="orkm title" />
                <StackLayout
                  class="tagsContainer"
                  orientation="horizontal"
                  row="2"
                >
                  <Label
                    v-for="(tag, index) in recipe.tags"
                    :key="index"
                    v-if="tag"
                    class="tag"
                    :text="tag"
                  />
                </StackLayout>
              </StackLayout>
            </GridLayout>
          </GridLayout>
        </v-template>
      </CollectionView>
      <GridLayout rows="*, auto, *, 88" columns="*" class="emptyStateContainer">
        <StackLayout
          row="1"
          class="emptyState"
          v-if="!recipes.length && !filterFavourites && !filterTrylater"
          @tap="addRecipe"
        >
          <Label class="er icon" :text="icon.plusc" />
          <Label class="title orkm" :text="'strAdd' | L" textWrap="true" />
          <StackLayout orientation="horizontal" horizontalAlignment="center">
            <Label :text="'plsAdd' | L" textWrap="true" />
          </StackLayout>
        </StackLayout>
        <StackLayout
          row="1"
          class="emptyState"
          v-if="!filteredRecipes.length && filterTrylater && !searchQuery"
        >
          <Label class="er icon" :text="icon.try" textWrap="true" />
          <Label class="title orkm" :text="'aD' | L" textWrap="true" />
          <Label :text="'tLInfo' | L" textWrap="true" />
        </StackLayout>
        <StackLayout
          row="1"
          class="emptyState"
          v-if="!filteredRecipes.length && filterFavourites && !searchQuery"
        >
          <Label class="er icon" :text="icon.fav" textWrap="true" />
          <Label class="title orkm" :text="'noFavs' | L" textWrap="true" />
          <Label :text="'fsList' | L" textWrap="true" />
        </StackLayout>
        <StackLayout
          row="1"
          class="emptyState"
          v-if="!filteredRecipes.length && searchQuery"
        >
          <Label class="er icon" :text="icon.noresult" textWrap="true" />
          <Label
            class="title orkm"
            :text="`${noResultFor}` | L"
            textWrap="true"
          />
          <MDButton
            v-if="filterFavourites || filterTrylater || selectedCuisine"
            variant="text"
            class="searchAll orkm"
            :text="'trySer' | L"
            @tap="searchAll"
          />
        </StackLayout>
      </GridLayout>
      <GridLayout id="btnFabContainer" rows="*, auto" columns="*, auto">
        <transition name="bounce">
          <MDFloatingActionButton
            v-if="showFAB"
            row="1"
            col="1"
            class="er fab-button"
            src="res://plus"
            @tap="addRecipe"
          />
        </transition>
      </GridLayout>
    </AbsoluteLayout>
  </Page>
</template>
<script>
import {
  ApplicationSettings,
  AndroidApplication,
  Utils,
  Observable,
  Device,
  Screen,
} from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { time } from "tns-core-modules/profiling";
import {
  startAccelerometerUpdates,
  stopAccelerometerUpdates,
} from "nativescript-accelerometer";
import { Vibrate } from "nativescript-vibrate";
let vibrator = new Vibrate();
import { mapActions, mapState } from "vuex";
import EditRecipe from "./EditRecipe.vue";
import ViewRecipe from "./ViewRecipe.vue";
import ActionDialog from "./modal/ActionDialog.vue";
import ConfirmDialog from "./modal/ConfirmDialog.vue";
import * as utils from "~/shared/utils.js";
let lastTime = 0;
let lastShake = 0;
let lastForce = 0;
let shakeCount = 0;
let typingTimer;
export default {
  props: [
    "filterFavourites",
    "filterTrylater",
    "closeDrawer",
    "showDrawer",
    "selectedCategory",
    "selectedCuisine",
    "selectedTag",
    "hijackGlobalBackEvent",
    "releaseGlobalBackEvent",
  ],
  components: {
    EditRecipe,
    ViewRecipe,
  },
  data() {
    return {
      searchQuery: "",
      showSearch: false,
      rightAction: false,
      deletionDialogActive: false,
      showFAB: false,
      filterDone: true,
      selection: [],
      selectMode: false,
      recipeList: [],
      // listView: null,
    };
  },
  computed: {
    ...mapState([
      "sortType",
      "icon",
      "recipes",
      "currentComponent",
      "shakeEnabled",
      "layout",
    ]),
    filteredRecipes() {
      let ingredients = this.recipes
        .map((e) => e.ingredients.map((f) => f.item.toLowerCase()).join())
        .join();

      let vm = this;

      function getIngredients(e) {
        return e.ingredients
          .map((f) => f.item.toLowerCase())
          .join()
          .includes(vm.searchQuery);
      }
      // if ( this.filterDone ) {
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
      // } else {
      //   return 0;
      // }
    },
    noResultFor() {
      if (this.filterFavourites) return "noRecsInFavs";
      if (this.filterTrylater) return "noRecsInTL";
      if (this.selectedCuisine) return "noRecsInFtr";
      return "noRecs";
    },
    screenWidth() {
      return Screen.mainScreen.widthDIPs;
    },
    imgWidth() {
      return Screen.mainScreen.widthDIPs / 2 - 20;
    },
  },
  methods: {
    ...mapActions([
      "setCurrentComponentAction",
      "setSortTypeAction",
      "deleteRecipeAction",
      "deleteRecipesAction",
      "setShakeAction",
    ]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
      this.filterFavourites
        ? this.setComponent("Favourites")
        : this.filterTrylater
        ? this.setComponent("Try Later")
        : this.selectedCuisine
        ? this.setComponent("Filtered recipes")
        : this.setComponent("EnRecipes");
      if (!this.selectMode) this.showFAB = true;
      if (this.shakeEnabled) {
        if (utils.hasAccelerometer())
          startAccelerometerUpdates((data) => this.onSensorData(data));
        else this.setShakeAction(false);
      }
      if (this.showSearch || this.selectMode) this.hijackLocalBackEvent();
      this.showDrawer();
      this.closeDrawer();
    },
    onPageUnload() {
      if (this.shakeEnabled) stopAccelerometerUpdates();
      this.releaseGlobalBackEvent();
      this.releaseLocalBackEvent();
    },
    listViewLoad(args) {
      let e = args.object.android;
      e.setSelector(new android.graphics.drawable.StateListDrawable());
      e.setDivider(null);
      e.setDividerHeight(1);
    },
    getLayout() {
      return this.layout;
    },

    // HELPERS
    openSearch() {
      this.showSearch = true;
      this.showFAB = false;
      this.hijackLocalBackEvent();
    },
    closeSearch() {
      this.searchQuery = "";
      Utils.ad.dismissSoftInput();
      this.showSearch = false;
      this.showFAB = true;
      this.releaseLocalBackEvent();
    },
    setComponent(comp) {
      this.setCurrentComponentAction(comp);
      this.hijackGlobalBackEvent();
    },
    clearSearch() {
      this.searchQuery = "";
    },
    updateList(value) {
      clearTimeout(typingTimer);
      typingTimer = setTimeout((e) => {
        this.searchQuery = value;
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
    searchAll() {
      this.$emit("backToHome");
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
        case "Title":
          return titleOrder > 0 ? 1 : titleOrder < 0 ? -1 : 0;
          break;
        case "Quickest first":
          return d1 > d2 ? 1 : d1 < d2 ? -1 : 0;
          break;
        case "Slowest first":
          return d1 > d2 ? -1 : d1 < d2 ? 1 : 0;
          break;
        case "Rating":
          return r1 > r2 ? -1 : r1 < r2 ? 1 : 0;
          break;
        case "Difficulty level":
          return dl1 > dl2 ? 1 : dl1 < dl2 ? -1 : 0;
          break;
        case "Last updated":
          return ld1 < ld2 ? 1 : ld1 > ld2 ? -1 : 0;
          break;
        case "Newest first":
          return cd1 < cd2 ? 1 : cd1 > cd2 ? -1 : 0;
          break;
        case "Oldest first":
          return cd1 < cd2 ? -1 : cd1 > cd2 ? 1 : 0;
          break;
      }
    },
    getItemPos(id) {
      let length = this.filteredRecipes.length;
      let l2 = this.layout == "grid";
      let itemPos =
        id == this.filteredRecipes[0].id ||
        (length > 1 && l2 && id == this.filteredRecipes[1].id)
          ? "firstItem"
          : id == this.filteredRecipes[length - 1].id ||
            (length > 1 &&
              l2 &&
              this.oddOrEven(id) == " odd" &&
              id == this.filteredRecipes[length - 2].id)
          ? "lastItem"
          : "";
      return l2 ? itemPos + this.oddOrEven(id) : itemPos;
    },
    oddOrEven(id) {
      return this.filteredRecipes.map((e) => e.id).indexOf(id) % 2 === 0
        ? " odd"
        : " even";
    },

    // NAVIGATION HANDLERS
    hijackLocalBackEvent() {
      this.releaseGlobalBackEvent();
      AndroidApplication.on(
        AndroidApplication.activityBackPressedEvent,
        this.localBackEvent
      );
    },
    releaseLocalBackEvent() {
      AndroidApplication.off(
        AndroidApplication.activityBackPressedEvent,
        this.localBackEvent
      );
      this.hijackGlobalBackEvent();
    },
    localBackEvent(args) {
      args.cancel = true;
      if (this.selectMode) this.clearSelection();
      this.closeDrawer();
      this.closeSearch();
    },
    addRecipe() {
      this.showFAB = false;
      this.releaseGlobalBackEvent();
      this.$navigateTo(EditRecipe, {
        props: {
          selectedCuisine: this.selectedCuisine,
          selectedCategory: this.selectedCategory,
          selectedTag: this.selectedTag,
          filterFavourites: this.filterFavourites,
          filterTrylater: this.filterTrylater,
        },
      });
    },
    viewRecipe(recipeID) {
      this.showFAB = false;
      this.$navigateTo(ViewRecipe, {
        props: {
          filterTrylater: this.filterTrylater,
          recipeID,
        },
        backstackVisible: false,
      });
    },
    viewRandomRecipe() {
      this.showFAB = false;
      this.$navigateTo(ViewRecipe, {
        props: {
          filterTrylater: true,
          recipeID: this.randomRecipeID(),
        },
        backstackVisible: false,
      });
    },

    // LIST HANDLERS
    sortDialog() {
      this.releaseGlobalBackEvent();
      this.$showModal(ActionDialog, {
        props: {
          title: "srt",
          list: [
            "Title",
            "Quickest first",
            "Slowest first",
            "Rating",
            "Difficulty level",
            "Last updated",
            "Newest first",
            "Oldest first",
          ],
          stretch: false,
          helpIcon: "sort",
          bgColor: "#858585",
          count: 8,
        },
      }).then((action) => {
        if (action && action !== "Cancel" && this.sortType !== action) {
          this.setSortTypeAction(action);
          ApplicationSettings.setString("sortType", action);
          this.updateSort();
        }
        this.hijackGlobalBackEvent();
      });
    },

    // DATA HANDLERS
    addToSelection(args, id) {
      // console.log(args, id);
      this.showFAB = false;
      if (!this.selectMode) this.hijackLocalBackEvent();
      this.selectMode = true;
      this.$emit("selectModeOn", false);
      let item = args.object;
      console.log(item.className);
      let classes = item.className;
      if (classes.includes("selected")) {
        item.className = classes.replace(/selected/g, "");
        this.selection.splice(this.selection.indexOf(id), 1);
        this.recipeList.splice(this.selection.indexOf(id), 1);
      } else {
        item.className = classes + " selected";
        this.selection.push(id);
        this.recipeList.push(item);
      }
      if (!this.selection.length) this.clearSelection();
    },
    clearSelection() {
      this.selectMode = false;
      this.$emit("selectModeOn", true);
      this.selection = [];
      this.recipeList.forEach((e) => {
        e.className = e.className.replace(/selected/g, "");
      });
      this.releaseLocalBackEvent();
      this.showFAB = true;
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
      this.$showModal(ConfirmDialog, {
        props: {
          title: localize("conf"),
          description: `${localize("delRecInfo")} "${
            this.recipes[index].title
          }"`,
          cancelButtonText: "cBtn",
          okButtonText: "dBtn",
          helpIcon: "del",
          iconColor: "#c92a2a",
        },
      }).then((action) => {
        if (action) {
          this.deleteRecipeAction({
            index,
            id,
          });
          if (!this.filteredRecipes.length) this.$emit("backToHome");
          this.clearSelection();
        }
        this.deletionDialogActive = false;
      });
    },
    deleteRecipes(idsArr) {
      this.deletionDialogActive = true;
      this.$showModal(ConfirmDialog, {
        props: {
          title: localize("conf"),
          description: `${localize("delRecsInfo")} ${
            this.selection.length
          } ${localize("recs")}`,
          cancelButtonText: "cBtn",
          okButtonText: "dBtn",
          helpIcon: "del",
          iconColor: "#c92a2a",
        },
      }).then((action) => {
        if (action) {
          this.deleteRecipesAction(idsArr);
          if (!this.filteredRecipes.length) this.$emit("backToHome");
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
      const now = time();
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
              vibrator.vibrate(100);
              this.viewRandomRecipe();
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
  },
};
</script>
