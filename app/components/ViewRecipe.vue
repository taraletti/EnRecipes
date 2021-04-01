<template>
  <Page @loaded="onPageLoad" @unloaded="onPageUnload" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="*">
      <DockLayout stretchLastChild="true" rowSpan="2">
        <GridLayout
          dock="top"
          rows="auto,auto"
          columns="*, auto"
          paddingBottom="8"
          :class="{ topPlate: scrolled }"
        >
          <StackLayout>
            <Label class="pageTitle" paddingBottom="8" :text="recipe.title" />
            <StackLayout marginLeft="12" orientation="horizontal">
              <Button
                class="ico rate"
                :class="{ rated: recipe.rating >= n }"
                v-for="n in 5"
                :key="n"
                :text="recipe.rating < n ? icon.star : icon.starred"
                @tap="
                  recipe.rating == 1 && n == 1 ? setRating(0) : setRating(n)
                "
                @longPress="setRating(n)"
              />
            </StackLayout>
          </StackLayout>
          <Image
            col="1"
            v-if="recipe.imageSrc"
            :src="recipe.imageSrc"
            stretch="aspectFit"
            class="photo"
            decodeWidth="96"
            decodeHeight="96"
          />
          <StackLayout row="1" colSpan="2" orientation="horizontal" margin="16">
            <GridLayout
              rows="48"
              columns="auto, auto"
              class="segment"
              v-for="(item, index) in topmenu"
              :key="index"
              :class="{ select: selectedIndex == index }"
              @touch="touchSelector($event, index, item.icon)"
            >
              <Label class="ico" :text="icon[item.icon]" />
              <Label class="value" :text="item.count" col="1" />
            </GridLayout>
          </StackLayout>
        </GridLayout>
        <ScrollView
          dock="bottom"
          @loaded="onScrollLoad"
          @scroll="!toast && onScroll($event)"
        >
          <StackLayout>
            <StackLayout>
              <GridLayout rows="auto" columns="*, *">
                <StackLayout class="attribute">
                  <Label class="title" :text="'cui' | L" />
                  <Label class="value" :text="recipe.cuisine | L" />
                </StackLayout>
                <StackLayout class="attribute" col="1">
                  <Label class="title" :text="'cat' | L" />
                  <Label class="value" :text="recipe.category | L" />
                </StackLayout>
              </GridLayout>
              <StackLayout v-if="recipe.tags.length" class="attribute">
                <Label class="title" :text="'ts' | L" />
                <Label class="value" :text="getTags(recipe.tags)" />
              </StackLayout>
              <GridLayout rows="auto" columns="*, *">
                <StackLayout class="attribute" v-if="hasTime(recipe.prepTime)">
                  <Label class="title" :text="'prepT' | L" />
                  <Label class="value" :text="formattedTime(recipe.prepTime)" />
                </StackLayout>
                <StackLayout
                  :col="hasTime(recipe.prepTime) ? 1 : 0"
                  class="attribute"
                  v-if="hasTime(recipe.cookTime)"
                >
                  <Label class="title" :text="'cookT' | L" />
                  <Label class="value" :text="formattedTime(recipe.cookTime)" />
                </StackLayout>
              </GridLayout>
              <GridLayout rows="auto" columns="*, *">
                <StackLayout class="attribute">
                  <Label class="title" :text="'yld' | L" />
                  <Label
                    @touch="touchYield"
                    class="value clickable"
                    :text="`${positiveYieldMultiplier} ${$options.filters.L(
                      recipe.yield.unit
                    )}`"
                  />
                </StackLayout>
                <StackLayout class="attribute" col="1">
                  <Label class="title" :text="'Difficulty level' | L" />
                  <Label class="value" :text="recipe.difficulty | L" />
                </StackLayout>
              </GridLayout>
            </StackLayout>
            <StackLayout>
              <Label
                id="items"
                padding="0 16"
                class="sectionTitle"
                v-show="recipe.ingredients.length"
                :text="'ings' | L"
              />
              <StackLayout @loaded="onIngsLoad">
                <GridLayout
                  rows="auto"
                  columns="auto, *"
                  v-for="(item, index) in recipe.ingredients"
                  :key="index + 'ing'"
                  class="ingredient"
                  @touch="touchIngredient($event, index)"
                >
                  <Button class="ico min" :text="icon.done" />
                  <Label
                    class="value tw"
                    col="1"
                    :text="`${
                      roundedQuantity(item.quantity)
                        ? roundedQuantity(item.quantity) + ' '
                        : ''
                    }${
                      roundedQuantity(item.quantity)
                        ? $options.filters.L(item.unit) + ' '
                        : ''
                    }${item.item}`"
                  />
                </GridLayout>
              </StackLayout>
              <Label
                id="steps"
                padding="0 16"
                v-show="recipe.instructions.length"
                class="sectionTitle"
                :text="'ins' | L"
              />
              <StackLayout @loaded="onInsLoad">
                <GridLayout
                  @touch="touchInstruction"
                  columns="auto ,*"
                  v-for="(instruction, index) in recipe.instructions"
                  :key="index + 'ins'"
                  class="instruction"
                >
                  <Button class="count ico min" :text="index + 1" />
                  <Label col="1" class="value tw" :text="instruction" />
                </GridLayout>
              </StackLayout>
              <Label
                id="comb"
                padding="0 16"
                v-show="recipe.combinations.length"
                class="sectionTitle"
                :text="'cmbs' | L"
              />
              <Button
                v-for="(combination, index) in recipe.combinations"
                :key="index + 'comb'"
                class="combination"
                :text="getCombinationTitle(combination)"
                @tap="viewCombination(combination)"
              />
              <Label
                id="notes"
                padding="0 16"
                v-show="recipe.notes.length"
                class="sectionTitle"
                :text="'nos' | L"
              />
              <StackLayout @loaded="onNosLoad" padding="0 16 72"> </StackLayout>
            </StackLayout>
          </StackLayout>
        </ScrollView>
      </DockLayout>

      <GridLayout
        row="1"
        @loaded="onAppBarLoad"
        class="appbar"
        v-show="!toast"
        columns="auto, *, auto, auto, auto, auto"
      >
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
        <Button
          col="2"
          v-if="!filterTrylater"
          class="ico"
          :text="recipe.tried ? icon.try : icon.tried"
          @tap="toggleTrylater"
        />
        <Button
          col="2"
          v-else
          class="ico"
          :text="icon.done"
          @tap="recipeTried"
        />
        <Button
          col="3"
          class="ico"
          :text="recipe.isFavorite ? icon.faved : icon.fav"
          @tap="toggleFavourite"
        />
        <Button
          col="4"
          v-if="!busy"
          class="ico"
          :text="icon.edit"
          @tap="editRecipe"
        />
        <ActivityIndicator col="4" v-else :busy="busy" />
        <Button
          class="ico fab"
          :text="icon.share"
          col="5"
          @tap="shareHandler"
        />
      </GridLayout>
      <GridLayout
        v-show="toast"
        row="1"
        class="appbar"
        :class="hlMsg && 'hlMsg'"
        columns="*"
        @tap="toast = null"
      >
        <FlexboxLayout minHeight="48" alignItems="center">
          <Label class="title msg" :text="toast" />
        </FlexboxLayout>
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import {
  Application,
  ImageSource,
  Utils,
  Span,
  FormattedString,
  Label,
  Observable,
  Screen,
} from "@nativescript/core";
import * as SocialShare from "@nativescript/social-share";
import { localize } from "@nativescript/localize";
const intl = require("nativescript-intl");
import { mapActions, mapState } from "vuex";
import EditRecipe from "./EditRecipe.vue";
import ActionDialog from "./modal/ActionDialog.vue";
import PromptDialog from "./modal/PromptDialog.vue";
let toastTimer, scrollTimer;
export default {
  props: ["filterTrylater", "recipeID"],
  data() {
    return {
      busy: false,
      yieldMultiplier: 1,
      recipe: null,
      currentRecipeID: this.recipeID,
      scrollview: null,
      appbar: null,
      ingcon: null,
      inscon: null,
      notescon: null,
      checks: [],
      steps: [],
      toast: null,
      hlMsg: false,
      selectedIndex: 0,
      scrollingToId: false,
      scrolled: false,
    };
  },
  computed: {
    ...mapState(["icon", "recipes"]),
    positiveYieldMultiplier() {
      return Math.abs(this.yieldMultiplier) > 0
        ? Math.abs(parseFloat(this.yieldMultiplier))
        : 1;
    },
    topmenu() {
      return [
        {
          icon: "items",
          count: this.recipe.ingredients.length,
        },
        {
          icon: "steps",
          count: this.recipe.instructions.length,
        },
        {
          icon: "comb",
          count: this.recipe.combinations.length,
        },
        {
          icon: "notes",
          count: this.recipe.notes.length,
        },
      ].filter((e) => e.count);
    },
  },
  methods: {
    ...mapActions([
      "toggleStateAction",
      "setComponent",
      "overwriteRecipeAction",
      "setRecipeAsTriedAction",
      "setRatingAction",
      "toggleCartAction",
    ]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
      this.busy = false;
      setTimeout((e) => {
        this.setComponent("ViewRecipe");
      }, 500);
      if (this.yieldMultiplier == this.recipe.yield.quantity)
        this.yieldMultiplier = this.recipe.yield.quantity;
      this.keepScreenOn(true);
      this.syncCombinations();
    },
    onPageUnload() {
      this.keepScreenOn(false);
    },
    onAppBarLoad({ object }) {
      this.appbar = object;
    },
    onIngsLoad({ object }) {
      this.ingcon = object;
    },
    onInsLoad({ object }) {
      this.inscon = object;
    },
    onNosLoad({ object }) {
      this.notescon = object;
      this.createNotes();
    },

    onScrollLoad(args) {
      this.scrollview = args.object;
    },
    onScroll(args) {
      if (!this.scrollingToId) {
        let vm = this;
        let h = Screen.mainScreen.heightDIPs;
        function getPos(id) {
          return vm.scrollview.getViewById(id).getLocationOnScreen().y + 144;
        }
        let items = getPos("items") <= h;
        let steps = getPos("steps") <= h;
        let comb = getPos("comb") <= h;
        let notes = getPos("notes") <= h;
        if (items) this.selectedIndex = 0;
        if (steps) this.selectedIndex = 1;
        if (comb) this.selectedIndex = 2;
        if (notes) this.selectedIndex = 3;
      }
      this.scrolled = this.scrollview.verticalOffset != 0;
      let scrollUp;
      let y = args.scrollY;
      if (y) {
        scrollUp = y < this.scrollPos;
        this.scrollPos = Math.abs(y);
        let ab = this.appbar.translateY;
        if (!scrollUp && ab == 0)
          this.animateInOut(
            250,
            false,
            (val) => (this.appbar.translateY = val * 64)
          );
        else if (scrollUp && ab == 64)
          this.animateInOut(
            250,
            true,
            (val) => (this.appbar.translateY = val * 64)
          );
      }
    },
    // HELPERS
    changeYield() {
      this.$showModal(PromptDialog, {
        props: {
          title: `${localize("req")} ${localize(this.recipe.yield.unit)}`,
          placeholder: Math.abs(parseFloat(this.yieldMultiplier)),
          action: "SET",
        },
      }).then((item) => {
        if (item) this.yieldMultiplier = item;
      });
    },
    hasTime(time) {
      return time != "00:00";
    },
    niceDate(time) {
      let lastTried = new Date(time).getTime();
      let now = new Date().getTime();
      let midnight = new Date().setHours(0, 0, 0, 0);
      let diff = (now - lastTried) / 1000;
      let dayDiff = Math.ceil(diff / 86400);
      if (isNaN(dayDiff) || dayDiff < 0) return "";

      function duration(value) {
        return localize(value);
      }
      return (
        (diff < 86400 && lastTried > midnight && duration("today")) ||
        (dayDiff == 1 && "yesterday") ||
        (dayDiff < 7 && dayDiff + " " + duration("dAgo")) ||
        (dayDiff < 31 && Math.round(dayDiff / 7) + " " + duration("wAgo")) ||
        (dayDiff < 366 && Math.round(dayDiff / 30) + " " + duration("mAgo")) ||
        (dayDiff > 365 && duration("ltAgo"))
      );
    },
    showLastTried() {
      this.showToast(
        `${localize("triedInfo")} ${this.niceDate(this.recipe.lastTried)}`,
        5,
        true
      );
    },
    roundedQuantity(quantity) {
      return Math.abs(
        Math.round(
          (quantity / this.recipe.yield.quantity) *
            this.positiveYieldMultiplier *
            100
        ) / 100
      );
    },
    keepScreenOn(boolean) {
      let activity =
        Application.android.foregroundActivity ||
        Application.android.startActivity;
      let window = activity.getWindow();
      let flag = android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON;
      boolean ? window.addFlags(flag) : window.clearFlags(flag);
    },
    formattedTime(time) {
      let t = time.split(":");
      let h = parseInt(t[0]);
      let m = parseInt(t[1]);
      let hr = localize("hr");
      let min = localize("min");
      return h ? (m ? `${h} ${hr} ${m} ${min}` : `${h} ${hr}`) : `${m} ${min}`;
    },
    formattedDate(date) {
      let d = new Date(date);
      var dateFormat = new intl.DateTimeFormat(null, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(d);
      return `${dateFormat}`;
    },
    isValidURL(string) {
      let pattern = new RegExp("^https?|^www", "ig");
      return pattern.test(string);
    },
    getCombinationTitle(id) {
      return this.recipes.filter((e) => e.id === id)[0].title;
    },
    syncCombinations() {
      let combinationForOtherRecipes = this.recipes
        .filter(
          (e) =>
            e.combinations.indexOf(this.currentRecipeID) >= 0 ||
            this.recipe.combinations.includes(e.id)
        )
        .map((e) => e.id);
      this.recipe.combinations = combinationForOtherRecipes;
      this.overwriteRecipeAction({
        id: this.currentRecipeID,
        recipe: this.recipe,
      });
    },
    checkChange(obj, index) {
      this.checks[index] = !this.checks[index];
      obj.getChildAt(0).text = this.checks[index]
        ? this.icon.succ
        : this.icon.done;
    },
    touchIngredient({ object, action }, index) {
      object.className = action.match(/down|move/)
        ? "ingredient fade"
        : "ingredient";
      if (action == "up") this.checkChange(object, index);
    },
    clearChecks() {
      for (let i = 0; i < this.ingcon.getChildrenCount(); i++) {
        this.ingcon.getChildAt(i).getChildAt(0).text = this.icon.done;
      }
    },
    stepDone(object) {
      let a = object;
      a.className = a.className.includes("done")
        ? "instruction"
        : "instruction done";
    },
    touchInstruction({ object, action }) {
      let hasDone = object.className.includes("done");
      object.className = action.match(/down|move/)
        ? `instruction fade ${hasDone ? "done" : ""}`
        : `instruction ${hasDone ? "done" : ""}`;
      if (action == "up") this.stepDone(object);
    },
    clearSteps() {
      for (let i = 0; i < this.inscon.getChildrenCount(); i++) {
        this.inscon.getChildAt(i).className = "instruction";
      }
    },

    // NAVIGATION HANDLERS
    editRecipe() {
      this.busy = true;
      this.$navigateTo(EditRecipe, {
        props: {
          navigationFromView: true,
          filterTrylater: this.filterTrylater,
          recipeID: this.currentRecipeID,
        },
        // backstackVisible: false,
      });
    },
    viewCombination(combination) {
      this.scrollview.scrollToVerticalOffset(0, true);
      this.recipe = this.recipes.filter((e) => e.id === combination)[0];
      this.recipe.ingredients.forEach((e) => this.checks.push(false));
      this.clearSteps();
      this.clearChecks();
      this.currentRecipeID = combination;
      this.syncCombinations();
      this.createNotes();
      this.recipe.tried && this.recipe.lastTried && this.showLastTried();
    },

    // SHARE ACTION
    shareHandler() {
      if (this.recipe.imageSrc) {
        this.$showModal(ActionDialog, {
          props: {
            title: "shr",
            list: ["pht", "rec"],
          },
        }).then((result) => {
          switch (result) {
            case "pht":
              ImageSource.fromFile(this.recipe.imageSrc).then((res) => {
                SocialShare.shareImage(res, "Share recipe photo using");
              });
              break;
            case "rec":
              this.shareRecipe();
              break;
            default:
              break;
          }
        });
      } else {
        this.shareRecipe();
      }
    },
    shareRecipe() {
      let overview = `${this.recipe.title}\n\n${localize(
        "Cuisine"
      )}: ${localize(this.recipe.cuisine)}\n${localize("Category")}: ${localize(
        this.recipe.category
      )}\n${localize("ts")}: ${this.recipe.tags.join(", ")}\n${localize(
        "stars"
      )}: ${this.recipe.rating}\n${localize("Difficulty level")}: ${localize(
        this.recipe.difficulty
      )}\n${localize("Preparation time")}: ${this.formattedTime(
        this.recipe.prepTime
      )}\n${localize("Cooking time")}: ${this.formattedTime(
        this.recipe.cookTime
      )}\n`;
      let shareContent = overview;
      if (this.recipe.ingredients.length) {
        let ingredients = `\n\n${localize("ings")} (${
          this.yieldMultiplier
        } ${localize(this.recipe.yield.unit)}):\n\n`;
        this.recipe.ingredients.forEach((e) => {
          ingredients += `- ${
            e.quantity
              ? this.roundedQuantity(e.quantity) +
                " " +
                this.$options.filters.L(e.unit) +
                " "
              : ""
          }${e.item}\n`;
        });
        shareContent += ingredients;
      }
      if (this.recipe.instructions.length) {
        let instructions = `\n\n${localize("Instructions")}:\n\n`;
        this.recipe.instructions.forEach((e, i) => {
          instructions += `${i + 1}. ${e}\n\n`;
        });
        shareContent += instructions;
      }
      if (this.recipe.notes.length) {
        let notes = `\n${localize("nos")}:\n\n`;
        this.recipe.notes.forEach((e, i) => {
          notes += `${i + 1}. ${e}\n\n`;
        });
        shareContent += notes;
      }
      if (this.recipe.combinations.length) {
        let combinations = `\n${localize("cmbs")}:\n\n`;
        this.recipe.combinations.forEach((e, i) => {
          combinations += `${i + 1}. ${this.getCombinationTitle(e)}\n\n`;
        });
        shareContent += combinations;
      }
      let sharenote = "\n" + localize("appCrd");
      shareContent += sharenote;
      SocialShare.shareText(shareContent, "Share recipe using");
    },

    // DATA HANDLERS
    showToast(msg, dur, hl) {
      clearInterval(toastTimer);
      this.hlMsg = hl;
      this.toast = msg;
      toastTimer = setInterval(() => {
        dur--;
        if (dur == 0) {
          this.toast = null;
          clearInterval(toastTimer);
        }
      }, 1000);
    },
    toggle(key, setDate) {
      this.toggleStateAction({
        id: this.currentRecipeID,
        recipe: this.recipe,
        key,
        setDate,
      });
    },
    toggleFavourite() {
      this.recipe.isFavorite
        ? this.showToast(localize("unfavd"), 3)
        : this.showToast(localize("favd"), 3);
      this.toggle("isFavorite");
    },
    toggleTrylater() {
      this.recipe.tried
        ? this.showToast(localize("aTry"), 3)
        : this.showToast(localize("rmTry"), 3);
      this.toggle("tried");
    },
    recipeTried() {
      this.setRecipeAsTriedAction({
        id: this.currentRecipeID,
        recipe: this.recipe,
      });
      this.$navigateBack();
    },
    setRating(rating) {
      if (rating !== this.recipe.rating || rating === 1) {
        this.setRatingAction({
          id: this.currentRecipeID,
          recipe: this.recipe,
          rating,
        });
      }
    },

    // SHOPPINGLIST
    toggleCart() {
      if (!this.recipe.inBag) {
      } else {
      }
      this.toggleCartAction({
        id: this.currentRecipeID,
        recipe: this.recipe,
      });
    },

    // NOTES
    createNote(note) {
      let regex = /(https?:\/\/[^\s]+)/g;
      const lbl = new Label();
      lbl.class = "note";
      lbl.textWrap = true;
      let fString = new FormattedString();
      let arr = note.split(regex);

      function createSpan(text, isUrl) {
        let span = new Span();
        span.text = text;
        span.fontSize = 14;
        if (isUrl) {
          span.textDecoration = "underline";
          span.on("linkTap", () => Utils.openUrl(text));
        }
        fString.spans.push(span);
      }
      arr.forEach((text) => {
        createSpan(text, regex.test(text));
      });
      lbl.formattedText = fString;
      return lbl;
    },
    createNotes() {
      const stack = this.notescon;
      stack.removeChildren();
      this.recipe.notes.forEach((note) =>
        stack.addChild(this.createNote(note))
      );
    },
    getTags(tags) {
      return tags.join(" · ");
    },

    //HELPERS
    touchSelector({ object, action }, index, id) {
      let selected = this.selectedIndex == index;
      object.className = action.match(/down|move/)
        ? `segment ${selected ? "select" : "fade"}`
        : `segment ${selected && "select"}`;
      if (action == "up") this.scrollToId(index, id);
    },
    scrollToId(index, id) {
      this.scrollingToId = true;
      if (index != this.selectedIndex)
        this.scrollview.scrollToVerticalOffset(
          this.scrollview.getViewById(id).getLocationRelativeTo(this.scrollview)
            .y + this.scrollview.verticalOffset,
          true
        );
      clearInterval(scrollTimer);
      scrollTimer = setInterval(() => {
        if (this.selectedIndex == index) {
          this.scrollingToId = false;
          clearInterval(scrollTimer);
        }
      }, 1000);
      this.selectedIndex = index;
    },
    touchYield({ object, action }) {
      object.className = action.match(/down|move/)
        ? "value clickable fade"
        : "value clickable";
      if (action == "up") this.changeYield();
    },
  },
  created() {
    this.recipe = this.recipes.filter((e) => e.id === this.currentRecipeID)[0];
    this.recipe.ingredients.forEach((e) => this.checks.push(false));
  },
  mounted() {
    this.yieldMultiplier = this.recipe.yield.quantity;
    this.recipe.tried && this.recipe.lastTried && this.showLastTried();
  },
};
</script>
