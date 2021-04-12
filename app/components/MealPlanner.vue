<template>
  <Page @loaded="onPageLoad" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="*">
      <ScrollView
        @scroll="!edit && onScroll($event)"
        rowSpan="2"
        scrollBarIndicatorVisible="false"
      >
        <StackLayout>
          <Label class="pageTitle" :text="'planner' | L" />
          <GridLayout
            class="calendar"
            columns="*, *, *, *, *, *, *"
            rows="auto, auto, auto, auto, auto, auto, auto, auto"
          >
            <Button class="ico navBtn" :text="icon.left" @tap="prevMonth" />
            <Label
              class="monthName"
              col="1"
              colSpan="5"
              :text="$options.filters.L(mNames[month]) + ' ' + year"
            />
            <Button
              class="ico navBtn"
              col="6"
              :text="icon.right"
              @tap="nextMonth"
            />
            <Label
              class="dayName"
              row="1"
              :col="i"
              v-for="(d, i) in getDayNames"
              :key="d"
              :text="d | L"
            />
            <Button
              class="min day"
              :class="{
                tb: isToday(d),
                activeDay: isActive(d),
                hasPlans: hasPlans(d),
              }"
              :row="getrow(i)"
              :col="i % 7"
              v-for="(d, i) in getCal"
              :key="i"
              :text="d ? d : null"
              @tap="setToday(d)"
            />
          </GridLayout>
          <StackLayout class="dayPlan">
            <StackLayout
              v-for="(mealType, index) in mealTimesWithRecipes"
              :key="'mealType' + index"
            >
              <GridLayout columns="auto, auto">
                <Label
                  class="periodLabel tb"
                  :class="mealType"
                  :text="mealType | L"
                />
                <Button
                  :visibility="edit ? 'visible' : 'hidden'"
                  col="1"
                  class="ico"
                  :text="icon.plus"
                  @tap="addRecipe(mealType)"
                />
              </GridLayout>
              <GridLayout
                :columns="`*, ${edit ? 'auto' : 0}`"
                v-for="(recipeID, index) in getRecipes[mealType]"
                :key="mealType + index"
              >
                <Button
                  class="recipeTitle"
                  :text="getRecipeTitle(recipeID)"
                  @tap="viewRecipe(recipeID)"
                />
                <Button
                  :visibility="edit ? 'visible' : 'hidden'"
                  col="1"
                  class="ico x"
                  :text="icon.x"
                  @tap="removeRecipe(recipeID, mealType)"
                />
              </GridLayout>
            </StackLayout>
          </StackLayout>
        </StackLayout>
      </ScrollView>
      <GridLayout
        row="1"
        @loaded="onAppBarLoad"
        class="appbar"
        :hidden="showUndo"
        columns="auto, *, auto, auto"
      >
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
        <Button
          class="ico"
          :text="icon.tod"
          :hidden="isExactlyToday"
          @tap="goToToday"
          col="2"
        />
        <Button
          class="ico fab"
          :text="edit ? icon.done : icon.edit"
          @tap="toggleEditMode"
          col="3"
        />
      </GridLayout>
      <GridLayout
        row="1"
        class="appbar snackBar"
        :hidden="!showUndo"
        columns="auto, *, auto"
      >
        <Button :text="countdown" class="ico countdown tb" />
        <Label class="title" col="1" :text="snackMsg | L" />
        <Button class="ico fab" :text="icon.undo" @tap="undoDel" col="3" />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { ApplicationSettings, Observable, CoreTypes } from "@nativescript/core";
import { mapState, mapActions } from "vuex";
import ViewRecipe from "./ViewRecipe.vue";
import ActionDialogWithSearch from "./modal/ActionDialogWithSearch.vue";
let undoTimer;

export default {
  data() {
    return {
      appTheme: "Light",
      mealTimes: ["breakfast", "lunch", "dinner", "snacks"],
      dNames: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      year: 2021,
      mNames: [
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
      today: null,
      edit: false,
      scrollPos: 1,
      appbar: null,
      countdown: 5,
      snackMsg: null,
      showUndo: false,
      undo: false,
    };
  },
  computed: {
    ...mapState(["icon", "recipes", "mealPlans", "mondayFirst"]),
    todaysTime() {
      return new Date(this.year, this.month, this.today, 0).getTime();
    },
    getRecipes() {
      if (this.mealPlans.length) {
        return this.mealPlans.reduce((acc, e) => {
          if (e.date == this.todaysTime) {
            acc[e.type] = [...(acc[e.type] || []), e.title];
          }
          return acc;
        }, {});
      } else return 0;
    },
    getDayNames() {
      if (!this.mondayFirst) this.dNames.unshift(this.dNames.pop());
      return this.dNames;
    },
    getCal() {
      let y = this.year;
      let m = this.month;
      let ds = new Date(y, m + 1, 0).getDate();
      let fd = new Date(y, m, 1).getDay();
      if (this.mondayFirst) fd -= 1;
      let days = new Array(fd).fill(0);
      for (let i = 1; i <= ds; i++) {
        days.push(i);
      }
      return days;
    },
    isExactlyToday() {
      let d = new Date();
      return (
        this.year == d.getFullYear() &&
        this.month == d.getMonth() &&
        this.today == d.getDate()
      );
    },
    mealTimesWithRecipes() {
      return this.mealTimes.filter(
        (e) => (this.getRecipes[e] && this.getRecipes[e].length) || this.edit
      );
    },
  },
  methods: {
    ...mapActions([
      "setComponent",
      "addMealPlanAction",
      "deleteMealPlanAction",
    ]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
      this.setComponent("MealPlanner");
      if (!this.today || this.today === new Date().getDate()) this.goToToday();
    },
    onAppBarLoad({ object }) {
      this.appbar = object;
    },
    onScroll(args) {
      let scrollUp;
      let y = args.scrollY;
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
    // HELPERS
    showAppBar() {
      this.appbar.translateY = 0;
    },
    getrow(i) {
      return Math.floor(2 + i / 7);
    },
    getDate(index) {
      let date = new Date();
      date.setDate(date.getDate() + index);
      return date.getTime();
    },
    getRecipeTitle(id) {
      let recipe = this.recipes.filter((e) => e.id === id)[0];
      return recipe ? recipe.title : `[ ${this.$options.filters.L("resNF")} ]`;
    },

    // NAVIGATION HANDLERS
    viewRecipe(recipeID) {
      let recipe = this.recipes.filter((e) => e.id === recipeID)[0];
      if (recipe) {
        this.$navigateTo(ViewRecipe, {
          props: {
            filterTrylater: true,
            recipeID,
          },
          transition: {
            name: "fade",
            duration: 250,
            curve: "easeOut",
          },
        });
      }
    },
    // CALENDAR
    prevMonth() {
      if (this.month == 0) {
        this.year--;
        this.month = 11;
      } else this.month--;
      this.showAppBar();
    },
    nextMonth() {
      if (this.month == 11) {
        this.year++;
        this.month = 0;
      } else this.month++;
      this.showAppBar();
    },
    goToToday() {
      let d = new Date();
      this.year = d.getFullYear();
      this.month = d.getMonth();
      this.today = d.getDate();
      this.showAppBar();
    },
    isToday(date) {
      let d = new Date();
      return (
        this.year == d.getFullYear() &&
        this.month == d.getMonth() &&
        date == d.getDate()
      );
    },
    isActive(date) {
      return this.today == date;
    },
    hasPlans(date) {
      let d = new Date(this.year, this.month, date, 0).getTime();
      return this.mealPlans.filter((e) => e.date == d).length;
    },
    setToday(date) {
      if (date) this.today = date;
    },
    newMealPlan(title, date, type, index) {
      this.addMealPlanAction({
        title,
        date: date ? date : this.todaysTime,
        type,
        index,
      });
    },
    toggleEditMode() {
      this.edit = !this.edit;
    },
    // DATA HANDLERS
    addRecipe(type) {
      let filteredRecipes = this.recipes.filter((e) =>
        this.getRecipes[type] ? !this.getRecipes[type].includes(e.id) : true
      );
      this.$showModal(ActionDialogWithSearch, {
        props: {
          title: "selRec",
          recipes: filteredRecipes,
        },
      }).then((title) => {
        title && this.newMealPlan(title, null, type, null);
      });
    },
    removeRecipe(title, type) {
      let date = this.todaysTime;
      let index = this.mealPlans.findIndex(
        (e) => e.title === title && e.type === type && e.date === date
      );
      let mealPlan = {
        title,
        date,
        type,
        index,
      };
      this.deleteMealPlanAction(mealPlan);
      this.showUndoBar("recRm").then((res) =>
        this.newMealPlan(title, date, type, index)
      );
    },
    showUndoBar(message) {
      return new Promise((resolve, reject) => {
        clearTimeout(undoTimer);
        this.showUndo = true;
        this.snackMsg = message;
        this.countdown = 5;
        let a = 5;
        undoTimer = setInterval(() => {
          if (this.undo) {
            this.showUndo = this.undo = false;
            clearTimeout(undoTimer);
            resolve(true);
          }
          this.countdown = Math.round((a -= 0.1));
          if (this.countdown < 1) {
            this.showUndo = false;
            clearTimeout(undoTimer);
            reject(true);
          }
        }, 100);
      });
    },
    undoDel() {
      this.undo = true;
    },
  },
  created() {
    this.appTheme = ApplicationSettings.getString("appTheme", "Light");
  },
};
</script>
