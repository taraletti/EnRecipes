<template>
  <Page @loaded="pageL" @unloaded="pageUL" actionBarHidden="true">
    <GridLayout rows="*, auto, auto" columns="auto, *, auto">
      <DockLayout stretchLastChild="true" rowSpan="3" colSpan="3">
        <RGridLayout
          :rtl="RTL"
          dock="top"
          rows="auto,auto"
          columns="*, auto"
          paddingBottom="24"
        >
          <StackLayout>
            <RLabel
              class="pTitle tw tb"
              paddingBottom="8"
              :text="recipe.title"
            />
            <StackLayout
              :class="{ f: RTL }"
              margin="0 12"
              orientation="horizontal"
            >
              <Button
                class="ico rate"
                :class="{ rated: recipe.rating >= n }"
                v-for="n in 5"
                :key="n"
                :text="recipe.rating < n ? icon.star : icon.starred"
                @touch="touchRate($event, n)"
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
        </RGridLayout>
        <AbsoluteLayout dock="bottom">
          <ScrollView
            dock="bottom"
            width="100%"
            height="100%"
            @loaded="scrollvL"
            @scroll="scrollvS($event)"
          >
            <StackLayout>
              <RGridLayout :rtl="RTL" rows="auto" columns="*, *">
                <StackLayout class="attrT">
                  <RLabel class="sub" :text="'cui' | L" />
                  <RLabel class="v" :text="recipe.cuisine | L" />
                </StackLayout>
                <StackLayout class="attrT" col="1">
                  <RLabel class="sub" :text="'cat' | L" />
                  <RLabel class="v" :text="recipe.category | L" />
                </StackLayout>
              </RGridLayout>
              <StackLayout
                :hidden="!recipe.tags.length"
                class="attrT hal"
                :class="{ r: RTL }"
              >
                <RLabel class="sub" :text="'ts' | L" />
                <RLabel class="v" :text="getTags" />
              </StackLayout>
              <RGridLayout :rtl="RTL" rows="auto" columns="*, *">
                <StackLayout class="attrT" :hidden="!hasTime(recipe.prepTime)">
                  <RLabel class="sub" :text="'prepT' | L" />
                  <RLabel class="v" :text="niceTime(recipe.prepTime)" />
                </StackLayout>
                <StackLayout
                  :col="hasTime(recipe.prepTime) ? 1 : 0"
                  class="attrT"
                  :hidden="!hasTime(recipe.cookTime)"
                >
                  <RLabel class="title sub" :text="'cookT' | L" />
                  <RLabel class="v" :text="niceTime(recipe.cookTime)" />
                </StackLayout>
              </RGridLayout>
              <RGridLayout :rtl="RTL" rows="auto" columns="*, *">
                <StackLayout class="attrT">
                  <RLabel class="title sub" :text="'yld' | L" />
                  <RLabel
                    @touch="touchYield"
                    class="v accent"
                    :text="`${tempYieldQuantity} ${$options.filters.L(
                      recipe.yieldUnit
                    )}`"
                  />
                </StackLayout>
                <StackLayout class="attrT" col="1">
                  <RLabel class="title sub" :text="'Difficulty level' | L" />
                  <RLabel class="v" :text="recipe.difficulty | L" />
                </StackLayout>
              </RGridLayout>
              <StackLayout @loaded="ingCL">
                <RLabel
                  class="section t2 tb tw"
                  :hidden="!recipe.ingredients.length"
                  :text="getTitleCount('ings', 'ingredients')"
                />
                <RStackLayout
                  :rtl="RTL"
                  orientation="horizontal"
                  v-for="(item, i) in recipe.ingredients"
                  :key="item.key"
                  class="check"
                  @touch="item.type && touchIngredient($event, i)"
                >
                  <Button
                    :hidden="!item.type"
                    class="ico si"
                    :text="icon.uncheck"
                  />
                  <RLabel
                    class="v tw"
                    :class="{ 'tb t t3': !item.type }"
                    :text="getIng(item)"
                  />
                </RStackLayout>
              </StackLayout>
              <StackLayout @loaded="insCL">
                <RLabel
                  :hidden="!recipe.instructions.length"
                  class="section t2 tb tw"
                  :text="getTitleCount('inss', 'instructions')"
                />
                <RStackLayout
                  :rtl="RTL"
                  orientation="horizontal"
                  @touch="item.type && touchInstruction($event)"
                  v-for="(item, i) in recipe.instructions"
                  :key="item.key"
                  class="check"
                >
                  <Button
                    :hidden="!item.type"
                    class="tb t3 ico si"
                    :text="localeN(getInsPos[i])"
                  />
                  <RLabel
                    class="v tw"
                    :class="{ 'tb t t3': !item.type }"
                    :text="item.value"
                  />
                </RStackLayout>
              </StackLayout>
              <RLabel
                @loaded="cmbCL"
                :hidden="!recipe.combinations.length"
                class="section t2 tb tw"
                :text="getTitleCount('cmbs', 'combinations')"
              />
              <Button
                v-for="(combination, index) in recipe.combinations"
                :key="index + 'comb'"
                class="note tw hal lh4 fb"
                :class="{ r: RTL }"
                :text="getCombinationTitle(combination)"
                @tap="viewCombination(combination)"
              />
              <RLabel
                @loaded="notesCTL"
                :hidden="!recipe.notes.length"
                class="section t2 tb tw"
                :text="getTitleCount('nos', 'notes')"
              />
              <StackLayout @loaded="notesCL"> </StackLayout>
              <Label
                padding="32 16 16"
                class="lh4 t5 sub tw"
                :text="getDates.uc"
              />
            </StackLayout>
          </ScrollView>
          <RLabel
            class="t2 tb tw sticky"
            :hidden="!stickyTitle"
            :text="stickyTitle"
          />
        </AbsoluteLayout>
      </DockLayout>
      <GridLayout
        row="1"
        @loaded="sidebarL"
        class="appbar toolbar"
        :col="RTL ? 0 : 2"
        rows="auto, auto, auto, auto"
        :visibility="showTools ? 'visible' : 'hidden'"
      >
        <Button class="ico" :text="icon.timer" @tap="openCookingTimer" />
        <Button
          row="1"
          :hidden="busyDup"
          class="ico"
          :class="{ f: RTL }"
          :text="icon.dup"
          @tap="duplicateRecipe"
        />
        <ActivityIndicator row="1" :hidden="!busyDup" :busy="busyDup" />
        <Button
          :hidden="!hasPrinterSupport"
          row="2"
          class="ico"
          :text="icon.print"
          @tap="printView"
        />
        <Button row="3" class="ico" :text="icon.share" @tap="shareHandler" />
      </GridLayout>
      <RGridLayout
        :rtl="RTL"
        row="2"
        colSpan="3"
        @loaded="appbarL"
        class="appbar"
        :hidden="toast"
        columns="auto, *, auto, auto, auto, auto"
        @touch="() => null"
      >
        <Button class="ico rtl" :text="icon.back" @tap="$navigateBack()" />
        <Button
          col="2"
          v-if="!filterTrylater"
          class="ico"
          :text="recipe.tried ? icon.try : icon.tried"
          @tap="toggle('tried')"
        />
        <Button
          col="2"
          v-else
          class="ico"
          :text="recipeTried ? icon.try : icon.done"
          @tap="toggle('tried', 1)"
        />
        <Button
          col="3"
          class="ico"
          :text="recipe.favorite ? icon.faved : icon.fav"
          @tap="toggle('favorite')"
        />
        <Button
          col="4"
          :hidden="busyEdit"
          class="ico"
          :text="icon.edit"
          @tap="editRecipe"
        />
        <ActivityIndicator col="4" :hidden="!busyEdit" :busy="busyEdit" />
        <Button
          col="5"
          class="ico"
          :text="showTools ? icon.less : icon.more"
          @tap="toggleTools"
        />
      </RGridLayout>
      <Toast
        row="2"
        colSpan="3"
        :onload="toastL"
        :toast="toast"
        :action="hideBar"
      />
      <AbsoluteLayout rowSpan="3" colSpan="3">
        <Image
          @tap="closePhoto"
          backgroundColor="black"
          stretch="aspectFit"
          @loaded="imgVLoad"
          :src="recipe.image"
          class="imgV"
        />
      </AbsoluteLayout>
      <WebView @loaded="wvLoad" hidden />
      <Label
        rowSpan="3"
        colSpan="3"
        class="edge hal"
        :class="{ 'f r': RTL }"
        @swipe="swipeBack"
      />
      <Label
        rowSpan="3"
        colSpan="3"
        class="edge har rtl f"
        @swipe="swipeBack"
      />
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
  Observable,
  Screen,
  CoreTypes,
  WebView,
} from "@nativescript/core";
import { RLabel } from "~/rtl-ui";
import { localize } from "@nativescript/localize";
import { mapActions, mapState } from "vuex";
import CookingTimer from "./CookingTimer.vue";
import EditRecipe from "./EditRecipe.vue";
import Action from "./modals/Action.vue";
import Toast from "./sub/Toast.vue";
import Prompt from "./modals/Prompt.vue";
import * as utils from "~/shared/utils";
const Intl = require("nativescript-intl");
let barTimer;
declare const android: any;
export default {
  components: { Toast },
  props: ["filterTrylater", "recipeID", "yieldQuantity"],
  data() {
    return {
      busyEdit: 0,
      busyDup: 0,
      yieldMultiplier: 1,
      recipe: null,
      currentRecipeID: this.recipeID,
      scrollview: null,
      appbar: null,
      sidebar: null,
      toastbar: null,
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
      photoOpen: 0,
      showTitleArr: [0, 0, 0, 0],
      view: null,
      wv: null,
      showTools: 0,
      snackMsg: null,
      recipeTried: 0,
    };
  },
  computed: {
    ...mapState(["icon", "recipes", "RTL", "awakeV", "mSystem"]),
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
    hasPrinterSupport() {
      return utils.Printer.isSupported();
    },
    getTags() {
      return this.recipe.tags.join(" · ");
    },
    getDates() {
      let r = this.recipe;
      let u = `${localize("Last updated")}: ${this.intlDate(r.lastModified)}`;
      let c = `${localize("Created")}: ${this.intlDate(r.created)}`;
      return {
        u,
        c,
        uc: u + "\n" + c,
      };
    },
    getInsPos() {
      let a = 1;
      let b = 1;
      let ins = this.recipe.instructions;
      return ins.reduce((acc, e) => {
        if (!e.type) {
          a = 1;
          acc.push(b++);
        } else acc.push(a++);
        return acc;
      }, []);
    },
  },
  methods: {
    ...mapActions(["toggleState", "setR"]),
    pageL({ object }) {
      this.busyDup = this.busyEdit = this.photoOpen = 0;
      object.bindingContext = new Observable();
      if (this.yieldMultiplier == this.recipe.yieldQuantity)
        this.yieldMultiplier = this.recipe.yieldQuantity;
      if (this.awakeV) utils.keepScreenOn(1);
      this.syncCombinations();
      this.view = object.page.getViewById("printview");
    },
    pageUL() {
      utils.keepScreenOn(0);
      if (this.recipeTried) this.markTried();
    },
    sidebarL({ object }) {
      this.sidebar = object;
    },
    appbarL({ object }) {
      this.appbar = object;
    },
    toastL({ object }) {
      this.toastbar = object;
      this.recipe.lastTried && this.showLastTried();
    },
    ingCL({ object }) {
      this.ingcon = object;
    },
    insCL({ object }) {
      this.inscon = object;
    },
    cmbCL({ object }) {
      this.cmbcon = object;
    },
    notesCL({ object }) {
      this.notescon = object;
      this.createNotes();
    },
    notesCTL({ object }) {
      this.notesT = object;
    },

    // ScrollView
    scrollvL(args) {
      this.scrollview = args.object;
    },
    scrollvS({ object, scrollY }) {
      let swipeUp: boolean;
      let y = scrollY;
      if (y) {
        swipeUp = y > this.scrollPos;
        this.scrollPos = Math.abs(y);
        this.fixTitle(object, swipeUp);
        if (!this.toast) {
          let ab = this.appbar.translateY;
          if (swipeUp && ab == 0) this.hideBars();
          else if (!swipeUp && ab == 64) this.showBars();
        }
      }
    },
    fixTitle(object, swipeUp: boolean) {
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

    // AppBars
    showBars() {
      this.animateBar(this.appbar, 1);
    },
    hideBar() {
      clearInterval(barTimer);
      this.animateBar(this.toastbar, 0).then(() => {
        this.toast = null;
        this.photoOpen
          ? (this.appbar.opacity = 1)
          : this.animateBar(this.appbar, 1);
      });
    },
    hideBars() {
      this.showTools && this.toggleTools();
      this.animateBar(this.appbar, 0);
    },
    showLastTried() {
      this.animateBar(this.appbar, 0).then(() => {
        this.toast = localize(
          "triedInfo",
          this.niceDate(this.recipe.lastTried)
        );
        this.animateBar(this.toastbar, 1, 1);
        let a = 10;
        clearInterval(barTimer);
        barTimer = setInterval(() => a-- < 1 && this.hideBar(), 1000);
      });
    },

    // Helpers
    getTitleCount(title, type, unsel) {
      let c;
      let s = null;
      switch (title) {
        case "ings":
          s = this.checked;
          c = this.recipe[type].filter((e) => e.type).length;
          break;
        case "inss":
          s = this.stepsDid;
          c = this.recipe[type].filter((e) => e.type).length;
          break;
        default:
          c = this.recipe[type].length;
          break;
      }
      c = this.localeN(c);
      s = s && this.localeN(s);
      let text = s && !unsel ? ` (${s}/${c})` : ` (${c})`;
      return localize(title) + text;
    },
    getIng(o) {
      let q = o.quantity;
      return `${q ? this.scaleUnit(q, o.unit) : ""}${o.value}`;
    },
    roundQ(q: number) {
      return Math.abs(
        Math.round(
          (q / this.recipe.yieldQuantity) * this.tempYieldQuantity * 100
        ) / 100
      );
    },
    metric(q, u) {
      switch (u) {
        case "mg":
          if (q / 1000 >= 1) {
            q = q / 1000;
            u = "g";
          }
        case "g":
          if (q / 1000 >= 1) {
            q = q / 1000;
            u = "kg";
          }
          break;
        case "ml":
          if (q / 1000 >= 1) {
            q = q / 1000;
            u = "l";
          }
          break;
        case "pinch":
          if (q / 16 >= 1) {
            q = q / 16;
            u = "tsp";
          }
        case "tsp":
          if (q / 3 >= 1) {
            q = q / 3;
            u = "tbsp";
          }
        case "tbsp":
          if (q / 16 >= 1) {
            q = q / 16;
            u = "cup";
          }
          break;
        case "cup":
          if (q / 4.16 >= 1) {
            q = q / 4.16;
            u = "l";
          }
          break;
      }
      return { q, u };
    },
    imperial(q, u) {
      switch (u) {
        case "pinch":
          if (q / 16 >= 1) {
            q = q / 16;
            u = "tsp";
          }
        case "tsp":
          if (q / 3 >= 1) {
            q = q / 3;
            u = "tbsp";
          } else if (q / 2 >= 1) {
            q = q / 2;
            u = "dsp";
          }
        case "dsp":
          if (q / 1.5 >= 1) {
            q = q / 1.5;
            u = "tbsp";
          }
        case "tbsp":
          if (q / 16 >= 1) {
            q = q / 16;
            u = "cup";
          }
          break;
        case "fl oz":
          if (q / 8 >= 1) {
            q = q / 8;
            u = "cup";
          }
          break;
        case "cup":
          if (q / 16 >= 1) {
            q = q / 16;
            u = "gal";
          } else if (q / 4 >= 1) {
            q = q / 4;
            u = "qt";
          } else if (q / 2 >= 1) {
            q = q / 2;
            u = "pt";
          }
        case "oz":
          if (q / 16 >= 1) {
            q = q / 16;
            u = "lb";
          }
        case "pt":
          if (q / 2 >= 1) {
            q = q / 2;
            u = "qt";
          }
        case "qt":
          if (q / 4 >= 1) {
            q = q / 4;
            u = "gal";
          }
      }
      return { q, u };
    },
    fraction(num) {
      let arr = [0, 0.125, 0.25, 0.333, 0.375, 0.5, 0.666, 0.75, 0.875, 1];
      let brr = [0, "⅛", "¼", "⅓", "⅜", "½", "⅔", "¾", "⅞", 1];
      let dec = Math.trunc(num);
      let n = Number((num - Math.floor(num)).toFixed(2));
      let closest = arr.reduce((acc, e) =>
        Math.abs(e - n) < Math.abs(acc - n) ? e : acc
      );
      let f = brr[arr.indexOf(closest)];
      return f == 0 ? num : f == 1 ? dec + 1 : (dec ? dec + " " : "") + f;
    },
    scaleUnit(quantity, unit) {
      quantity =
        (quantity / this.recipe.yieldQuantity) * this.tempYieldQuantity;
      let { q, u } =
        this.mSystem == "mtrc"
          ? this.metric(quantity, unit)
          : this.imperial(quantity, unit);
      let rounded = Math.abs(Math.round(q * 100) / 100);
      if (true) {
        rounded = this.fraction(rounded);
      }
      return `${rounded} ${localize(u)} `;
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
    niceTime(time) {
      let t = time.split(":");
      let h = parseInt(t[0]);
      let m = parseInt(t[1]);
      let hr = localize("hr");
      let min = localize("min");
      return h ? (m ? `${h} ${hr} ${m} ${min}` : `${h} ${hr}`) : `${m} ${min}`;
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
    intlDate(date) {
      return new Intl.DateTimeFormat(null, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(date));
    },

    // NavigationHandlers
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
      args.cancel = true;
      this.closePhoto();
    },
    editRecipe() {
      this.busyEdit = 1;
      this.$navigateTo(EditRecipe, {
        props: {
          filterTrylater: this.filterTrylater,
          recipeID: this.currentRecipeID,
        },
        animated: false,
      });
    },

    // Combinations
    getCombinationTitle(id) {
      return this.recipes.filter((e) => e.id === id)[0].title;
    },
    syncCombinations() {
      this.recipe.combinations = this.recipes
        .filter(
          (e) =>
            e.combinations.indexOf(this.currentRecipeID) >= 0 ||
            this.recipe.combinations.includes(e.id)
        )
        .map((e) => e.id);
    },
    viewCombination(combination) {
      this.hideBar();
      this.scrollview.scrollToVerticalOffset(0, true);
      this.recipe = this.recipes.filter((e) => e.id === combination)[0];
      this.showTitleArr = new Array(4).fill(0);
      this.clearChecks();
      this.clearSteps();
      this.recipe.ingredients.forEach(() => this.checks.push(0));
      this.currentRecipeID = combination;
      this.syncCombinations();
      this.createNotes();
      this.yieldMultiplier = this.recipe.yieldQuantity;
      this.recipe.lastTried && this.showLastTried();
    },

    // Tools
    toggleTools() {
      if (this.showTools) {
        this.sidebar
          .animate({
            height: 0,
            translate: { x: 0, y: 48 },
            duration: 200,
            curve: CoreTypes.AnimationCurve.easeIn,
          })
          .then(() => (this.showTools = 0));
      } else {
        this.sidebar.height = 1;
        this.showTools = 1;
        setTimeout(() => {
          this.sidebar.animate({
            height: 216,
            duration: 200,
            translate: { x: 0, y: 0 },
            curve: CoreTypes.AnimationCurve.easeOut,
          });
        }, 1);
      }
    },

    // ShareAction
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
                utils.shareImage(res, localize("srpu"), this.recipe.title)
              );
              break;
          }
        });
      } else {
        this.shareRecipe();
      }
    },
    shareRecipe() {
      let r = this.recipe;
      let overview = `${r.title}\n\n`;
      if (r.rating) overview += `${localize("stars")}: ${r.rating}\n`;
      overview += `${localize("cui")}: ${localize(r.cuisine)}\n${localize(
        "cat"
      )}: ${localize(r.category)}\n`;
      if (r.tags.length)
        overview += `${localize("ts")}: ${r.tags.join(", ")}\n`;
      if (r.prepTime != "00:00")
        overview += `${localize("prepT")}: ${this.niceTime(r.prepTime)}\n`;
      if (r.cookTime != "00:00")
        overview += `${localize("cookT")}: ${this.niceTime(r.cookTime)}\n`;
      overview += `${localize("yld")}: ${this.tempYieldQuantity} ${localize(
        r.yieldUnit
      )}\n${localize("Difficulty level")}: ${localize(r.difficulty)}\n`;

      let shareContent = overview;
      if (r.ingredients.length) {
        let ingredients = `\n\n${localize("ings")}:\n\n`;
        r.ingredients.forEach((e) => {
          if (e.type) {
            ingredients += `- ${
              e.quantity
                ? this.roundQ(e.quantity) + " " + localize(e.unit) + " "
                : ""
            }${e.value}\n`;
          } else {
            ingredients += `\n${
              e.quantity
                ? this.roundQ(e.quantity) + " " + localize(e.unit) + " "
                : ""
            }${e.value}\n\n`;
          }
        });
        shareContent += ingredients;
      }
      let ins = r.instructions;
      if (ins.length) {
        let a = 1;
        let b = 1;
        let group = ins.reduce((acc, e) => {
          if (!e.type) {
            a = 1;
            acc.push(b++);
          } else acc.push(a++);
          return acc;
        }, []);
        let instructions = `\n\n${localize("inss")}:\n\n`;
        ins.forEach(
          (e, i) =>
            (instructions += (e.type ? group[i] + ". " : "") + `${e.value}\n\n`)
        );
        shareContent += instructions;
      }
      if (r.combinations.length) {
        let combinations = `\n${localize("cmbs")}:\n\n`;
        r.combinations.forEach((e, i) => {
          combinations += `${i + 1}. ${this.getCombinationTitle(e)}\n\n`;
        });
        shareContent += combinations;
      }
      if (r.notes.length) {
        let notes = `\n${localize("nos")}:\n\n`;
        r.notes.forEach((e, i) => {
          notes += `${i + 1}. ${e.value}\n\n`;
        });
        shareContent += notes;
      }
      let sharenote = "\n" + localize("appCrd");
      shareContent += sharenote;
      utils.shareText(shareContent, localize("sru"));
    },

    // Toggles
    toggle(key: string, setDate: number) {
      console.log(setDate);
      if (setDate) {
        this.recipeTried = !this.recipeTried;
      } else
        this.toggleState({
          id: this.currentRecipeID,
          key,
          setDate,
        });
    },
    markTried() {
      this.toggleState({
        id: this.currentRecipeID,
        key: "tried",
        setDate: 1,
      });
    },
    rate(r) {
      if (r !== this.recipe.rating || r === 1) {
        if (this.recipe.rating == 1 && r == 1) r = 0;
        this.setR({
          id: this.currentRecipeID,
          r,
        });
      }
    },
    toggleCheck(obj, index) {
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
    toggleStep(object) {
      let a = object;
      if (a.className.includes("done")) {
        a.className = "check";
        this.stepsDid--;
      } else {
        a.className = "check done";
        this.stepsDid++;
      }
    },
    clearSteps() {
      this.stepsDid = 0;
      for (let i = 1; i < this.inscon.getChildrenCount(); i++) {
        this.inscon.getChildAt(i).className = "check";
      }
    },

    // Notes
    createNote(note) {
      let regex = /(https?:\/\/[^\s]+)/g;
      const lbl = new RLabel();
      lbl.className = "note tw";
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
        stack.addChild(this.createNote(note.value))
      );
    },
    isValidURL(s) {
      let pattern = new RegExp("^https?|^www", "ig");
      return pattern.test(s);
    },

    // PhotoViewer
    imgVLoad({ object }) {
      this.imgView = object;
      this.imgView.visibility = "collapsed";
      this.imgView.top = 24;
      this.imgView.left = this.RTL ? 16 : Screen.mainScreen.widthDIPs - 112;
    },
    viewPhoto() {
      this.hideBars();
      this.photoOpen = 1;
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
            translate: { x: this.RTL ? -16 : 112 - sw, y: (sh - sw) / 3 },
            duration: 200,
          })
        )
        .then(() =>
          pv.animate({
            height: sh,
            translate: { x: this.RTL ? -16 : 112 - sw, y: -((sh - sw) / 6) },
            duration: 200,
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
        translate: { x: this.RTL ? -16 : 112 - sw, y: (sh - sw) / 3 },
        duration: 200,
      })
        .then(() =>
          pv.animate({
            width: 96,
            height: 96,
            translate: { x: 0, y: 0 },
            duration: 200,
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
          this.photoOpen = 0;
          this.releaseBackEvent();
          this.showBars();
        });
    },

    // Timers
    openCookingTimer() {
      this.$navigateTo(CookingTimer, {
        props: {
          recipeID: this.recipe.id,
        },
        animated: false,
      });
    },

    // Duplicate
    duplicateRecipe() {
      this.busyDup = 1;
      let dupRecipe = Object.assign({}, this.recipe);
      dupRecipe.id = utils.getRandomID(0);
      dupRecipe.title = dupRecipe.title + " " + localize("cpy");
      this.$navigateTo(EditRecipe, {
        props: {
          dupRecipe,
        },
        animated: false,
      });
    },

    // Print
    wvLoad({ object }) {
      this.wv = object;
      utils.updateLocale(); // required to set local RTL and language in webview
    },
    prepareHTML() {
      let r = this.recipe;
      const head = `<head><meta charset=UTF-8><meta content="IE=edge"http-equiv=X-UA-Compatible><meta content="width=device-width,initial-scale=1"name=viewport><title>EnRecipes - Recipe for Print</title><style>a,body,div,html,img,ol,p,span,ul{border:0;font-size:100%;font:inherit;margin:0;padding:0;vertical-align:baseline}@font-face{font-family:Inter-Medium;src:url(../app/fonts/Inter-Medium.otf)}@font-face{font-family:Inter-Bold;src:url(../app/fonts/Inter-Bold.otf)}body{font-family:Inter-Medium,sans-serif;line-height:1.5;max-width:45rem;padding:1.5rem}body>p{padding:.5rem 0}.attr>div>p:last-child,h1,h2,h3{font-family:Inter-Bold,sans-serif}#header{display:grid;grid-column-gap:2rem;grid-template-columns:1fr auto;margin-bottom:2.5rem;width:100%}img{border-radius:1rem;height:8rem;object-fit:cover;width:8rem}h1{font-size:2.25rem;line-height:1.25;margin:0;padding-bottom:1rem}svg{width:2rem;height:2rem;padding:0 .5rem 0 0}h2{margin:2rem 0 1rem}.attr{display:grid;grid-column-gap:2rem;grid-template-columns:1fr 1fr;margin-top:1rem}.attr>div>p:first-child{font-size:.9rem;opacity:.5}ol,ul{padding:0 1.5rem}li{padding:.5rem}a{color:inherit}.sub{font-size:.9rem;margin-top:2rem;opacity:.5}</style></head>`;
      const getStarRating = () => {
        let rate = `<svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2"><path d="M10.756 2.826 8.419 7.98l-5.624.63c-.533.06-.982.425-1.147.935-.166.51-.018 1.07.378 1.431l4.179 3.816-1.138 5.543c-.108.525.101 1.065.535 1.38.434.315 1.012.348 1.478.083L12 19.002l4.92 2.796c.466.265 1.044.232 1.478-.083.434-.315.643-.855.535-1.38l-1.138-5.543 4.179-3.816c.396-.361.544-.921.378-1.431-.165-.51-.614-.875-1.147-.935l-5.624-.63-2.337-5.154c-.221-.489-.708-.802-1.244-.802s-1.023.313-1.244.802z"/></svg>`;
        let unrate = `<svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2"><path d="M10.756 2.826 8.419 7.98l-5.624.63c-.533.06-.982.425-1.147.935-.166.51-.018 1.07.378 1.431l4.179 3.816-1.138 5.543c-.108.525.101 1.065.535 1.38.434.315 1.012.348 1.478.083L12 19.002l4.92 2.796c.466.265 1.044.232 1.478-.083.434-.315.643-.855.535-1.38l-1.138-5.543 4.179-3.816c.396-.361.544-.921.378-1.431-.165-.51-.614-.875-1.147-.935l-5.624-.63-2.337-5.154c-.221-.489-.708-.802-1.244-.802s-1.023.313-1.244.802zM12 4.925l1.994 4.398c.146.321.45.542.8.581l4.799.538-3.567 3.256c-.26.237-.376.594-.305.94l.972 4.73-4.199-2.386c-.306-.174-.682-.174-.988.0l-4.199 2.386.972-4.73c.071-.346-.045-.703-.305-.94l-3.567-3.256 4.799-.538c.35-.039.654-.26.8-.581L12 4.925z"/></svg>`;
        return rate.repeat(r.rating) + unrate.repeat(5 - r.rating);
      };
      const img = r.image ? `<img src="${r.image}" alt="${r.title}" />` : "";
      const getIngs = () => {
        let ings = r.ingredients;
        return ings
          .map((e, i) => {
            if (!e.type)
              return `${i > 0 ? "</ul>" : ""}<h3>${e.value}</h3>${
                i < ings.length - 1 ? "<ul>" : ""
              }`;
            else
              return `${i < 1 ? "<ul>" : ""}<li>${this.getIng(e)}</li>${
                i == ings.length - 1 ? "</ul>" : ""
              }`;
          })
          .join("");
      };
      const getIns = () => {
        let inss = r.instructions;
        return r.instructions
          .map((e, i) => {
            if (!e.type)
              return `${i > 0 ? "</ol>" : ""}<h3>${e.value}</h3>${
                i < inss.length - 1 ? "<ol>" : ""
              }`;
            else
              return `${i < 1 ? "<ol>" : ""}<li>${e.value}</li>${
                i == inss.length - 1 ? "</ol>" : ""
              }`;
          })
          .join("");
      };
      const getCmbs = () => {
        let cmb = [];
        r.combinations.forEach((e) => {
          cmb.push(`<p>${this.getCombinationTitle(e)}</p>`);
        });
        return cmb.join("");
      };
      const getNotes = () => {
        let regex = /(https?:\/\/[^\s]+)/g;
        let n = [];
        const createSpan = (val, isUrl) => {
          return isUrl
            ? `<a href="${val}" target="_blank" rel="noopener noreferrer">${val}</a>`
            : val;
        };
        r.notes.forEach((e) => {
          let arr = e.value.split(regex);
          let single = [];
          arr.forEach((f) => {
            single.push(createSpan(f, regex.test(f)));
          });
          n.push(`<p>${single.join("")}</p>`);
        });
        return n.join("");
      };
      return `<html dir="${
        this.RTL ? "rtl" : "ltr"
      }">${head}<body><div id=header><div class=title><h1>${
        r.title
      }</h1><div class=rating>${getStarRating()}</div></div>${img}</div><div class=attr><div><p>${localize(
        "cui"
      )}<p>${r.cuisine}</div><div><p>${localize("cat")}<p>${
        r.category
      }</div></div>${
        r.tags.length
          ? `<div class=attr><div style="grid-column:span 2"><p>${localize(
              "ts"
            )}<p>${this.getTags}</div></div>`
          : ""
      } ${
        this.hasTime(r.prepTime) || this.hasTime(r.cookTime)
          ? `<div class=attr>${
              this.hasTime(r.prepTime)
                ? `<div><p>${localize("prepT")}<p>${this.niceTime(
                    r.prepTime
                  )}</div>`
                : ""
            } ${
              this.hasTime(r.cookTime)
                ? `<div><p>${localize("cookT")}<p>${this.niceTime(
                    r.cookTime
                  )}</div>`
                : ""
            }</div>`
          : ""
      }<div class=attr><div><p>${localize("yld")}<p>${
        this.tempYieldQuantity
      } ${localize(r.yieldUnit)}</div><div><p>${localize(
        "Difficulty level"
      )}<p>${r.difficulty}</div></div>${
        r.ingredients.length
          ? `<h2>${this.getTitleCount("ings", "ingredients", 1)}</h2>`
          : ""
      }${getIngs()}${
        r.instructions.length
          ? `<h2>${this.getTitleCount("inss", "instructions", 1)}</h2>`
          : ""
      }${getIns()}${
        r.combinations.length
          ? `<h2>${this.getTitleCount("cmbs", "combinations", 1)}</h2>`
          : ""
      } ${getCmbs()} ${
        r.notes.length
          ? `<h2>${this.getTitleCount("nos", "notes", 1)}</h2>`
          : ""
      } ${getNotes()}<div class=sub><p>${this.getDates.u}</p><p>${
        this.getDates.c
      }</p></div>
  </body>
</html>`;
    },
    printView() {
      let wv = this.wv as WebView;
      const fileName = `${this.recipe.title} - ${localize("EnRecipes")}`;
      wv.src = this.prepareHTML();
      wv.once("loadFinished", () =>
        utils.Printer.print(wv, fileName).then(() => (wv.src = null))
      );
    },

    // FeedBack
    touchRate({ object, action }, r) {
      this.touchFade(object, action);
      if (action == "up") this.rate(r);
    },
    touchYield({ object, action }) {
      this.touchFade(object, action);

      if (action == "up") this.changeYield();
    },
    touchIngredient({ object, action }, index) {
      this.touchFade(object, action);
      if (action == "up") this.toggleCheck(object, index);
    },
    touchInstruction({ object, action }) {
      let hasDone = object.className.includes("done");
      if (!hasDone) this.touchFade(object, action);
      if (action == "up") this.toggleStep(object);
    },
  },
  created() {
    this.recipe = this.recipes.filter((e) => e.id === this.currentRecipeID)[0];
    this.recipe.ingredients.forEach((e) => this.checks.push(0));
  },
  mounted() {
    this.yieldMultiplier = this.yieldQuantity || this.recipe.yieldQuantity;
  },
};
</script>
