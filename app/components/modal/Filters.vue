<template>
  <Page @loaded="onPageLoad" backgroundColor="transparent" :class="appTheme">
    <GridLayout rows="auto, auto, *, auto" columns="*" class="modal">
      <Label class="title" :text="`fltr` | L" />
      <ScrollView orientation="horizontal" row="1" @loaded="onScrollLoad">
        <StackLayout class="filters" orientation="horizontal">
          <GridLayout
            rows="48"
            columns="auto, auto"
            class="segment"
            v-for="(item, index) in pathList"
            :key="index"
            :class="{
              select: filterType === item.type,
            }"
            @touch="touchSelector($event, item.type)"
          >
            <Label class="ico" :text="icon[item.type]" />
            <Label v-if="item.title" class="value" :text="item.title" col="1" />
          </GridLayout>
        </StackLayout>
      </ScrollView>
      <ListView row="2" class="options-list" for="item in filterList">
        <v-template>
          <Label
            class="listItem"
            verticalAlignment="center"
            col="1"
            :text="item | L"
            @touch="touch($event, item)"
          />
        </v-template>
      </ListView>
      <GridLayout row="3" columns="auto, *, auto, auto" class="actions">
        <Button class="text sm" :text="'rest' | L" @tap="resetFilter" />
        <Button
          col="2"
          class="text sm"
          :text="'cBtn' | L"
          @tap="$modal.close()"
        />
        <Button
          col="3"
          class="text sm"
          :text="'apply' | L"
          @tap="applyFilter"
        />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { localize } from "@nativescript/localize";
import { mapActions, mapState } from "vuex";
let filterTimer;
export default {
  data() {
    return {
      filterType: "cuisine",
      localCuisine: null,
      localCategory: null,
      localTag: null,
      reset: false,
    };
  },
  computed: {
    ...mapState([
      "icon",
      "recipes",
      "cuisines",
      "categories",
      "selectedCuisine",
      "selectedCategory",
      "selectedTag",
      "appTheme",
    ]),
    pathList() {
      let arr = [
        {
          type: "cuisine",
          title: localize(this.localCuisine),
        },
        {
          type: "category",
          title: localize(this.localCategory),
        },
        {
          type: "tag",
          title: localize(this.localTag),
        },
      ];
      switch (this.filterType) {
        case "cuisine":
          return arr.slice(0, -2);
        case "category":
          return arr.slice(0, -1);
      }
      return arr;
    },
    filterList() {
      switch (this.filterType) {
        case "cuisine":
          return this.cuisineList;
        case "category":
          return this.categoryList;
        case "tag":
          return this.tagList;
      }
    },
    cuisineList() {
      let arr = this.recipes.map((e) => e.cuisine).sort();
      return arr.length ? ["allCuis", ...new Set(arr)] : [];
    },
    categoryList() {
      let arr = this.recipes
        .map(
          (e) =>
            (this.localCuisine === "allCuis" ||
              e.cuisine === this.localCuisine) &&
            e.category
        )
        .filter((e) => e)
        .sort();
      return arr.length ? ["allCats", ...new Set(arr)] : [];
    },
    tagList() {
      let arr = this.recipes
        .map((e) => {
          if (
            this.localCuisine === "allCuis" &&
            this.localCategory === "allCats" &&
            e.tags.length
          )
            return e.tags;
          else if (
            this.localCuisine === "allCuis" &&
            e.category === this.localCategory &&
            e.tags.length
          )
            return e.tags;
          else if (
            this.localCategory === "allCats" &&
            e.cuisine === this.localCuisine &&
            e.tags.length
          )
            return e.tags;
          else if (
            e.category === this.localCategory &&
            e.cuisine === this.localCuisine &&
            e.tags.length
          )
            return e.tags;
        })
        .flat()
        .filter((e) => e)
        .sort();
      let showAllTags =
        this.localCuisine === "allCuis" && this.localCategory === "allCats";
      return arr.length
        ? [!showAllTags && "allTs", ...new Set(arr)].filter((e) => e)
        : [];
    },
  },
  methods: {
    ...mapActions([
      "setComponent",
      "setCuisine",
      "setCategory",
      "setTag",
      "clearFilter",
    ]),
    onPageLoad(args) {
      this.transparentPage(args);
      this.localCuisine = this.selectedCuisine;
      this.localCategory = this.selectedCategory;
      this.localTag = this.selectedTag;
      if (this.localCuisine) this.filterType = "category";
      if (this.localCategory && this.localTag) this.filterType = "tag";
      this.scrollToRight();
    },
    onScrollLoad(args) {
      this.scrollview = args.object;
    },
    setFilterType(type) {
      this.filterType = type;
      switch (type) {
        case "cuisine":
          this.localCategory = null;
          this.localTag = null;
          break;
        case "category":
          this.localTag = null;
          break;
      }
    },
    scrollToRight() {
      setTimeout(
        () =>
          this.scrollview.scrollToHorizontalOffset(
            this.scrollview.scrollableWidth,
            true
          ),
        10
      );
    },
    setRecipeFilter(item) {
      this.reset = false;
      switch (this.filterType) {
        case "cuisine":
          this.localCuisine = item;
          this.filterType = "category";
          break;
        case "category":
          this.localCategory = item;
          if (this.tagList.length) this.filterType = "tag";
          break;
        default:
          this.localTag = item;
          break;
      }
      this.scrollToRight();
    },
    applyFilter() {
      this.setCuisine(this.localCuisine);
      this.setCategory(this.localCategory);
      this.setTag(this.localTag);
      this.filterFavourites = this.filterTrylater = false;
      if (this.reset) this.setComponent("EnRecipes");
      else this.setComponent("Filtered recipes");
      this.$modal.close();
    },
    resetFilter() {
      this.filterType = "cuisine";
      this.localCuisine = this.localCategory = this.localTag = null;
      this.reset = true;
    },
    touch({ object, action }, item) {
      object.className = action.match(/down|move/)
        ? "listItem fade"
        : "listItem";
      if (action == "up") this.setRecipeFilter(item);
    },
    touchSelector({ object, action }, type) {
      let selected = this.filterType == type;
      object.className = action.match(/down|move/)
        ? `segment ${selected ? "select" : "fade"}`
        : `segment ${selected && "select"}`;
      if (action == "up") this.setFilterType(type);
    },
  },
};
</script>