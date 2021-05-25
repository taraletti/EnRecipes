<template>
  <Page
    @loaded="transparentPage"
    backgroundColor="transparent"
    :class="appTheme"
  >
    <GridLayout columns="*" rows="auto, auto, *, auto" class="modal">
      <Label class="title" :text="title | L" />
      <StackLayout
        row="1"
        v-if="filteredRecipes.length || searchQuery"
        class="input"
      >
        <TextField class="modalInput" :hint="'ser' | L" v-model="searchQuery" />
      </StackLayout>
      <ListView row="2" for="recipe in filteredRecipes">
        <v-template>
          <Label
            class="listItem"
            :text="recipe.title"
            @touch="touch($event, recipe)"
          />
        </v-template>
      </ListView>
      <Label
        row="2"
        class="noResInfo"
        v-if="!filteredRecipes.length && !searchQuery"
        :text="'recListEmp' | L"
      />
      <Label
        row="2"
        class="noResInfo"
        v-if="!filteredRecipes.length && searchQuery"
        :text="'noRecs' | L"
      />
      <GridLayout row="3" columns="auto, *, auto" class="actions">
        <Button
          v-if="action"
          class="text sm"
          :text="action | L"
          @tap="$modal.close(action)"
        />
        <Button
          col="2"
          class="text sm"
          :text="'cBtn' | L"
          @tap="$modal.close(false)"
        />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: ["title", "recipes", "height", "action"],
  data() {
    return {
      searchQuery: "",
    };
  },
  computed: {
    ...mapState(["icon", "appTheme"]),
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
    touch({ object, action }, recipe) {
      object.className = action.match(/down|move/)
        ? "listItem fade"
        : "listItem";
      if (action == "up") this.tapAction(recipe);
    },
  },
};
</script>
