<template>
  <Page @loaded="pgLoad" actionBarHidden="true">
    <GridLayout rows="*, auto, 72" columns="*">
      <ScrollView
        @scroll="!edit && svScroll($event)"
        rowSpan="3"
        scrollBarIndicatorVisible="false"
      >
        <StackLayout>
          <RGridLayout :rtl="RTL" columns="*, auto, 12">
            <Label class="pageTitle a" :text="'planner' | L" />
            <Button col="1" class="ico" :text="icon.cog" @tap="navigateTo" />
          </RGridLayout>
          <GridLayout class="monthSwitcher" columns="auto, *, auto">
            <Button class="ico min" :text="icon.left" @tap="navigate(0)" />
            <Label
              class="month"
              @touch="mYPicker"
              col="1"
              :text="formattedDate(0)"
            />
            <Button
              class="ico min"
              col="2"
              :text="icon.right"
              @tap="navigate(1)"
            />
          </GridLayout>
          <RGridLayout
            :rtl="RTL"
            class="calendar"
            columns="*, *, *, *, *, *, *"
            :rows="calRows"
          >
            <Label
              class="dayName sub rtl"
              :class="{ f: RTL }"
              :col="i"
              v-for="(d, i) in getDayNames"
              :key="d + i"
              :text="d | L"
            />
            <Button
              v-for="(cal, i) in getCal"
              :key="i"
              :row="getrow(i)"
              :col="i % 7"
              :class="dayClasses(cal)"
              :text="cal.ld"
              @tap="setDate(cal)"
            />
          </RGridLayout>
          <StackLayout class="plans">
            <RLabel
              v-if="plannerView != 'd' && mealPlans.length"
              class="date tb"
              :text="formattedDate(1)"
              textWrap="true"
            />
            <StackLayout v-for="(meal, i) in mealTypes" :key="'meal' + i">
              <Label
                :hidden="!getRecipes[meal]"
                class="meal tb"
                :class="[meal]"
                :text="meal | L"
              />
              <RGridLayout
                :rtl="RTL"
                v-for="(plan, i) in getRecipes[meal]"
                :key="meal + i"
                class="plan"
                columns="*, auto"
              >
                <RGridLayout
                  :rtl="RTL"
                  class="rtl"
                  :hidden="!plan.recipeID"
                  :columns="noImg ? '*' : '48, *'"
                  @touch="touchRecipe"
                  @tap="viewRecipe(plan.id)"
                >
                  <Image
                    class="imgHolder"
                    verticalAlignment="middle"
                    v-if="!noImg && getRecipeImage(plan.recipeID)"
                    :src="getRecipeImage(plan.recipeID)"
                    stretch="none"
                    decodeWidth="48"
                    decodeHeight="48"
                    loadMode="async"
                  />
                  <Label
                    v-else-if="!noImg && !getRecipeImage(plan.recipeID)"
                    verticalAlignment="middle"
                    class="ico imgHolder"
                    @loaded="centerLabel($event, 17)"
                    width="48"
                    height="48"
                    fontSize="24"
                    :text="icon.img"
                  />
                  <StackLayout class="planContent" col="1">
                    <RLabel
                      class="title"
                      :text="getRecipeTitle(plan.recipeID)"
                    />
                    <RLabel class="attr" :text="getYield(plan.id)" />
                  </StackLayout>
                </RGridLayout>
                <Label
                  class="planContent tw"
                  @loaded="centerLabel($event, 16)"
                  :hidden="!plan.note"
                  :text="plan.note"
                />
                <Button
                  :hidden="!edit"
                  col="1"
                  class="ico min"
                  :text="icon.x"
                  @tap="removeRecipe(plan.id)"
                />
              </RGridLayout>
            </StackLayout>
          </StackLayout>
        </StackLayout>
      </ScrollView>
      <GridLayout rowSpan="2" rows="*, auto" v-if="!mealPlans.length">
        <StackLayout row="1" class="emptyState">
          <RLabel class="title" :text="'ehwmp' | L" />
          <RLabel :text="'plsCrt' | L" />
        </StackLayout>
      </GridLayout>
      <RGridLayout
        :rtl="RTL"
        row="2"
        @loaded="abLoad"
        class="appbar"
        :hidden="showUndo"
        columns="auto, *,  auto, auto, auto"
        @swipe="stSwipe"
      >
        <Button class="ico rtl" :text="icon.back" @tap="navigateBack" />
        <Button
          class="ico"
          :text="icon.tod"
          :hidden="isExactlyToday"
          @tap="goToToday"
          col="2"
        />
        <Button
          :hidden="!hasRecipes"
          class="ico"
          :text="edit ? icon.done : icon.edit"
          @tap="toggleEditMode"
          col="3"
        />
        <!-- <Button
          class="ico"
          :text="hasRecipes ? (edit ? icon.done : icon.edit) : icon.madd"
          @tap="hasRecipes ? toggleEditMode() : randomMealPlan()"
          col="3"
        /> -->
        <Button class="ico fab" :text="icon.plus" @tap="addMealPlan" col="4" />
      </RGridLayout>
      <SnackBar
        row="2"
        :hidden="!showUndo"
        :count="countdown"
        :msg="snackMsg"
        :undo="undoDel"
        :action="hideBar"
        :onload="sbLoad"
      />
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import { Frame, Observable, CoreTypes, Screen } from "@nativescript/core";
import { mapState, mapActions } from "vuex";
import ViewRecipe from "./ViewRecipe.vue";
import EditRecipe from "./EditRecipe.vue";
import EnRecipes from "./EnRecipes.vue";
import MPSettings from "./settings/MPSettings.vue";
import Action from "./modals/Action.vue";
import ActionWithSearch from "./modals/ActionWithSearch.vue";
import Prompt from "./modals/Prompt.vue";
import DMYPicker from "./modals/DMYPicker.vue";
import SnackBar from "./sub/SnackBar.vue";
import * as utils from "~/shared/utils";
const Intl = require("nativescript-intl");
import { localize } from "@nativescript/localize";
let barTimer;

export default {
  components: {
    SnackBar,
  },
  data() {
    return {
      mealTypes: ["breakfast", "lunch", "dinner", "snacks"],
      year: 2021,
      monthNames: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      month: 0,
      date: null,
      edit: 0,
      scrollPos: 1,
      appbar: null,
      snackbar: null,
      countdown: 5,
      snackMsg: null,
      showUndo: 0,
      undo: 0,
      temp: 0,
    };
  },
  computed: {
    ...mapState([
      "icon",
      "recipes",
      "layout",
      "mealPlans",
      "mondayFirst",
      "RTL",
      "plannerView",
    ]),
    todaysTime() {
      return new Date(this.year, this.month, this.date, 0).getTime();
    },
    getRecipes() {
      if (this.mealPlans.length) {
        return this.mealPlans.reduce((acc, e) => {
          if (e.date == this.todaysTime) {
            acc[e.mealType] = [...(acc[e.mealType] || []), e];
          }
          return acc;
        }, {});
      } else return {};
    },
    calRows() {
      let h = (Screen.mainScreen.widthDIPs - 32) / 8;
      let pv = this.plannerView;
      return pv != "d" ? `${h}, `.repeat(pv == "wk" ? 1 : 6) + h : 0;
    },
    getDayNames() {
      let dNames =
        this.plannerView != "d" &&
        this.getCal.slice(0, 7).map((d) => {
          let date = new Date(d.y, d.m, d.d);
          return new Intl.DateTimeFormat(null, {
            weekday: "short",
          }).format(date);
        });
      return dNames;
    },
    getCal() {
      const getDays = (s, e) => {
        let a = [];
        for (
          let d = new Date(s);
          d <= new Date(e);
          d.setDate(d.getDate() + 1)
        ) {
          a.push({
            d: d.getDate(),
            ld: this.getLocaleN(d.getDate()),
            m: d.getMonth(),
            y: d.getFullYear(),
          });
        }
        return a;
      };

      let pv = this.plannerView;
      let date = new Date(
        this.year,
        this.month,
        pv == "mnth" ? 1 : this.date - this.mondayFirst
      );
      return pv != "d"
        ? getDays(
            date.setDate(date.getDate() - date.getDay() + this.mondayFirst),
            date.setDate(date.getDate() + (pv == "mnth" ? 41 : 6))
          )
        : 0;
    },
    isExactlyToday() {
      let d = new Date();
      return (
        this.year == d.getFullYear() &&
        this.month == d.getMonth() &&
        this.date == d.getDate()
      );
    },
    hasRecipes() {
      return this.mealTypes.filter(
        (e) => this.getRecipes[e] && this.getRecipes[e].length
      ).length;
    },
    noImg() {
      return /simple|minimal/.test(this.layout);
    },
    noAttr() {
      return /minimal/.test(this.layout);
    },
  },
  methods: {
    ...mapActions(["addMealPlanAction", "deleteMealPlanAction"]),
    pgLoad({ object }) {
      object.bindingContext = new Observable();
      if (!this.date || this.date === new Date().getDate()) this.goToToday();
      this.showBar();
    },
    abLoad({ object }) {
      this.appbar = object;
    },
    sbLoad({ object }) {
      this.snackbar = object;
    },
    svScroll(args) {
      let scrollUp;
      let y = args.scrollY;
      if (y) {
        scrollUp = y < this.scrollPos;
        this.scrollPos = Math.abs(y);
        let ab = this.appbar.translateY;
        if (!scrollUp && ab == 0) {
          this.appbar.animate({
            translate: { x: 0, y: 64 },
            duration: 200,
            curve: CoreTypes.AnimationCurve.ease,
          });
        } else if (scrollUp && ab == 64) {
          this.appbar.animate({
            translate: { x: 0, y: 0 },
            duration: 200,
            curve: CoreTypes.AnimationCurve.ease,
          });
        }
      }
    },

    // Helpers
    centerLabel({ object }, n) {
      object.android.setGravity(n);
    },
    showBar() {
      // this.appbar.translateY = 0;
      this.appbar.animate({
        translate: { x: 0, y: 0 },
        duration: 200,
        curve: CoreTypes.AnimationCurve.ease,
      });
    },
    getrow(i) {
      return Math.floor(1 + i / 7);
    },
    getDate(index) {
      let date = new Date();
      date.setDate(date.getDate() + index);
      return date.getTime();
    },
    getRecipeImage(id) {
      let r = this.recipes.filter((e) => e.id === id)[0];
      return r && r.image;
    },
    getRecipeTitle(id) {
      let r = this.recipes.filter((e) => e.id === id)[0];
      return r ? r.title : `[${this.$options.filters.L("resNF")}]`;
    },
    getRecipeTotalTime(id) {
      let r = this.recipes.filter((e) => e.id === id)[0];
      return r ? this.totalTime(r.prepTime, r.cookTime).time : "00:00";
    },
    getYield(id) {
      let mp = this.mealPlans.filter((e) => e.id == id)[0];
      let r = this.recipes.filter((e) => e.id === mp.recipeID)[0];
      return r ? `${this.getLocaleN(mp.quantity)} ${localize(r.yieldUnit)}` : 1;
    },

    // NavigationHandlers
    viewRecipe(id) {
      let mp = this.mealPlans.filter((e) => e.id == id)[0];
      let r = this.recipes.filter((e) => e.id === mp.recipeID)[0];
      if (r) {
        this.$navigateTo(ViewRecipe, {
          props: {
            filterTrylater: 1,
            recipeID: r.id,
            yieldQuantity: mp.quantity,
          },
        });
      }
    },
    navigateTo() {
      this.$navigateTo(MPSettings, {
        transition: {
          name: this.RTL ? "slideRight" : "slide",
          duration: 200,
          curve: "easeOut",
        },
      });
    },
    navigateBack() {
      Frame.topmost().backStack.length
        ? this.$navigateBack()
        : this.$navigateTo(EnRecipes, {
            clearHistory: true,
          });
    },

    // Calendar
    navigate(dir) {
      if (this.RTL) dir = !dir;
      let pv = this.plannerView;
      let date = new Date(this.year, this.month, this.date);
      let sd =
        pv == "mnth"
          ? new Date(this.year, this.month + (dir ? 1 : 0), 0).getDate()
          : pv == "wk"
          ? 7
          : 1;
      date.setDate(date.getDate() + (dir ? sd : -sd));
      this.date = date.getDate();
      this.month = date.getMonth();
      this.year = date.getFullYear();
      this.showBar();
    },
    goToToday() {
      let d = new Date();
      this.year = d.getFullYear();
      this.month = d.getMonth();
      this.date = d.getDate();
    },
    dayClasses({ d, m }) {
      let classes = "min ";
      let dt1 = new Date();
      let dt2 = new Date(this.year, m, d, 0).getTime();
      if (
        this.year == dt1.getFullYear() &&
        this.month == dt1.getMonth() &&
        m == dt1.getMonth() &&
        d == dt1.getDate()
      )
        classes += "tb ";
      classes += this.date == d && this.month == m ? "hl " : "fb ";
      if (!!this.mealPlans.filter((e) => e.date == dt2).length)
        classes += "accent ";
      if (this.month != m) classes += "sub";
      return classes;
    },
    setDate({ d, m, y }) {
      this.year = y;
      this.month = m;
      this.date = d;
      this.showBar();
    },
    toggleEditMode() {
      this.edit = !this.edit;
    },
    openMonthYearPicker() {
      this.$showModal(DMYPicker, {
        props: {
          title: "gtD",
          monthNames: this.monthNames,
          currentD: this.date,
          currentM: this.month,
          currentY: this.year,
        },
      }).then((res) => {
        if (res) {
          this.month = res.month;
          this.year = res.year;
          this.date = res.date;
        }
      });
    },
    stSwipe({ direction }) {
      let date = new Date(this.year, this.month, this.date);
      if (direction == 1) date.setDate(date.getDate() - 1);
      else if (direction == 2) date.setDate(date.getDate() + 1);
      this.date = date.getDate();
      this.month = date.getMonth();
      this.year = date.getFullYear();
    },
    randomMealPlan() {},

    // DataHandlers
    newMealPlan({ plan, index, inDB }) {
      this.addMealPlanAction({
        plan,
        index,
        inDB,
      });
    },
    addMealPlan() {
      this.$showModal(Action, {
        props: {
          title: "add",
          list: ["rec", "no"],
        },
      }).then((type) => {
        if (type) {
          this.$showModal(Action, {
            props: {
              title: "selMT",
              list: ["breakfast", "lunch", "dinner", "snacks"],
            },
          }).then((mealType) => {
            if (mealType) {
              if (type == "rec") {
                let recipes = this.recipes.filter((e) =>
                  this.getRecipes[mealType]
                    ? this.getRecipes[mealType].every((f) => f.recipeID != e.id)
                    : 1
                );
                this.$showModal(ActionWithSearch, {
                  props: {
                    title: "selRec",
                    recipes,
                    action: "aNBtn",
                  },
                }).then((res) => {
                  if (res == "aNBtn") {
                    this.$navigateTo(EditRecipe, {
                      animated: false,
                    });
                  } else if (res) {
                    let r = this.recipes.filter((e) => e.id == res)[0];
                    this.$showModal(Prompt, {
                      props: {
                        title: `${localize("req", localize(r.yieldUnit))}`,
                        placeholder: Math.abs(parseFloat(r.yieldQuantity)),
                        action: "SET",
                      },
                    }).then((quantity) => {
                      if (quantity) {
                        let plan = {
                          id: utils.getRandomID(),
                          date: this.todaysTime,
                          mealType,
                          recipeID: res,
                          quantity,
                          note: null,
                        };
                        this.newMealPlan({
                          plan,
                          index: null,
                          inDB: 1,
                        });
                      }
                    });
                  }
                });
              } else if (type == "no") {
                this.$showModal(Prompt, {
                  props: {
                    title: "no",
                    type: "view",
                    action: "ADD",
                  },
                }).then((note) => {
                  if (note) {
                    let plan = {
                      id: utils.getRandomID(),
                      date: this.todaysTime,
                      mealType,
                      recipeID: null,
                      quantity: null,
                      note,
                    };
                    this.newMealPlan({
                      plan,
                      index: null,
                      inDB: 1,
                    });
                  }
                });
              }
            }
          });
        }
      });
    },
    deleteTempFromDB() {
      if (this.temp) {
        let { plan, index } = this.temp;
        this.deleteMealPlanAction({ id: plan.id, index, inDB: 1 });
        this.temp = 0;
      }
    },
    removeRecipe(id) {
      this.deleteTempFromDB();
      let index = this.mealPlans.findIndex((e) => e.id == id);
      let plan = this.mealPlans.filter((e) => e.id == id)[0];
      this.temp = { plan, index };
      this.deleteMealPlanAction({ id, index });
      this.showUndoBar(plan.note ? "rmN" : "recRm")
        .then(() => this.newMealPlan({ plan, index }))
        .catch(() => {
          this.deleteMealPlanAction({ id, index, inDB: 1 });
        });
    },
    showUndoBar(message) {
      return new Promise((resolve, reject) => {
        this.animateBar(this.appbar, 0).then(() => {
          this.showUndo = 1;
          this.snackMsg = message;
          this.countdown = 5;
          this.animateBar(this.snackbar, 1).then(() => {
            let a = 5;
            clearInterval(barTimer);
            barTimer = setInterval(() => {
              if (this.undo) {
                this.hideBar();
                resolve(1);
              }
              this.countdown = Math.round((a -= 0.1));
              if (this.countdown < 1) {
                this.hideBar();
                reject(1);
              }
            }, 100);
          });
        });
      });
    },
    hideBar() {
      clearInterval(barTimer);
      this.deleteTempFromDB();
      this.animateBar(this.snackbar, 0).then(() => {
        this.showUndo = this.undo = 0;
        this.animateBar(this.appbar, 1);
      });
    },
    undoDel() {
      this.undo = 1;
    },

    // Helpers
    formattedDate(v) {
      let d = new Date(this.year, this.month, this.date, 0, 0, 0);
      let today = new Date();
      let myToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0
      );
      let tdy = myToday.getTime();
      let ystr = myToday.setDate(today.getDate() - 1);
      let tmrw = myToday.setDate(today.getDate() + 1);
      let options: {
        year?: string;
        month?: string;
        weekday?: string;
        day?: string;
      } = {};
      if (v) {
        options.weekday = "long";
        options.day = "numeric";
        options.month = "long";
      } else {
        options.year = "numeric";
        options.month = "long";
      }
      if (this.plannerView == "d") {
        options.weekday = "long";
        options.day = "numeric";
        options.month = "short";
      }
      let date = new Intl.DateTimeFormat(null, options).format(d);
      let val;
      switch (d.getTime()) {
        case ystr:
          val = "ystr";
          break;
        case tdy:
          val = "tdy";
          break;
        case tmrw:
          val = "tmrw";
          break;
      }
      return v
        ? [ystr, tdy, tmrw].some((e) => e == d.getTime())
          ? localize(val)
          : date
        : date;
    },
    mYPicker({ object, action }) {
      object.className = action.match(/down|move/) ? "month fade" : "month";
      if (action == "up") this.openMonthYearPicker();
    },
    touchRecipe({ object, action }) {
      object.className = action.match(/down|move/) ? "fade" : "";
    },
  },
};
</script>
