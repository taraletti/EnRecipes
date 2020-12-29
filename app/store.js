import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);
import {Couchbase} from "nativescript-couchbase-plugin";
import {getFileAccess, File, ApplicationSettings} from "@nativescript/core";
const EnRecipesDB = new Couchbase("EnRecipes");
const userCuisinesDB = new Couchbase("userCuisines");
const userCategoriesDB = new Couchbase("userCategories");
const userYieldUnitsDB = new Couchbase("userYieldUnits");
const userUnitsDB = new Couchbase("userUnits");
const mealPlansDB = new Couchbase("mealPlans");
const defaultCuisines = [
  "American",
  "Brazilian",
  "British",
  "Chinese",
  "Danish",
  "Egyptian",
  "Filipino",
  "French",
  "German",
  "Greek",
  "Indian",
  "Irish",
  "Italian",
  "Jamaican",
  "Japanese",
  "Jewish",
  "Kenyan",
  "Korean",
  "Mexican",
  "Nigerian",
  "Portuguese",
  "Russian",
  "Scottish",
  "Spanish",
  "Sri Lankan",
  "Swedish",
  "Thai",
  "Turkish",
  "Vietnamese"
];
const defaultCategories = [
  "Appetizers",
  "Barbecue",
  "Beverages",
  "Breads",
  "Breakfast",
  "Desserts",
  "Dinner",
  "Drinks",
  "Healthy",
  "Lunch",
  "Main dishes",
  "Meat",
  "Noodles",
  "Pasta",
  "Poultry",
  "Rice",
  "Salads",
  "Sauces",
  "Seafood",
  "Side dishes",
  "Snacks",
  "Soups",
  "Undefined",
  "Vegan",
  "Vegetarian"
];
const defaultYieldUnits = [
  "Serving",
  "Piece",
  "Teaspoon",
  "Tablespoon",
  "Fluid Ounce",
  "Ounce",
  "Pound",
  "Gram",
  "Kilogram",
  "Cup",
  "Gallon",
  "Millilitre",
  "Litre",
  "Roll",
  "Patty",
  "Loaf"
];
const defaultUnits = [
  "unit",
  "tsp",
  "dsp",
  "tbsp",
  "fl oz",
  "cup",
  "pt",
  "qt",
  "gal",
  "ml",
  "l",
  "oz",
  "lb",
  "mg",
  "g",
  "kg",
  "cm",
  "in",
  "leaf",
  "clove",
  "piece",
  "pinch",
  "drop",
  "dozen",
  "stick",
  "small",
  "medium",
  "large"
];
const listItems = {
  cuisines: {
    db: userCuisinesDB,
    key: "userCuisines",
    stateName: "cuisines",
    sort: true,
    defaultItems: defaultCuisines
  },
  categories: {
    db: userCategoriesDB,
    key: "userCategories",
    stateName: "categories",
    sort: true,
    defaultItems: defaultCategories
  },
  yieldUnits: {
    db: userYieldUnitsDB,
    key: "userYieldUnits",
    stateName: "yieldUnits",
    sort: false,
    defaultItems: defaultYieldUnits
  },
  units: {
    db: userUnitsDB,
    key: "userUnits",
    stateName: "units",
    sort: false,
    defaultItems: defaultUnits
  }
};
export default new Vuex.Store({
  state: {
    recipes: [],
    cuisines: [],
    categories: [],
    yieldUnits: [],
    units: [],
    mealPlans: [],
    icon: {
      home: "\ued3b",
      heart: "\ued36",
      heartLine: "\uea6c",
      cuisine: "\ueb3e",
      category: "\uec7c",
      categoryLine: "\ue99c",
      tag: "\uee12",
      tagLine: "\ueb97",
      cog: "\ueca6",
      info: "\ued49",
      menu: "\ueac1",
      search: "\ueb54",
      sort: "\ueac2",
      plus: "\ueb21",
      plusCircle: "\ueb22",
      close: "\uebe9",
      image: "\uea7f",
      food: "\ueb3e",
      back: "\uea95",
      save: "\uedeb",
      camera: "\uec61",
      share: "\uedf3",
      edit: "\uedba",
      theme: "\uecaa",
      link: "\ueaa0",
      file: "\ued02",
      detail: "\ue9f9",
      user: "\uee33",
      trash: "\uee26",
      donate: "\uece2",
      trylater: "\uec31",
      trylaterLine: "\ue94a",
      note: "\ueb04",
      copy: "\ue9e6",
      check: "\ue9a4",
      telegram: "\ueec7",
      time: "\ueba2",
      item: "\ue99d",
      step: "\ue948",
      source: "\ueaa0",
      export: "\ued07",
      import: "\ued0c",
      outline: "\ueb07",
      calendar: "\uec55",
      today: "\ue97c",
      globe: "\uea5a",
      lock: "\ued61",
      github: "\uee8b",
      gitlab: "\uee8c",
      shuffle: "\ueb6b",
      reset: "\ueb3d",
      emptyCart: "\ue999",
      cart: "\uec77",
      meter: "\ueb96",
      star: "\uee0a",
      starLine: "\ueb83",
      compass: "\uecb4",
      show: "\uedfd"
    },
    currentComponent: "EnRecipes",
    sortType: "Oldest first",
    language: [
      {
        locale: "da",
        title: "Dansk"
      }, {
        locale: "de",
        title: "Deutsch"
      }, {
        locale: "en",
        title: "English"
      }, {
        locale: "es",
        title: "Español"
      }, {
        locale: "nl",
        title: "Nederlands"
      }, {
        locale: "pt",
        title: "Português"
      }, {
        locale: "ru",
        title: "Русский"
      }, {
        locale: "ta",
        title: "தமிழ்"
      }
    ],
    shakeEnabled: true,
    importSummary: {
      found: 0,
      imported: 0,
      updated: 0
    }
  },
  mutations: {
    setSortType(state, sortType) {
      state.sortType = sortType
    },
    initializeRecipes(state) {
      EnRecipesDB.query({select: []}).forEach(r => {
        if (r.timeRequired) {
          r.prepTime = "00:00";
          r.cookTime = r.timeRequired;
          delete r.timeRequired;
        }
        if (!r.hasOwnProperty("cuisine"))
          r.cuisine = "Undefined"
        if (!r.hasOwnProperty("tags"))
          r.tags = []
        if (!r.hasOwnProperty("difficulty"))
          r.difficulty = "Easy"
        if (!r.hasOwnProperty("rating"))
          r.rating = 0
        if (!r.hasOwnProperty("created"))
          r.created = r.lastModified
        state.recipes.push(r);
      });
      state.shakeEnabled = ApplicationSettings.getBoolean("shakeEnabled", true)
      state.sortType = ApplicationSettings.getString("sortType", "Oldest first")
    },
    importRecipes(state, recipes) {
      let localRecipesIDs,
        partition
      let imported = 0
      let updated = 0
      function getUpdatedData(data) {
        return data.map(recipe => {
          let r = Object.assign({}, recipe);
          if (r.timeRequired) {
            r.prepTime = "00:00";
            r.cookTime = r.timeRequired;
            delete r.timeRequired;
          }
          if (!r.hasOwnProperty("cuisine"))
            r.cuisine = "Undefined"
          if (!r.hasOwnProperty("tags"))
            r.tags = []
          if (!r.hasOwnProperty("difficulty"))
            r.difficulty = "Easy"
          if (!r.hasOwnProperty("rating"))
            r.rating = 0
          if (!r.hasOwnProperty("created"))
            r.created = r.lastModified
          return r;
        });
      }
      function createDocuments(data) {
        data = getUpdatedData(data);
        state.recipes = [
          ...state.recipes,
          ...data
        ];
        data.forEach(recipe => {
          imported++
          EnRecipesDB.createDocument(recipe, recipe.id);
        });
      }
      function updateDocuments(data) {
        data = getUpdatedData(data);
        data.forEach(recipe => {
          let recipeIndex = state.recipes.map((e, i) => {
            let d1 = new Date(e.lastModified).getTime();
            let d2 = new Date(recipe.lastModified).getTime();
            return e.id === recipe.id && d1 < d2
              ? i
              : -1;
          }).filter(e => e >= 0)[0];
          if (recipeIndex >= 0) {
            updated++
            Object.assign(state.recipes[recipeIndex], recipe);
            EnRecipesDB.updateDocument(recipe.id, recipe);
          }
        });
      }
      if (state.recipes.length) {
        localRecipesIDs = state.recipes.map(e => e.id);
        partition = recipes.reduce((result, recipe, i) => {
          localRecipesIDs.indexOf(recipe.id) < 0
            ? result[0].push(recipe) // create candidates
            : result[1].push(recipe); // update candidates
          return result;
        }, [[], []]);
        if (partition[0].length)
          createDocuments(partition[0]);
        if (partition[1].length)
          updateDocuments(partition[1]);
        }
      else {
        createDocuments(recipes);
      }
      state.importSummary.found = recipes.length
      state.importSummary.imported = imported
      state.importSummary.updated = updated
    },
    addRecipe(state, {id, recipe}) {
      state.recipes.push(recipe);
      EnRecipesDB.createDocument(recipe, id);
    },
    overwriteRecipe(state, {id, recipe}) {
      let index = state.recipes.indexOf(state.recipes.filter(e => e.id === id)[0]);
      Object.assign(state.recipes[index], recipe);
      EnRecipesDB.updateDocument(id, recipe);
    },
    deleteRecipe(state, {index, id}) {
      getFileAccess().deleteFile(state.recipes[index].imageSrc);
      state.recipes.splice(index, 1);
      EnRecipesDB.deleteDocument(id);
      state.recipes.forEach((e, i) => {
        if (e.combinations.includes(id)) {
          state.recipes[i].combinations.splice(e.combinations.indexOf(id), 1);
          EnRecipesDB.updateDocument(state.recipes[i].id, state.recipes[i]);
        }
      });
    },
    initializeListItems(state) {
      function initialize(listName) {
        let userItems;
        let db = listItems[listName].db;
        let key = listItems[listName].key;
        let stateName = listItems[listName].stateName;
        let defaultItems = listItems[listName].defaultItems;
        if (!state[stateName].length) {
          let isStored = db.query({select: []}).length;
          if (isStored) {
            userItems = db.getDocument(key)[key];
            if (userItems.some(e => defaultItems.includes(e)))
              state[stateName] = userItems;
            else
              state[stateName] = [
                ...defaultItems,
                ...userItems
              ];
            }
          else {
            if (listItems[listName].sort) {
              state[stateName].sort();
            }
            state[stateName] = defaultItems;
            db.createDocument({
              [key]: []
            }, key);
          }
        }
      }["cuisines", "categories", "yieldUnits", "units"].forEach(item => {
        initialize(item);
      });
    },
    importListItems(state, {data, listName}) {
      let db = listItems[listName].db;
      let key = listItems[listName].key;
      let stateName = listItems[listName].stateName;
      let items = new Set([
        ...state[stateName],
        ...data
      ]);
      state[stateName] = [...items];
      if (listItems[listName].sort)
        state[stateName].sort();
      db.updateDocument(key, {[key]: state[stateName]});
    },
    addListItem(state, {item, listName}) {
      console.log(item, listName);
      let db = listItems[listName].db;
      let key = listItems[listName].key;
      let stateName = listItems[listName].stateName;
      let lowercase = state[stateName].map(e => e.toLowerCase());
      if (lowercase.indexOf(item.toLowerCase()) == -1) {
        state[stateName].push(item);
        db.updateDocument(key, {[key]: state[stateName]});
        if (listItems[listName].sort)
          state[stateName].sort();
        }
      },
    removeListItem(state, {item, listName}) {
      let db = listItems[listName].db;
      let key = listItems[listName].key;
      let stateName = listItems[listName].stateName;
      let index = state[stateName].indexOf(item);
      state[stateName].splice(index, 1);
      db.updateDocument(key, {[key]: state[stateName]});
      if (listItems[listName].sort)
        state[stateName].sort();
      }
    ,
    resetListItems(state, listName) {
      let stateName = listItems[listName].stateName;
      let defaultItems = listItems[listName].defaultItems;
      let items = new Set([
        ...defaultItems,
        ...state[listName]
      ]);
      state[listName] = [...items];
      if (listItems[listName].sort) {
        state[stateName].sort();
      }
    },
    initializeMealPlans(state) {
      let isMealPlansDBStored = mealPlansDB.query({select: []}).length;
      if (isMealPlansDBStored) {
        state.mealPlans = mealPlansDB.getDocument("mealPlans").mealPlans;
      } else {
        mealPlansDB.createDocument({
          mealPlans: []
        }, "mealPlans");
      }
    },
    importMealPlans(state, mealPlans) {
      let newMealPlans = mealPlans.filter(e => !state.mealPlans.some(f => f.title === e.title && f.startDate === e.startDate));
      state.mealPlans = [
        ...state.mealPlans,
        ...newMealPlans
      ];
      mealPlansDB.updateDocument("mealPlans", {mealPlans: state.mealPlans});
    },
    addMealPlan(state, {event, eventColor}) {
      state.mealPlans.push({title: event.title, startDate: event.startDate, endDate: event.endDate, eventColor});
      mealPlansDB.updateDocument("mealPlans", {
        mealPlans: [...state.mealPlans]
      });
    },
    deleteMealPlan(state, {title, startDate}) {
      let mealPlan = state.mealPlans.filter(e => {
        let sd = new Date(e.startDate).getTime();
        return e.title === title && sd === startDate.getTime();
      })[0];
      let index = state.mealPlans.indexOf(mealPlan);
      state.mealPlans.splice(index, 1);
      state.mealPlans = [...state.mealPlans];
      let mealPlans = mealPlansDB.getDocument("mealPlans").mealPlans;
      mealPlans.splice(index, 1);
      mealPlansDB.updateDocument("mealPlans", {
        mealPlans: [...mealPlans]
      });
    },
    toggleState(state, {id, recipe, key, setDate}) {
      let index = state.recipes.indexOf(state.recipes.filter(e => e.id === id)[0]);
      state.recipes[index][key] = !state.recipes[index][key];
      if (setDate)
        state.recipes[index].lastTried = new Date();
      EnRecipesDB.updateDocument(id, recipe);
    },
    setRecipeAsTried(state, {id, recipe}) {
      let index = state.recipes.indexOf(state.recipes.filter(e => e.id === id)[0]);
      state.recipes[index].tried = true;
      state.recipes[index].lastTried = new Date();
      EnRecipesDB.updateDocument(id, recipe);
    },
    setLastTriedDate(state, index) {
      state.recipes[index].lastTried = new Date();
      EnRecipesDB.updateDocument(state.recipes[index].id, state.recipes[index]);
    },
    setCurrentComponent(state, comp) {
      state.currentComponent = comp;
    },
    unSyncCombinations(state, {id, combinations}) {
      state.recipes.forEach((e, i) => {
        if (combinations.includes(e.id)) {
          state.recipes[i].combinations.splice(e.combinations.indexOf(id), 1);
          EnRecipesDB.updateDocument(state.recipes[i].id, state.recipes[i]);
        }
      });
    },
    setShake(state, shake) {
      state.shakeEnabled = shake;
    },
    setRating(state, {id, recipe, rating}) {
      let index = state.recipes.indexOf(state.recipes.filter(e => e.id === id)[0]);
      state.recipes[index].rating = rating
      EnRecipesDB.updateDocument(id, recipe);
    },
    unlinkBrokenImages(state) {
      state.recipes.forEach((r, i) => {
        if (r.imageSrc && !File.exists(r.imageSrc)) {
          r.imageSrc = null
          Object.assign(state.recipes[i], r);
          EnRecipesDB.updateDocument(r.id, r);
        }
      })
    }
  },
  actions: {
    setSortTypeAction({
      commit
    }, sortType) {
      commit("setSortType", sortType)
    },
    initializeRecipes({commit}) {
      commit("initializeRecipes");
    },
    importRecipesAction({
      commit
    }, recipes) {
      commit("importRecipes", recipes);
    },
    addRecipeAction({
      commit
    }, recipe) {
      commit("addRecipe", recipe);
    },
    overwriteRecipeAction({
      commit
    }, updatedRecipe) {
      commit("overwriteRecipe", updatedRecipe);
    },
    deleteRecipeAction({
      commit
    }, recipe) {
      commit("deleteRecipe", recipe);
    },
    initializeListItems({commit}) {
      commit("initializeListItems");
    },
    importListItemsAction({
      commit
    }, data) {
      commit("importListItems", data);
    },
    addListItemAction({
      commit
    }, item) {
      commit("addListItem", item);
    },
    removeListItemAction({
      commit
    }, item) {
      commit("removeListItem", item);
    },
    resetListItemsAction({
      commit
    }, listName) {
      commit("resetListItems", listName);
    },
    initializeMealPlans({commit}) {
      commit("initializeMealPlans");
    },
    importMealPlansAction({
      commit
    }, mealPlans) {
      commit("importMealPlans", mealPlans);
    },
    addMealPlanAction({
      commit
    }, mealPlan) {
      commit("addMealPlan", mealPlan);
    },
    deleteMealPlanAction({
      commit
    }, mealPlan) {
      commit("deleteMealPlan", mealPlan);
    },
    toggleStateAction({
      commit
    }, toggledRecipe) {
      commit("toggleState", toggledRecipe);
    },
    setRecipeAsTriedAction({
      commit
    }, recipe) {
      commit("setRecipeAsTried", recipe);
    },
    setLastTriedDateAction({
      commit
    }, index) {
      commit("setLastTriedDate", index);
    },
    setCurrentComponentAction({
      commit
    }, comp) {
      commit("setCurrentComponent", comp);
    },
    unSyncCombinationsAction({
      commit
    }, combinations) {
      commit("unSyncCombinations", combinations);
    },
    setShakeAction({
      commit
    }, shake) {
      commit("setShake", shake);
    },
    setRatingAction({
      commit
    }, rating) {
      commit("setRating", rating);
    },
    unlinkBrokenImages({commit}) {
      commit("unlinkBrokenImages");
    }
  }
});
