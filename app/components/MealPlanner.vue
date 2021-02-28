<template>
  <Page @loaded="onPageLoad" @unloaded="onPageUnload">
    <ActionBar androidElevation="1">
      <GridLayout rows="*" columns="auto, *, auto, auto">
        <MDButton
          class="er"
          variant="text"
          :text="icon.back"
          automationText="Back"
          @tap="$navigateBack()"
          col="0"
        />
        <Label class="title orkm" :text="'planner' | L" col="1" />
        <MDButton
          class="er"
          variant="text"
          :text="icon.tod"
          automationText="today"
          @tap="goToToday"
          col="2"
        />
        <MDButton
          class="er"
          variant="text"
          :text="edit ? icon.done : icon.edit"
          automationText="edit"
          @tap="edit = !edit"
          col="3"
        />
      </GridLayout>
    </ActionBar>
    <ScrollView width="100%" height="100%">
      <GridLayout rows="auto, *">
        <GridLayout
          class="calendar"
          width="100%"
          row="0"
          columns="*, *, *, *, *, *, *"
          rows="auto, auto, auto, auto, auto, auto, auto, auto"
        >
          <MDButton
            variant="text"
            class="er navBtn"
            col="0"
            :text="icon.left"
            @tap="prevMonth"
          />
          <Label
            class="monthName"
            col="1"
            colSpan="5"
            :text="$options.filters.L(mNames[month]) + ' ' + year"
          />
          <MDButton
            variant="text"
            class="er navBtn"
            col="6"
            :text="icon.right"
            @tap="nextMonth"
          />
          <Label
            class="dayName"
            row="1"
            :col="i"
            v-for="(d, i) in dNames"
            :key="d"
            :text="$options.filters.L(d)"
          />
          <Label
            @loaded="centerLabel"
            class="day orkm"
            :androidElevation="hasPlans(d) ? 1 : 0"
            :class="{
              today: isToday(d),
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
        <StackLayout row="1" class="dayPlan">
          <StackLayout class="hr" margin="16 0 0"></StackLayout>
          <StackLayout
            v-for="(mealType, index) in mealTimes"
            :key="'mealType' + index"
            class="plansContainer"
            :class="mealType"
          >
            <GridLayout columns="auto, auto" class="header">
              <Label
                col="0"
                @tap="edit = true"
                class="periodLabel orkm"
                :text="mealType | L"
              />
              <MDButton
                :visibility="edit ? 'visible' : 'hidden'"
                col="1"
                variant="text"
                class="er"
                :text="icon.plus"
                @tap="addRecipe(mealType)"
              />
            </GridLayout>
            <GridLayout
              class="recipe"
              :paddingTop="index == 0 ? 8 : 0"
              :columns="`*, ${edit ? 'auto' : 0}`"
              v-for="(recipeID, index) in getRecipes[mealType]"
              :key="mealType + index"
            >
              <GridLayout
                androidElevation="1"
                col="0"
                columns="*"
                class="titleContainer mdr"
                @tap="viewRecipe(recipeID)"
              >
                <Label
                  verticalAlignment="center"
                  class="recipeTitle"
                  :text="getRecipeTitle(recipeID)"
                  textWrap="true"
                />
              </GridLayout>
              <MDButton
                :visibility="edit ? 'visible' : 'hidden'"
                variant="text"
                col="1"
                class="er x"
                :text="icon.x"
                @tap="removeRecipe(recipeID, mealType)"
              />
            </GridLayout>
          </StackLayout>
        </StackLayout>
      </GridLayout>
    </ScrollView>
  </Page>
</template>

<script>
import {
  ApplicationSettings,
  Page,
  Observable,
  GestureTypes,
} from "@nativescript/core";
import { SnackBar } from "@nativescript-community/ui-material-snackbar";
const snackbar = new SnackBar();
import { mapState, mapActions } from "vuex";
import ViewRecipe from "./ViewRecipe.vue";
import ActionDialogWithSearch from "./modal/ActionDialogWithSearch.vue";
import ConfirmDialog from "./modal/ConfirmDialog.vue";
export default {
  data() {
    return {
      appTheme: "Light",
      mealTimes: ["breakfast", "lunch", "dinner", "snacks"],
      dNames: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
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
    };
  },
  computed: {
    ...mapState(["icon", "recipes", "mealPlans"]),
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
    getCal() {
      let y = this.year;
      let m = this.month;
      let t = this.today;
      let d = new Date(y, m, t);
      let ds = new Date(y, m + 1, 0).getDate();
      let fd = new Date(y, m, 1).getDay();
      let days = new Array(fd).fill(0);
      for (let i = 1; i <= ds; i++) {
        days.push(i);
      }
      return days;
    },
  },
  methods: {
    ...mapActions([
      "setCurrentComponentAction",
      "addMealPlanAction",
      "deleteMealPlanAction",
    ]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
      this.setCurrentComponentAction("MealPlanner");
      if (!this.today || this.today === new Date().getDate()) this.goToToday();
    },
    onPageUnload(args) {
      snackbar.dismiss();
    },
    // HELPERS
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
    centerLabel(args) {
      args.object.android.setGravity(17);
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
        });
      }
    },
    // CALENDAR
    prevMonth() {
      if (this.month == 0) {
        this.year--;
        this.month = 11;
      } else this.month--;
    },
    nextMonth() {
      if (this.month == 11) {
        this.year++;
        this.month = 0;
      } else this.month++;
    },
    goToToday() {
      let d = new Date();
      this.year = d.getFullYear();
      this.month = d.getMonth();
      this.today = d.getDate();
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
    // DATA HANDLERS
    addRecipe(type) {
      let filteredRecipes = this.recipes.filter((e) =>
        this.getRecipes[type] ? !this.getRecipes[type].includes(e.id) : true
      );
      this.$showModal(ActionDialogWithSearch, {
        props: {
          title: "selRec",
          recipes: filteredRecipes,
          helpIcon: "cal",
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
      this.undoRemove(`${this.$options.filters.L("recRm")}`).then((res) => {
        if (res.command === "action") {
          this.newMealPlan(title, date, type, index);
        }
      });
    },
    undoRemove(message) {
      return snackbar.action({
        message,
        textColor: this.appTheme == "Light" ? "#fff" : "#292929",
        actionTextColor: "#ff5200",
        backgroundColor: this.appTheme == "Light" ? "#292929" : "#fff",
        actionText: "Undo",
        hideDelay: 5000,
      });
    },
  },
  created() {
    this.appTheme = ApplicationSettings.getString("appTheme", "Light");
  },
};
</script>
