<template>
  <Page @loaded="onPageLoad" @unloaded="onPageUnload">
    <ActionBar flat="true">
      <GridLayout rows="48" columns="auto, *, auto">
        <MDButton
          variant="text"
          row="0"
          col="0"
          class="er"
          :text="icon.back"
          automationText="Back"
          @tap="$navigateBack()"
        />
        <FlexboxLayout row="0" col="2" alignItems="center">
          <MDButton
            v-if="!filterTrylater"
            variant="text"
            class="er"
            :text="recipe.tried ? icon.try : icon.tried"
            @tap="toggleTrylater"
          />
          <MDButton
            v-else
            variant="text"
            class="er"
            :text="icon.done"
            @tap="recipeTried"
          />
          <MDButton
            variant="text"
            class="er"
            :text="recipe.isFavorite ? icon.faved : icon.fav"
            @tap="toggleFavourite"
          />
          <!-- <MDButton variant="text" class="er" :text="recipe.inBag ? icon.bagged : icon.bag" @tap="toggleCart" /> -->
          <MDButton
            variant="text"
            v-if="!busy"
            class="er"
            :text="icon.edit"
            @tap="editRecipe"
          />
          <MDActivityIndicator v-else :busy="busy" />
        </FlexboxLayout>
      </GridLayout>
    </ActionBar>
    <AbsoluteLayout>
      <Tabs
        width="100%"
        height="100%"
        :selectedIndex="selectedTabIndex"
        @selectedIndexChange="selectedIndexChange"
        class="viewRecipe"
        elevation="0"
      >
        <TabStrip flat="true">
          <TabStripItem>
            <Label :text="'ovw' | L"></Label>
          </TabStripItem>
          <TabStripItem>
            <Label :text="'ings' | L"></Label>
          </TabStripItem>
          <TabStripItem>
            <Label :text="'Instructions' | L"></Label>
          </TabStripItem>
          <TabStripItem>
            <Label :text="'nos' | L"></Label>
          </TabStripItem>
          <TabStripItem>
            <Label :text="'cmbs' | L"></Label>
          </TabStripItem>
        </TabStrip>
        <TabContentItem>
          <ScrollView @loaded="overviewLoaded">
            <StackLayout>
              <StackLayout
                width="100%"
                :height="screenWidth"
                verticalAlignment="center"
                class="imageHolder"
              >
                <Image
                  v-if="recipe.imageSrc"
                  :src="recipe.imageSrc"
                  stretch="aspectFill"
                  width="100%"
                  :height="screenWidth"
                />
                <Label
                  v-else
                  horizontalAlignment="center"
                  class="er"
                  fontSize="160"
                  :text="icon.img"
                />
              </StackLayout>
              <StackLayout margin="16 4 80">
                <Label
                  class="category"
                  :text="`${$options.filters.L(
                    recipe.cuisine
                  )} • ${$options.filters.L(recipe.category)}`"
                />
                <Label
                  class="title tb"
                  :text="recipe.title"
                  textWrap="true"
                />
                <FlexboxLayout class="ratingContainer">
                  <Label
                    class="rate er"
                    :class="{ rated: recipe.rating >= n }"
                    v-for="n in 5"
                    :key="n"
                    :text="recipe.rating < n ? icon.star : icon.starred"
                    @tap="
                      recipe.rating == 1 && n == 1 ? setRating(0) : setRating(n)
                    "
                    @longPress="setRating(n)"
                  />
                </FlexboxLayout>
                <Label
                  class="attr"
                  :text="`${$options.filters.L(
                    'Difficulty level'
                  )}: ${$options.filters.L(recipe.difficulty)}`"
                  textWrap="true"
                />
                <Label
                  class="attr"
                  :text="`${$options.filters.L(
                    'Preparation time'
                  )}: ${formattedTime(recipe.prepTime)}`"
                  textWrap="true"
                />
                <Label
                  class="attr"
                  :text="`${$options.filters.L(
                    'Cooking time'
                  )}: ${formattedTime(recipe.cookTime)}`"
                  textWrap="true"
                />
                <FlexboxLayout
                  v-if="recipe.tags.length"
                  class="tagsContainer"
                  flexWrap="wrap"
                >
                  <Label
                    class="tagsTitle"
                    :text="`${$options.filters.L('ts')}: `"
                  />
                  <Label
                    v-for="(tag, index) in recipe.tags"
                    :key="index"
                    :text="tag"
                    class="tag"
                    textWrap="false"
                  />
                </FlexboxLayout>
                <GridLayout
                  rows="auto, auto"
                  columns="*, *"
                  class="overviewContainer"
                >
                  <GridLayout
                    class="overviewItem mdr"
                    row="0"
                    col="0"
                    rows="auto, auto"
                    columns="*"
                    @tap="selectedTabIndex = 1"
                  >
                    <Label row="0" class="er" :text="icon.items" />
                    <Label
                      row="1"
                      class="itemCount"
                      :text="`${recipe.ingredients.length} ${
                        recipe.ingredients.length == 1
                          ? $options.filters.L('ing')
                          : $options.filters.L('ings')
                      }`"
                      textWrap="true"
                    />
                  </GridLayout>
                  <GridLayout
                    class="overviewItem mdr"
                    row="0"
                    col="1"
                    rows="auto, auto"
                    columns="*"
                    @tap="selectedTabIndex = 2"
                  >
                    <Label row="0" class="er" :text="icon.steps" />
                    <Label
                      row="1"
                      class="itemCount"
                      :text="`${recipe.instructions.length} ${
                        recipe.instructions.length == 1
                          ? $options.filters.L('Instruction')
                          : $options.filters.L('Instructions')
                      }`"
                      textWrap="true"
                    />
                  </GridLayout>
                  <GridLayout
                    class="overviewItem mdr"
                    row="1"
                    col="0"
                    rows="auto, auto"
                    columns="*"
                    @tap="selectedTabIndex = 3"
                  >
                    <Label row="0" class="er" :text="icon.notes" />
                    <Label
                      row="1"
                      class="itemCount"
                      :text="`${recipe.notes.length} ${
                        recipe.notes.length == 1
                          ? $options.filters.L('no')
                          : $options.filters.L('nos')
                      }`"
                      textWrap="true"
                    />
                  </GridLayout>
                  <GridLayout
                    class="overviewItem mdr"
                    row="1"
                    col="1"
                    rows="auto, auto"
                    columns="*"
                    @tap="selectedTabIndex = 4"
                  >
                    <Label row="0" class="er" :text="icon.comb" />
                    <Label
                      row="1"
                      class="itemCount"
                      :text="`${recipe.combinations.length} ${
                        recipe.combinations.length == 1
                          ? $options.filters.L('cmb')
                          : $options.filters.L('cmbs')
                      }`"
                      textWrap="true"
                    />
                  </GridLayout>
                </GridLayout>
                <Label
                  class="attr small"
                  :text="`${$options.filters.L(
                    'Last updated'
                  )}: ${formattedDate(recipe.lastModified)}`"
                  textWrap="true"
                />
                <Label
                  class="attr small"
                  :text="`${$options.filters.L('Created')}: ${formattedDate(
                    recipe.created
                  )}`"
                  textWrap="true"
                />
              </StackLayout>
            </StackLayout>
          </ScrollView>
        </TabContentItem>
        <TabContentItem>
          <ScrollView>
            <GridLayout
              v-if="!recipe.ingredients.length"
              rows="*, auto, *, 88"
              columns="*"
              class="emptyStateContainer"
            >
              <StackLayout col="0" row="1" class="emptyState">
                <Label class="er icon" :text="icon.items" textWrap="true" />
                <Label class="title tb" :text="'pAIng' | L" textWrap="true" />
              </StackLayout>
            </GridLayout>
            <StackLayout v-else padding="24 16 72">
              <StackLayout class="inputField">
                <Label
                  class="fieldLabel"
                  :text="`${$options.filters.L('req')} ${$options.filters.L(
                    recipe.yield.unit
                  )}`"
                />
                <TextField
                  width="50%"
                  v-model="yieldMultiplier"
                  keyboardType="number"
                />
              </StackLayout>
              <Label
                padding="16 0 8"
                class="title tb"
                :text="`${$options.filters.L(
                  'ings'
                )} (${positiveYieldMultiplier} ${$options.filters.L(
                  recipe.yield.unit
                )})`"
                textWrap="true"
              />
              <check-box
                v-for="(item, index) in recipe.ingredients"
                :key="index"
                class="ingredient"
                :color="isLightMode ? '#1A1A1A' : '#e0e0e0'"
                style="font-family: 'Inter-Medium'"
                :checkPadding="checkPadding"
                marginLeft="4"
                @checkedChange="checkChange"
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
            </StackLayout>
          </ScrollView>
        </TabContentItem>
        <TabContentItem>
          <ScrollView>
            <GridLayout
              v-if="!recipe.instructions.length"
              rows="*, auto, *, 88"
              columns="*"
              class="emptyStateContainer"
            >
              <StackLayout col="0" row="1" class="emptyState">
                <Label class="er icon" :text="icon.steps" textWrap="true" />
                <Label class="title tb" :text="'pAIns' | L" textWrap="true" />
              </StackLayout>
            </GridLayout>
            <StackLayout v-else padding="28 16 62">
              <GridLayout
                @tap="stepDone"
                columns="auto ,*"
                v-for="(instruction, index) in recipe.instructions"
                :key="index"
              >
                <Label
                  col="0"
                  colSpan="2"
                  class="instruction"
                  :class="{
                    noBorder: index === recipe.instructions.length - 1,
                  }"
                  :text="instruction"
                  textWrap="true"
                />
                <Label
                  @loaded="centerLabel"
                  class="count tb"
                  col="0"
                  :text="index + 1"
                />
              </GridLayout>
            </StackLayout>
          </ScrollView>
        </TabContentItem>
        <TabContentItem>
          <ScrollView>
            <GridLayout
              v-if="!recipe.notes.length"
              rows="*, auto, *, 88"
              columns="*"
              class="emptyStateContainer"
            >
              <StackLayout col="0" row="1" class="emptyState">
                <Label class="er icon" :text="icon.notes" textWrap="true" />
                <Label class="title tb" :text="'pANo' | L" textWrap="true" />
              </StackLayout>
            </GridLayout>
            <StackLayout v-else padding="16 16 62" @loaded="createNotes">
            </StackLayout>
          </ScrollView>
        </TabContentItem>
        <TabContentItem>
          <ScrollView>
            <GridLayout
              v-if="!recipe.combinations.length"
              rows="*, auto, *, 88"
              columns="*"
              class="emptyStateContainer"
            >
              <StackLayout col="0" row="1" class="emptyState">
                <Label class="er icon" :text="icon.comb" textWrap="true" />
                <Label class="title tb" :text="'pACmb' | L" textWrap="true" />
              </StackLayout>
            </GridLayout>
            <StackLayout v-else padding="16 0 80">
              <GridLayout
                columns="*"
                v-for="(combination, index) in recipe.combinations"
                :key="index"
                elevation="1"
                class="combination mdr"
                @tap="viewCombination(combination)"
              >
                <Label
                  verticalAlignment="center"
                  class="combinationTitle"
                  :text="getCombinationTitle(combination)"
                  textWrap="true"
                />
              </GridLayout>
            </StackLayout>
          </ScrollView>
        </TabContentItem>
      </Tabs>
      <GridLayout id="btnFabContainer" rows="*, auto" columns="*, auto">
        <transition name="bounce" appear>
          <MDFloatingActionButton
            row="1"
            col="1"
            src="res://share"
            @tap="shareHandler"
            v-if="showFab"
          />
        </transition>
      </GridLayout>
    </AbsoluteLayout>
  </Page>
</template>

<script>
import {
  Application,
  Color,
  ImageSource,
  Screen,
  Utils,
  Span,
  FormattedString,
  Label,
  GridLayout,
  ItemSpec,
  Observable,
  GestureTypes,
} from "@nativescript/core";
import {
  Feedback,
  FeedbackType,
  FeedbackPosition,
} from "nativescript-feedback";
import * as Toast from "nativescript-toast";
import * as SocialShare from "@nativescript/social-share";
import { localize } from "@nativescript/localize";
const intl = require("nativescript-intl");
import { mapActions, mapState } from "vuex";
import EditRecipe from "./EditRecipe.vue";
import ViewRecipe from "./ViewRecipe.vue";
import ShareChooser from "./modal/ShareChooser.vue";
let feedback = new Feedback();
export default {
  props: ["filterTrylater", "recipeID"],
  data() {
    return {
      busy: false,
      yieldMultiplier: 1,
      recipe: null,
      showFab: false,
      selectedTabIndex: 0,
      currentRecipeID: this.recipeID,
      hideActionBar: false,
      overviewTab: null,
      checks: [],
      checkboxes: [],
      steps: [],
    };
  },
  computed: {
    ...mapState(["icon", "recipes"]),
    screenWidth() {
      return Screen.mainScreen.widthDIPs;
    },
    positiveYieldMultiplier() {
      return Math.abs(this.yieldMultiplier) > 0
        ? Math.abs(parseFloat(this.yieldMultiplier))
        : 1;
    },
    isLightMode() {
      return Application.systemAppearance() === "light";
    },
    checkPadding() {
      return `${Math.round(20 * Utils.layout.getDisplayDensity())},0,0,0`;
    },
  },
  methods: {
    ...mapActions([
      "toggleStateAction",
      "setCurrentComponentAction",
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
        this.setCurrentComponentAction("ViewRecipe");
      }, 500);
      this.showFab = true;
      if (this.yieldMultiplier == this.recipe.yield.quantity)
        this.yieldMultiplier = this.recipe.yield.quantity;
      this.keepScreenOn(true);
      this.syncCombinations();
    },
    onPageUnload() {
      this.keepScreenOn(false);
      feedback.hide();
    },
    overviewLoaded(args) {
      this.overviewTab = args;
    },

    // HELPERS
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
    selectedIndexChange(args) {
      this.selectedTabIndex = args.object.selectedIndex;
    },
    showLastTried() {
      feedback.show({
        title: `${localize("triedInfo")} ${this.niceDate(
          this.recipe.lastTried
        )}`,
        titleColor: new Color(`${this.isLightMode ? "#fff" : "#1A1A1A"}`),
        backgroundColor: new Color("#ff5200"),
      });
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
      if (boolean)
        window.addFlags(
          android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        );
      else
        window.clearFlags(
          android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        );
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
    checkChange(args, index) {
      let check = args.object;
      this.checkboxes.push(check);
      this.checks[index] = !this.checks[index];
    },
    stepDone(args) {
      let a = args.object;
      this.steps.push(a);
      if (a.className !== "done") a.className = "done";
      else a.className = "";
    },
    centerLabel(args) {
      args.object.android.setGravity(17);
    },
    clearChecks() {
      this.checkboxes.forEach((e) => {
        if (e.checked) e.checked = false;
      });
      this.checkboxes = [];
    },
    clearSteps() {
      this.steps.forEach((e) => {
        if (e.className === "done") e.className = "";
      });
      this.steps = [];
    },

    // NAVIGATION HANDLERS
    editRecipe() {
      this.showFab = false;
      this.busy = true;
      this.$navigateTo(EditRecipe, {
        props: {
          navigationFromView: true,
          filterTrylater: this.filterTrylater,
          recipeID: this.currentRecipeID,
        },
        backstackVisible: false,
      });
    },
    viewCombination(combination) {
      this.recipe = this.recipes.filter((e) => e.id === combination)[0];
      this.recipe.ingredients.forEach((e) => this.checks.push(false));
      this.clearChecks();
      this.clearSteps();
      this.currentRecipeID = combination;
      this.syncCombinations();
      this.selectedTabIndex = 0;
      this.overviewTab.object.scrollToVerticalOffset(0, true);
      setTimeout(
        (e) =>
          this.recipe.tried && this.recipe.lastTried && this.showLastTried(),
        500
      );
    },

    // SHARE ACTION
    shareHandler() {
      if (this.recipe.imageSrc) {
        this.$showModal(ShareChooser, {
          props: {
            title: "shr",
            helpIcon: "share",
          },
        }).then((result) => {
          switch (result) {
            case "photo":
              ImageSource.fromFile(this.recipe.imageSrc).then((res) => {
                SocialShare.shareImage(res, "Share recipe photo using");
              });
              break;
            case "recipe":
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
        ? Toast.makeText(localize("unfavd")).show()
        : Toast.makeText(localize("favd")).show();
      this.toggle("isFavorite");
    },
    toggleTrylater() {
      this.recipe.tried
        ? Toast.makeText(localize("aTry")).show()
        : Toast.makeText(localize("rmTry")).show();
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
    createNote(note, i) {
      const vm = this;
      let regex = /(https?:\/\/[^\s]+)/g;
      const grid = new GridLayout();
      const firstCol = new ItemSpec(1, "star");
      const label = new Label();
      label.class = "note";
      label.textWrap = true;
      let formattedString = new FormattedString();
      let textArray = note.split(regex);

      function createSpan(text, isUrl) {
        let span = new Span();
        span.text = text;
        span.fontSize = 14;
        if (isUrl) {
          span.textDecoration = "underline";
          span.color = "#ff5200";
          span.on("linkTap", () => Utils.openUrl(text));
        }
        formattedString.spans.push(span);
      }
      textArray.forEach((text) => {
        createSpan(text, regex.test(text));
      });
      label.formattedText = formattedString;
      grid.addChild(label);
      GridLayout.setColumn(label, 0);
      grid.addColumn(firstCol);
      return grid;
    },
    createNotes(args) {
      const stack = args.object;
      if (!stack.getChildrenCount()) {
        this.recipe.notes.forEach((note, i) => {
          stack.addChild(this.createNote(note, i));
        });
      }
    },
  },
  created() {
    this.recipe = this.recipes.filter((e) => e.id === this.currentRecipeID)[0];
    this.recipe.ingredients.forEach((e) => this.checks.push(false));
  },
  mounted() {
    this.showFab = true;
    this.yieldMultiplier = this.recipe.yield.quantity;
    setTimeout(
      (e) => this.recipe.tried && this.recipe.lastTried && this.showLastTried(),
      500
    );
  },
};
</script>
