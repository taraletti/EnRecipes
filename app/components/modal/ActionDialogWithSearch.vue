<template>
  <Page @loaded="onPageLoad" backgroundColor="transparent">
    <GridLayout
      columns="*"
      rows="auto, auto, auto, *, auto"
      class="dialogContainer"
      :class="appTheme"
    >
      <StackLayout row="0" class="dialogHeader" orientation="horizontal">
        <Label class="er dialogIcon" :text="icon[helpIcon]" />
        <Label
          class="dialogTitle orkm"
          :text="`${title}` | L"
          textWrap="true"
        />
      </StackLayout>
      <StackLayout
        row="2"
        v-if="filteredRecipes.length || searchQuery"
        padding="0 24 8"
      >
        <TextField :hint="'Search' | L" v-model="searchQuery" />
      </StackLayout>
      <ScrollView row="3" width="100%" :height="height ? height : ''">
        <StackLayout>
          <MDButton
            v-for="(recipe, index) in filteredRecipes"
            :key="index"
            class="actionItem"
            variant="text"
            :text="recipe.title"
            @loaded="centerLabel"
            @tap="tapAction(recipe)"
          />
          <Label
            padding="24"
            lineHeight="6"
            v-if="!filteredRecipes.length && !searchQuery"
            :text="'recListEmp' | L"
            textAlignment="center"
            textWrap="true"
          />
          <Label
            padding="24"
            lineHeight="6"
            v-if="!filteredRecipes.length && searchQuery"
            :text="'noRecs' | L"
            textAlignment="center"
            textWrap="true"
          />
        </StackLayout>
      </ScrollView>
      <GridLayout
        row="4"
        rows="auto"
        columns="auto, *, auto"
        class="actionsContainer"
      >
        <MDButton
          variant="text"
          v-if="action"
          col="0"
          class="action orkm pull-left"
          :text="`${action}` | L"
          @tap="$modal.close(action)"
        />
        <MDButton
          variant="text"
          col="2"
          class="action orkm pull-right"
          :text="'CANCEL' | L"
          @tap="$modal.close(false)"
        />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { Application } from "@nativescript/core";
import { mapState } from "vuex";
export default {
  props: ["title", "recipes", "height", "action", "helpIcon"],
  data() {
    return {
      searchQuery: "",
    };
  },
  computed: {
    ...mapState(["icon"]),
    appTheme() {
      return Application.systemAppearance();
    },
    filteredRecipes() {
      return this.recipes
        .map((e, i) => {
          return {
            id: e.id,
            title: e.title,
            cuisine: e.cuisine,
            category: e.category,
            tags: e.tags.map((e) => e.toLowerCase()).join(),
            ingredients: e.ingredients.map((e) => e.item.toLowerCase()).join(),
          };
        })
        .filter((e) => this.recipeFilter(e));
    },
  },
  methods: {
    onPageLoad(args) {
      args.object._dialogFragment
        .getDialog()
        .getWindow()
        .setBackgroundDrawable(
          new android.graphics.drawable.ColorDrawable(
            android.graphics.Color.TRANSPARENT
          )
        );
    },
    tapAction(recipe) {
      this.$modal.close(recipe.id);
    },
    centerLabel(args) {
      args.object.android.setGravity(16);
    },
    recipeFilter(e) {
      let searchQuery = this.searchQuery.toLowerCase();
      return (
        e.title.includes(searchQuery) ||
        e.cuisine.includes(searchQuery) ||
        e.category.includes(searchQuery) ||
        e.tags.includes(searchQuery) ||
        e.ingredients.includes(searchQuery)
      );
    },
  },
};
</script>
