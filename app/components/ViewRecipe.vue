<template>
  <Page @loaded="onPageLoad" @unloaded="onPageUnload" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="*">
      <DockLayout stretchLastChild="true" rowSpan="2">
        <GridLayout
          dock="top"
          rows="auto,auto"
          columns="*, auto"
          paddingBottom="24"
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
            v-if="recipe.image"
            :src="recipe.image"
            stretch="aspectFit"
            class="photo"
            decodeWidth="96"
            decodeHeight="96"
            @tap="viewPhoto"
          />
        </GridLayout>
        <AbsoluteLayout dock="bottom">
          <ScrollView
            dock="bottom"
            width="100%"
            height="100%"
            @loaded="onScrollLoad"
            @scroll="onScroll($event)"
          >
            <StackLayout>
              <GridLayout rows="auto" columns="*, *">
                <StackLayout class="attribute">
                  <Label class="title sub" :text="'cui' | L" />
                  <Label class="value" :text="recipe.cuisine | L" />
                </StackLayout>
                <StackLayout class="attribute" col="1">
                  <Label class="title sub" :text="'cat' | L" />
                  <Label class="value" :text="recipe.category | L" />
                </StackLayout>
              </GridLayout>
              <StackLayout :hidden="!recipe.tags.length" class="attribute">
                <Label class="title sub" :text="'ts' | L" />
                <Label class="value" :text="getTags(recipe.tags)" />
              </StackLayout>
              <GridLayout rows="auto" columns="*, *">
                <StackLayout
                  class="attribute"
                  :hidden="!hasTime(recipe.prepTime)"
                >
                  <Label class="title sub" :text="'prepT' | L" />
                  <Label class="value" :text="formattedTime(recipe.prepTime)" />
                </StackLayout>
                <StackLayout
                  :col="hasTime(recipe.prepTime) ? 1 : 0"
                  class="attribute"
                  :hidden="!hasTime(recipe.cookTime)"
                >
                  <Label class="title sub" :text="'cookT' | L" />
                  <Label class="value" :text="formattedTime(recipe.cookTime)" />
                </StackLayout>
              </GridLayout>
              <GridLayout rows="auto" columns="*, *">
                <StackLayout class="attribute">
                  <Label class="title sub" :text="'yld' | L" />
                  <Label
                    @touch="touchYield"
                    class="value clickable"
                    horizontalAlignment="left"
                    :text="`${tempYieldQuantity} ${$options.filters.L(
                      recipe.yieldUnit
                    )}`"
                  />
                </StackLayout>
                <StackLayout class="attribute" col="1">
                  <Label class="title sub" :text="'Difficulty level' | L" />
                  <Label class="value" :text="recipe.difficulty | L" />
                </StackLayout>
              </GridLayout>
              <StackLayout @loaded="onIngsLoad">
                <Label
                  padding="0 16"
                  class="sectionTitle"
                  :hidden="!recipe.ingredients.length"
                  :text="getTitleCount('ings', 'ingredients')"
                />
                <StackLayout
                  orientation="horizontal"
                  v-for="(item, index) in recipe.ingredients"
                  :key="index + 'ing'"
                  class="ingredient"
                  @touch="touchIngredient($event, index)"
                >
                  <Button class="ico min" :text="icon.uncheck" />
                  <Label
                    class="value tw"
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
              </StackLayout>
              <StackLayout @loaded="onInsLoad">
                <Label
                  padding="0 16"
                  :hidden="!recipe.instructions.length"
                  class="sectionTitle"
                  :text="getTitleCount('inss', 'instructions')"
                />
                <StackLayout
                  orientation="horizontal"
                  @touch="touchInstruction"
                  v-for="(instruction, index) in recipe.instructions"
                  :key="index + 'ins'"
                  class="instruction"
                >
                  <Button class="count ico min" :text="index + 1" />
                  <Label class="value tw" :text="instruction" />
                </StackLayout>
              </StackLayout>
              <Label
                @loaded="onCmbLoad"
                padding="0 16"
                :hidden="!recipe.combinations.length"
                class="sectionTitle"
                :text="getTitleCount('cmbs', 'combinations')"
              />
              <Button
                v-for="(combination, index) in recipe.combinations"
                :key="index + 'comb'"
                class="combination"
                :text="getCombinationTitle(combination)"
                @tap="viewCombination(combination)"
              />
              <Label
                @loaded="onNosTLoad"
                padding="0 16"
                :hidden="!recipe.notes.length"
                class="sectionTitle"
                :text="getTitleCount('nos', 'notes')"
              />
              <StackLayout @loaded="onNosLoad" padding="0 16"> </StackLayout>
              <Label
                class="dateInfo sub tw"
                :text="`${$options.filters.L('Last updated')}: ${formattedDate(
                  recipe.lastModified
                )}\n${$options.filters.L('Created')}: ${formattedDate(
                  recipe.created
                )}`"
              />
            </StackLayout>
          </ScrollView>
          <Label
            @loaded="onStickyLoad"
            class="sectionTitle sticky"
            :hidden="!stickyTitle"
            :text="stickyTitle"
          />
        </AbsoluteLayout>
      </DockLayout>
      <GridLayout
        row="1"
        @loaded="onAppBarLoad"
        class="appbar"
        v-show="!toast"
        columns="auto, *, auto, auto, auto, auto, auto"
      >
        <Button
          class="ico"
          :text="photoOpen ? icon.x : icon.back"
          @tap="navigateBack"
        />
        <Button
          col="2"
          class="ico"
          :text="icon.timer"
          @tap="openCookingTimer"
        />
        <Button
          col="3"
          v-if="!filterTrylater"
          class="ico"
          :text="recipe.tried ? icon.try : icon.tried"
          @tap="toggle('tried')"
        />
        <Button
          col="3"
          v-else
          class="ico"
          :text="icon.done"
          @tap="toggle('tried', true)"
        />
        <Button
          col="4"
          class="ico"
          :text="recipe.favorite ? icon.faved : icon.fav"
          @tap="toggle('favorite')"
        />
        <Button
          col="5"
          v-if="!busy"
          class="ico"
          :text="icon.edit"
          @tap="editRecipe"
        />
        <ActivityIndicator col="5" v-else :busy="busy" />
        <Button
          col="6"
          class="ico fab"
          :text="icon.share"
          @tap="shareHandler"
        />
      </GridLayout>
      <Toast :toast="toast" :action="hideLastTried" />
      <AbsoluteLayout rowSpan="2">
        <Image
          @tap="({ object }) => (object.cancel = true)"
          backgroundColor="black"
          stretch="aspectFit"
          @loaded="onImgViewLoad"
          :src="recipe.image"
          class="photoviewer"
        />
      </AbsoluteLayout>
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import {
  Application,
  AndroidApplication,
  ImageSource,
  Utils,
  Span,
  FormattedString,
  Label,
  Observable,
  Screen,
  CoreTypes,
} from "@nativescript/core";
import { localize } from "@nativescript/localize";
const intl = require("nativescript-intl");
import { mapActions, mapState } from "vuex";
import CookingTimer from "./CookingTimer.vue";
import EditRecipe from "./EditRecipe.vue";
import Action from "./modals/Action.vue";
import Toast from "./sub/Toast.vue";
import Prompt from "./modals/Prompt.vue";
import * as utils from "~/shared/utils";
export default {
  components: { Toast },
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
      cmbcon: null,
      notescon: null,
      notesT: null,
      imgView: null,
      checks: [],
      checked: 0,
      stepsDid: 0,
      toast: null,
      photoOpen: false,
      showTitleArr: [false, false, false, false],
      sticky: null,
    };
  },
  computed: {
    ...mapState(["icon", "recipes"]),
    tempYieldQuantity() {
      return Math.abs(this.yieldMultiplier) > 0
        ? Math.abs(parseFloat(this.yieldMultiplier))
        : 1;
    },
    stickyTitle() {
      let val = null;
      switch (this.showTitleArr.lastIndexOf(true)) {
        case 0:
          val = this.getTitleCount("ings", "ingredients");
          break;
        case 1:
          val = this.getTitleCount("inss", "instructions");
          break;
        case 2:
          val = this.getTitleCount("cmbs", "combinations");
          break;
        case 3:
          val = this.getTitleCount("nos", "notes");
          break;
      }
      return val;
    },
  },
  methods: {
    ...mapActions([
      "toggleStateAction",
      "setComponent",
      "setRatingAction",
      "toggleCartAction",
    ]),
    onPageLoad({ object }) {
      object.bindingContext = new Observable();
      this.busy = this.photoOpen = false;
      this.setComponent("ViewRecipe");
      if (this.yieldMultiplier == this.recipe.yieldQuantity)
        this.yieldMultiplier = this.recipe.yieldQuantity;
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
    onCmbLoad({ object }) {
      this.cmbcon = object;
    },
    onNosTLoad({ object }) {
      this.notesT = object;
    },
    onNosLoad({ object }) {
      this.notescon = object;
      this.createNotes();
    },
    onScrollLoad(args) {
      this.scrollview = args.object;
    },
    onImgViewLoad({ object }) {
      this.imgView = object;
      this.imgView.visibility = "collapsed";
      this.imgView.top = 24;
      this.imgView.left = Screen.mainScreen.widthDIPs - 112;
    },
    onStickyLoad({ object }) {
      this.sticky = object;
    },
    fixTitle({ object }, swipeUp: boolean): void {
      let ingL = this.recipe.ingredients.length;
      let insL = this.recipe.instructions.length;
      let cmbL = this.recipe.combinations.length;
      let notL = this.recipe.notes.length;

      const isTop = (label): boolean => {
        let pos = label.getLocationRelativeTo(object).y;
        return label === this.cmbcon || label === this.notesT
          ? pos < 0
          : pos + 32 < 0;
      };

      const setVisibleTitle = (n: number): void => {
        let arr = [ingL, insL, cmbL, notL];
        this.showTitleArr = Array.from(
          { length: 4 },
          (v, i) => (v = arr[i] ? i < n : false)
        );
      };

      if (swipeUp) {
        if (ingL && !this.showTitleArr[0] && isTop(this.ingcon))
          setVisibleTitle(1);
        else if (insL && !this.showTitleArr[1] && isTop(this.inscon))
          setVisibleTitle(2);
        else if (cmbL && !this.showTitleArr[2] && isTop(this.cmbcon))
          setVisibleTitle(3);
        else if (notL && !this.showTitleArr[3] && isTop(this.notesT))
          setVisibleTitle(4);
      } else {
        if (notL && this.showTitleArr[3] && !isTop(this.notesT))
          setVisibleTitle(3);
        else if (cmbL && this.showTitleArr[2] && !isTop(this.cmbcon))
          setVisibleTitle(2);
        else if (insL && this.showTitleArr[1] && !isTop(this.inscon))
          setVisibleTitle(1);
        else if (ingL && this.showTitleArr[0] && !isTop(this.ingcon))
          setVisibleTitle(0);
      }
    },
    onScroll(args) {
      let swipeUp: boolean;
      let y = args.scrollY;
      if (y) {
        swipeUp = y > this.scrollPos;
        this.scrollPos = Math.abs(y);
        this.fixTitle(args, swipeUp);
        if (!this.toast) {
          let ab = this.appbar.translateY;
          if (swipeUp && ab == 0)
            this.appbar.animate({
              translate: { x: 0, y: 64 },
              duration: 250,
              curve: CoreTypes.AnimationCurve.ease,
            });
          else if (!swipeUp && ab == 64)
            this.appbar.animate({
              translate: { x: 0, y: 0 },
              duration: 250,
              curve: CoreTypes.AnimationCurve.ease,
            });
        }
      }
    },
    // HELPERS
    getTitleCount(title, type) {
      let count = this.recipe[type].length;
      let selected = null;
      switch (title) {
        case "ings":
          selected = this.checked;
          break;
        case "inss":
          selected = this.stepsDid;
          break;
      }
      let text = selected ? ` (${selected}/${count})` : ` (${count})`;
      return localize(title) + text;
    },
    changeYield() {
      this.$showModal(Prompt, {
        props: {
          title: `${localize("req", localize(this.recipe.yieldUnit))}`,
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
    niceDate(lastTried) {
      let now = new Date().getTime();
      let midnight = new Date().setHours(0, 0, 0, 0);
      let diff = (now - lastTried) / 1000;
      let dayDiff = Math.ceil(diff / 86400);
      if (isNaN(dayDiff) || dayDiff < 0) return "";

      function duration(value, number?) {
        return number ? localize(value, number) : localize(value);
      }
      return (
        (diff < 86400 && lastTried > midnight && duration("today")) ||
        (dayDiff == 1 && "yesterday") ||
        (dayDiff < 7 && duration("dAgo", dayDiff)) ||
        (dayDiff < 31 && duration("wAgo", Math.round(dayDiff / 7))) ||
        (dayDiff < 366 && duration("mAgo", Math.round(dayDiff / 30))) ||
        (dayDiff > 365 && duration("ltAgo"))
      );
    },
    showLastTried() {
      this.toast = localize("triedInfo", this.niceDate(this.recipe.lastTried));
      utils.timer(10, (val) => {
        if (!val) this.toast = val;
      });
    },
    hideLastTried({ object }) {
      object
        .animate({
          opacity: 0,
          translate: { x: 0, y: 64 },
          duration: 250,
          curve: CoreTypes.AnimationCurve.ease,
        })
        .then(() => {
          this.showUndo = false;
          this.appbar.translateY = 64;
          this.appbar.animate({
            translate: { x: 0, y: 0 },
            duration: 250,
            curve: CoreTypes.AnimationCurve.ease,
          });
          object.opacity = 1;
          object.translateY = 0;
          this.toast = null;
        });
    },
    // getMeasure(value: number, unit: string) {
    //   let vm = this;
    //   function roundedQ(val: number) {
    //     return Math.abs(
    //       Math.round(
    //         (val / vm.recipe.yieldQuantity) * vm.tempYieldQuantity * 100
    //       ) / 100
    //     );
    //   }
    //   if (value) {
    //     let rounded = Math.abs(
    //       Math.round(
    //         (value / this.recipe.yieldQuantity) * this.tempYieldQuantity * 100
    //       ) / 100
    //     );
    //     let lUnit = localize(unit);

    //     switch (unit) {
    //       //IMPERIAL
    //       case "g":
    //         return rounded < 1000
    //           ? `${rounded} ${lUnit} `
    //           : `${roundedQ(rounded / 1000)} ${localize("kg")} `;
    //       case "ml":
    //         return rounded < 1000
    //           ? `${rounded} ${lUnit} `
    //           : `${roundedQ(rounded / 1000)} ${localize("l")} `;

    //       //METRIC
    //       case "tsp":
    //         return rounded < 3
    //           ? `${rounded} ${lUnit} `
    //           : `${roundedQ(rounded / 3)} ${localize("tbsp")} `;
    //       case "in":
    //         return rounded < 12
    //           ? `${rounded} ${lUnit} `
    //           : `${roundedQ(rounded / 12)} ${localize("ft")} `;
    //       default:
    //         return `${rounded} ${lUnit} `;
    //     }
    //   } else return "";
    // },
    roundedQuantity(quantity: number) {
      return Math.abs(
        Math.round(
          (quantity / this.recipe.yieldQuantity) * this.tempYieldQuantity * 100
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
      // this.overwriteRecipeAction({
      //   id: this.currentRecipeID,
      //   recipe: this.recipe,
      // });
    },
    touchIngredient({ object, action }, index) {
      object.className = action.match(/down|move/)
        ? "ingredient fade"
        : "ingredient";
      if (action == "up") this.checkChange(object, index);
    },
    checkChange(obj, index) {
      this.checks[index] = !this.checks[index];
      if (this.checks[index]) {
        this.checked++;
        obj.getChildAt(0).text = this.icon.check;
      } else {
        this.checked--;
        obj.getChildAt(0).text = this.icon.uncheck;
      }
    },
    clearChecks() {
      this.checked = 0;
      this.checks = [];
      for (let i = 1; i < this.ingcon.getChildrenCount(); i++) {
        this.ingcon.getChildAt(i).getChildAt(0).text = this.icon.uncheck;
      }
    },
    touchInstruction({ object, action }) {
      let hasDone = object.className.includes("done");
      object.className = action.match(/down|move/)
        ? `instruction ${hasDone ? "done" : "fade"}`
        : `instruction ${hasDone ? "done" : ""}`;
      if (action == "up") this.stepDone(object);
    },
    stepDone(object) {
      let a = object;
      if (a.className.includes("done")) {
        a.className = "instruction";
        this.stepsDid--;
      } else {
        a.className = "instruction done";
        this.stepsDid++;
      }
    },
    clearSteps() {
      this.stepsDid = 0;
      for (let i = 1; i < this.inscon.getChildrenCount(); i++) {
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
      this.showTitleArr = new Array(4).fill(false);
      this.clearChecks();
      this.clearSteps();
      this.recipe.ingredients.forEach(() => this.checks.push(false));
      this.currentRecipeID = combination;
      this.syncCombinations();
      this.createNotes();
      this.yieldMultiplier = this.recipe.yieldQuantity;
      this.recipe.tried && this.recipe.lastTried && this.showLastTried();
    },

    // SHARE ACTION
    shareHandler() {
      if (this.recipe.image) {
        this.$showModal(Action, {
          props: {
            title: "shr",
            list: ["rec", "pht"],
          },
        }).then((result) => {
          switch (result) {
            case "rec":
              this.shareRecipe();
              break;
            case "pht":
              ImageSource.fromFile(this.recipe.image).then((res) =>
                utils.shareImage(res, localize("srpu"))
              );
              break;
          }
        });
      } else {
        this.shareRecipe();
      }
    },
    shareRecipe() {
      let overview = `${this.recipe.title}\n\n`;
      if (this.recipe.rating)
        overview += `${localize("stars")}: ${this.recipe.rating}\n`;
      overview += `${localize("cui")}: ${localize(
        this.recipe.cuisine
      )}\n${localize("cat")}: ${localize(this.recipe.category)}\n`;
      if (this.recipe.tags.length)
        overview += `${localize("ts")}: ${this.recipe.tags.join(", ")}\n`;
      if (this.recipe.prepTime != "00:00")
        overview += `${localize("prepT")}: ${this.formattedTime(
          this.recipe.prepTime
        )}\n`;
      if (this.recipe.cookTime != "00:00")
        overview += `${localize("cookT")}: ${this.formattedTime(
          this.recipe.cookTime
        )}\n`;
      overview += `${localize("yld")}: ${this.tempYieldQuantity} ${localize(
        this.recipe.yieldUnit
      )}\n${localize("Difficulty level")}: ${localize(
        this.recipe.difficulty
      )}\n`;

      let shareContent = overview;
      if (this.recipe.ingredients.length) {
        let ingredients = `\n\n${localize("ings")}:\n\n`;
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
        let instructions = `\n\n${localize("inss")}:\n\n`;
        this.recipe.instructions.forEach((e, i) => {
          instructions += `${i + 1}. ${e}\n\n`;
        });
        shareContent += instructions;
      }
      if (this.recipe.combinations.length) {
        let combinations = `\n${localize("cmbs")}:\n\n`;
        this.recipe.combinations.forEach((e, i) => {
          combinations += `${i + 1}. ${this.getCombinationTitle(e)}\n\n`;
        });
        shareContent += combinations;
      }
      if (this.recipe.notes.length) {
        let notes = `\n${localize("nos")}:\n\n`;
        this.recipe.notes.forEach((e, i) => {
          notes += `${i + 1}. ${e}\n\n`;
        });
        shareContent += notes;
      }
      let sharenote = "\n" + localize("appCrd");
      shareContent += sharenote;
      utils.shareText(shareContent, localize("sru"));
    },

    // DATA HANDLERS
    toggle(key: string, setDate: boolean) {
      this.toggleStateAction({
        id: this.currentRecipeID,
        key,
        setDate,
      });
      if (setDate) this.$navigateBack();
    },
    setRating(rating) {
      if (rating !== this.recipe.rating || rating === 1) {
        this.setRatingAction({
          id: this.currentRecipeID,
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
      });
    },

    // NOTES
    createNote(note) {
      let regex = /(https?:\/\/[^\s]+)/g;
      const lbl = new Label();
      lbl.className = "note";
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
    hijackBackEvent() {
      Application.android.on(
        AndroidApplication.activityBackPressedEvent,
        this.backEvent
      );
    },
    releaseBackEvent() {
      Application.android.off(
        AndroidApplication.activityBackPressedEvent,
        this.backEvent
      );
    },
    backEvent(args) {
      if (this.photoOpen) {
        args.cancel = true;
        this.closePhoto();
      } else this.$navigateBack();
    },
    viewPhoto() {
      this.photoOpen = true;
      this.hijackBackEvent();
      let pv = this.imgView;
      pv.visibility = "visible";
      let sw = Screen.mainScreen.widthDIPs;
      let sh = Screen.mainScreen.heightDIPs;
      pv.animate({
        opacity: 1,
        duration: 50,
      })
        .then(() =>
          pv.animate({
            width: sw,
            height: sw,
            translate: { x: 112 - sw, y: (sh - sw) / 3 },
            duration: 250,
            curve: CoreTypes.AnimationCurve.ease,
          })
        )
        .then(() =>
          pv.animate({
            height: sh,
            translate: { x: -sw + 112, y: -((sh - sw) / 6) },
            duration: 250,
            curve: CoreTypes.AnimationCurve.ease,
          })
        );
    },
    closePhoto() {
      let pv = this.imgView;
      let sw = Screen.mainScreen.widthDIPs;
      let sh = Screen.mainScreen.heightDIPs;
      pv.animate({
        width: sw,
        height: sw,
        translate: { x: 112 - sw, y: (sh - sw) / 3 },
        duration: 250,
        curve: CoreTypes.AnimationCurve.ease,
      })
        .then(() =>
          pv.animate({
            width: 96,
            height: 96,
            translate: { x: 0, y: 0 },
            duration: 250,
            curve: CoreTypes.AnimationCurve.ease,
          })
        )
        .then(() =>
          pv.animate({
            opacity: 0,
            duration: 50,
          })
        )
        .then(() => {
          pv.visibility = "collapsed";
          this.photoOpen = false;
          this.releaseBackEvent();
        });
    },
    navigateBack() {
      this.photoOpen ? this.closePhoto() : this.$navigateBack();
    },

    //TIMERS
    openCookingTimer() {
      this.$navigateTo(CookingTimer, {
        props: {
          recipeID: this.recipe.id,
        },
      });
    },
    //HELPERS
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
    this.yieldMultiplier = this.recipe.yieldQuantity;
    this.recipe.tried && this.recipe.lastTried && this.showLastTried();
  },
};
</script>
