import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
import { CouchBase } from '@triniwiz/nativescript-couchbase'
import {
  Application,
  getFileAccess,
  File,
  ApplicationSettings,
} from '@nativescript/core'
const EnRecipesDB = new CouchBase('EnRecipes')
const userCuisinesDB = new CouchBase('userCuisines')
const userCategoriesDB = new CouchBase('userCategories')
const userYieldUnitsDB = new CouchBase('userYieldUnits')
const userUnitsDB = new CouchBase('userUnits')
const mealPlansDB = new CouchBase('mealPlans')
const defaultCuisines = [
  'American',
  'Brazilian',
  'British',
  'Chinese',
  'Danish',
  'Egyptian',
  'Filipino',
  'French',
  'German',
  'Greek',
  'Indian',
  'Irish',
  'Italian',
  'Jamaican',
  'Japanese',
  'Jewish',
  'Kenyan',
  'Korean',
  'Mexican',
  'Nigerian',
  'Portuguese',
  'Russian',
  'Scottish',
  'Spanish',
  'Sri Lankan',
  'Swedish',
  'Thai',
  'Turkish',
  'Vietnamese',
]
const defaultCategories = [
  'Appetizers',
  'Barbecue',
  'Beverages',
  'Breads',
  'Breakfast',
  'Desserts',
  'Dinner',
  'Drinks',
  'Healthy',
  'Lunch',
  'Main dishes',
  'Meat',
  'Noodles',
  'Pasta',
  'Poultry',
  'Rice',
  'Salads',
  'Sauces',
  'Seafood',
  'Side dishes',
  'Snacks',
  'Soups',
  'Undefined',
  'Vegan',
  'Vegetarian',
]
const defaultYieldUnits = [
  'Serving',
  'Piece',
  'Teaspoon',
  'Tablespoon',
  'Fluid Ounce',
  'Ounce',
  'Pound',
  'Gram',
  'Kilogram',
  'Cup',
  'Gallon',
  'Millilitre',
  'Litre',
  'Roll',
  'Patty',
  'Loaf',
]
const defaultUnits = [
  'unit',
  'tsp',
  'dsp',
  'tbsp',
  'fl oz',
  'cup',
  'pt',
  'qt',
  'gal',
  'ml',
  'l',
  'oz',
  'lb',
  'mg',
  'g',
  'kg',
  'cm',
  'in',
  'leaf',
  'clove',
  'piece',
  'pinch',
  'drop',
  'dozen',
  'stick',
  'small',
  'medium',
  'large',
]
const listItems = {
  cuisines: {
    db: userCuisinesDB,
    key: 'userCuisines',
    stateName: 'cuisines',
    sort: true,
    defaultItems: defaultCuisines,
  },
  categories: {
    db: userCategoriesDB,
    key: 'userCategories',
    stateName: 'categories',
    sort: true,
    defaultItems: defaultCategories,
  },
  yieldUnits: {
    db: userYieldUnitsDB,
    key: 'userYieldUnits',
    stateName: 'yieldUnits',
    sort: false,
    defaultItems: defaultYieldUnits,
  },
  units: {
    db: userUnitsDB,
    key: 'userUnits',
    stateName: 'units',
    sort: false,
    defaultItems: defaultUnits,
  },
}

export default new Vuex.Store({
  state: {
    recipes: [],
    cuisines: [],
    categories: [],
    yieldUnits: [],
    units: [],
    mealPlans: [],
    icon: {
      alert: '\ue900',
      back: '\ue901',
      bag: '\ue902',
      bagged: '\ue903',
      cal: '\ue904',
      cam: '\ue905',
      category: '\ue906',
      cog: '\ue907',
      comb: '\ue908',
      cuisine: '\ue909',
      del: '\ue90a',
      diff: '\ue90b',
      don: '\ue90c',
      done: '\ue90d',
      edit: '\ue90e',
      exp: '\ue910',
      fav: '\ue911',
      faved: '\ue912',
      folder: '\ue913',
      gh: '\ue914',
      help: '\ue915',
      home: '\ue916',
      img: '\ue917',
      imp: '\ue918',
      info: '\ue919',
      items: '\ue91a',
      l1: '\ue91b',
      l2: '\ue91c',
      l3: '\ue91d',
      lang: '\ue91e',
      left: '\ue91f',
      menu: '\ue920',
      noresult: '\ue921',
      notes: '\ue922',
      plus: '\ue923',
      plusc: '\ue924',
      price: '\ue925',
      priv: '\ue926',
      err: '\ue90f',
      res: '\ue927',
      reset: '\ue928',
      right: '\ue929',
      save: '\ue92a',
      sear: '\ue92b',
      selall: '\ue92c',
      share: '\ue92d',
      shuf: '\ue92e',
      sort: '\ue92f',
      star: '\ue930',
      starred: '\ue931',
      steps: '\ue932',
      succ: '\ue933',
      tag: '\ue934',
      text: '\ue935',
      tg: '\ue936',
      theme: '\ue937',
      time: '\ue938',
      timer: '\ue939',
      tod: '\ue93a',
      trans: '\ue93b',
      tried: '\ue93c',
      try: '\ue93d',
      unit: '\ue93e',
      x: '\ue93f',
      yield: '\ue940',
      zip: '\ue941',
    },
    currentComponent: 'EnRecipes',
    sortType: 'Oldest first',
    language: [
      {
        locale: 'da',
        title: 'Dansk',
      },
      {
        locale: 'de',
        title: 'Deutsch',
      },
      {
        locale: 'en-GB',
        title: 'English (UK)',
      },
      {
        locale: 'es',
        title: 'Español',
      },
      {
        locale: 'fr',
        title: 'Français',
      },
      {
        locale: 'fr-BE',
        title: 'Français (BE)',
      },
      {
        locale: 'fr-CA',
        title: 'Français (CA)',
      },
      {
        locale: 'fr-CH',
        title: 'Français (CH)',
      },
      {
        locale: 'it',
        title: 'Italiano',
      },
      {
        locale: 'nb-NO',
        title: 'Norsk bokmål',
      },
      {
        locale: 'nl',
        title: 'Nederlands',
      },
      {
        locale: 'pt',
        title: 'Português',
      },
      {
        locale: 'ru',
        title: 'Русский',
      },
      {
        locale: 'ta',
        title: 'தமிழ்',
      },
    ],
    shakeEnabled: true,
    importSummary: {
      found: 0,
      imported: 0,
      updated: 0,
    },
    layout: 'detailed',
    selectedCuisine: null,
    selectedCategory: null,
    selectedTag: null,
    appTheme: 'Light',
  },
  mutations: {
    setTheme(state, theme) {
      ApplicationSettings.setString('appTheme', theme)
      state.appTheme = theme
    },
    clearFilter(state) {
      state.selectedCuisine = state.selectedCategory = state.selectedTag = null
    },
    setLayout(state, type) {
      state.layout = type
    },
    setSortType(state, sortType) {
      state.sortType = sortType
    },
    initRecipes(state) {
      EnRecipesDB.query({ select: [] }).forEach((r) => {
        if (r.timeRequired) {
          r.prepTime = '00:00'
          r.cookTime = r.timeRequired
          delete r.timeRequired
        }
        if (!r.hasOwnProperty('cuisine')) r.cuisine = 'Undefined'
        if (!r.hasOwnProperty('tags')) r.tags = []
        if (!r.hasOwnProperty('difficulty')) r.difficulty = 'Easy'
        if (!r.hasOwnProperty('rating')) r.rating = 0
        if (!r.hasOwnProperty('created')) r.created = r.lastModified
        // if (!r.hasOwnProperty("inBag"))
        //   r.inBag = false
        state.recipes.push(r)
      })
      state.shakeEnabled = ApplicationSettings.getBoolean('shakeEnabled', true)
      state.sortType = ApplicationSettings.getString('sortType', 'Oldest first')
    },
    importRecipes(state, recipes) {
      let localRecipesIDs, partition
      let imported = 0
      let updated = 0
      function getUpdatedData(data) {
        return data.map((recipe) => {
          let r = Object.assign({}, recipe)
          if (r.timeRequired) {
            r.prepTime = '00:00'
            r.cookTime = r.timeRequired
            delete r.timeRequired
          }
          if (!r.hasOwnProperty('cuisine')) r.cuisine = 'Undefined'
          if (!r.hasOwnProperty('tags')) r.tags = []
          if (!r.hasOwnProperty('difficulty')) r.difficulty = 'Easy'
          if (!r.hasOwnProperty('rating')) r.rating = 0
          if (!r.hasOwnProperty('created')) r.created = r.lastModified
          // if (!r.hasOwnProperty("inBag"))
          //   r.inBag = false
          return r
        })
      }
      function createDocuments(data) {
        data = getUpdatedData(data)
        state.recipes = [...state.recipes, ...data]
        data.forEach((recipe) => {
          imported++
          EnRecipesDB.createDocument(recipe, recipe.id)
        })
      }
      function updateDocuments(data) {
        data = getUpdatedData(data)
        data.forEach((recipe) => {
          let recipeIndex = state.recipes
            .map((e, i) => {
              let d1 = new Date(e.lastModified).getTime()
              let d2 = new Date(recipe.lastModified).getTime()
              return e.id === recipe.id && d1 < d2 ? i : -1
            })
            .filter((e) => e >= 0)[0]
          if (recipeIndex >= 0) {
            updated++
            Object.assign(state.recipes[recipeIndex], recipe)
            EnRecipesDB.updateDocument(recipe.id, recipe)
          }
        })
      }
      if (state.recipes.length) {
        localRecipesIDs = state.recipes.map((e) => e.id)
        partition = recipes.reduce(
          (result, recipe, i) => {
            localRecipesIDs.indexOf(recipe.id) < 0
              ? result[0].push(recipe) // create candidates
              : result[1].push(recipe) // update candidates
            return result
          },
          [[], []]
        )
        if (partition[0].length) createDocuments(partition[0])
        if (partition[1].length) updateDocuments(partition[1])
      } else {
        createDocuments(recipes)
      }
      state.importSummary.found = recipes.length
      state.importSummary.imported = imported
      state.importSummary.updated = updated
    },
    addRecipe(state, { id, recipe }) {
      state.recipes.push(recipe)
      EnRecipesDB.createDocument(recipe, id)
    },
    overwriteRecipe(state, { id, recipe }) {
      let index = state.recipes.indexOf(
        state.recipes.filter((e) => e.id === id)[0]
      )
      Object.assign(state.recipes[index], recipe)
      EnRecipesDB.updateDocument(id, recipe)
    },
    deleteRecipe(state, { index, id }) {
      getFileAccess().deleteFile(state.recipes[index].imageSrc)
      state.recipes.splice(index, 1)
      EnRecipesDB.deleteDocument(id)
      state.recipes.forEach((e, i) => {
        if (e.combinations.includes(id)) {
          state.recipes[i].combinations.splice(e.combinations.indexOf(id), 1)
          EnRecipesDB.updateDocument(state.recipes[i].id, state.recipes[i])
        }
      })
    },
    deleteRecipes(state, ids) {
      ids.forEach((id) => {
        let index = state.recipes.findIndex((e) => e.id === id)
        getFileAccess().deleteFile(state.recipes[index].imageSrc)
        state.recipes.splice(index, 1)
        EnRecipesDB.deleteDocument(id)
        state.recipes.forEach((e, i) => {
          if (e.combinations.includes(id)) {
            state.recipes[i].combinations.splice(e.combinations.indexOf(id), 1)
            EnRecipesDB.updateDocument(state.recipes[i].id, state.recipes[i])
          }
        })
      })
    },
    initListItems(state) {
      function initialize(listName) {
        let userItems
        let db = listItems[listName].db
        let key = listItems[listName].key
        let stateName = listItems[listName].stateName
        let defaultItems = listItems[listName].defaultItems
        if (!state[stateName].length) {
          let isStored = db.query({ select: [] }).length
          if (isStored) {
            userItems = db.getDocument(key)[key]
            if (userItems.some((e) => defaultItems.includes(e)))
              state[stateName] = userItems
            else state[stateName] = [...defaultItems, ...userItems]
          } else {
            if (listItems[listName].sort) {
              state[stateName].sort()
            }
            state[stateName] = defaultItems
            db.createDocument(
              {
                [key]: [],
              },
              key
            )
          }
        }
      }
      ;['cuisines', 'categories', 'yieldUnits', 'units'].forEach((item) => {
        initialize(item)
      })
    },
    importListItems(state, { data, listName }) {
      let db = listItems[listName].db
      let key = listItems[listName].key
      let stateName = listItems[listName].stateName
      let items = new Set([...state[stateName], ...data])
      state[stateName] = [...items]
      if (listItems[listName].sort) state[stateName].sort()
      db.updateDocument(key, { [key]: state[stateName] })
    },
    addListItem(state, { item, listName }) {
      let db = listItems[listName].db
      let key = listItems[listName].key
      let stateName = listItems[listName].stateName
      let lowercase = state[stateName].map((e) => e.toLowerCase())
      if (lowercase.indexOf(item.toLowerCase()) == -1) {
        state[stateName].push(item)
        db.updateDocument(key, { [key]: state[stateName] })
        if (listItems[listName].sort)
          state[stateName].sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
          )
      }
    },
    removeListItem(state, { item, listName }) {
      let db = listItems[listName].db
      let key = listItems[listName].key
      let stateName = listItems[listName].stateName
      let index = state[stateName].indexOf(item)
      state[stateName].splice(index, 1)
      db.updateDocument(key, { [key]: state[stateName] })
      if (listItems[listName].sort) state[stateName].sort()
    },
    resetListItems(state, listName) {
      let stateName = listItems[listName].stateName
      let defaultItems = listItems[listName].defaultItems
      state[listName] = [...defaultItems]
      if (listItems[listName].sort) {
        state[stateName].sort()
      }
    },
    initMealPlans(state) {
      let isMealPlansDBStored = mealPlansDB.query({ select: [] }).length
      if (isMealPlansDBStored) {
        let plans = mealPlansDB.getDocument('mealPlans').mealPlans
        if (plans.length && plans[0].hasOwnProperty('eventColor')) {
          plans.forEach((p) => {
            let d = new Date(p.startDate)
            p.date = new Date(
              d.getFullYear(),
              d.getMonth(),
              d.getDate(),
              0
            ).getTime()
            switch (new Date(p.date).getHours()) {
              case 0:
                p.type = 'breakfast'
                break
              case 5:
                p.type = 'lunch'
                break
              case 10:
                p.type = 'dinner'
                break
              case 15:
                p.type = 'snacks'
                break
            }
            delete p.startDate
            delete p.endDate
            delete p.eventColor
            state.mealPlans.push(p)
          })
          mealPlansDB.updateDocument('mealPlans', {
            mealPlans: state.mealPlans,
          })
        } else state.mealPlans = [...plans]
      } else {
        mealPlansDB.createDocument(
          {
            mealPlans: [],
          },
          'mealPlans'
        )
      }
    },
    importMealPlans(state, mealPlans) {
      let newMealPlans = mealPlans.filter((e) => {
        if (e.hasOwnProperty('eventColor')) {
          return !state.mealPlans.some((f) => {
            let d = new Date(e.startDate)
            let date = new Date(
              d.getFullYear(),
              d.getMonth(),
              d.getDate(),
              0
            ).getTime()
            let type
            switch (d.getHours()) {
              case 0:
                type = 'breakfast'
                break
              case 5:
                type = 'lunch'
                break
              case 10:
                type = 'dinner'
                break
              case 15:
                type = 'snacks'
                break
            }
            return f.title === e.title && f.date === date && f.type === type
          })
        } else {
          return !state.mealPlans.some(
            (f) => f.title === e.title && f.date === e.date && f.type === e.type
          )
        }
      })
      let updatedMealPlans = []
      if (newMealPlans[0].hasOwnProperty('eventColor')) {
        newMealPlans.forEach((p) => {
          let d = new Date(p.startDate)
          p.date = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            0
          ).getTime()
          switch (d.getHours()) {
            case 0:
              p.type = 'breakfast'
              break
            case 5:
              p.type = 'lunch'
              break
            case 10:
              p.type = 'dinner'
              break
            case 15:
              p.type = 'snacks'
              break
          }
          delete p.startDate
          delete p.endDate
          delete p.eventColor
          updatedMealPlans.push(p)
        })
      }
      state.mealPlans = [...state.mealPlans, ...updatedMealPlans]
      mealPlansDB.updateDocument('mealPlans', { mealPlans: state.mealPlans })
    },
    addMealPlan(state, { title, date, type, index }) {
      let mealPlan = {
        title,
        date,
        type,
      }
      if (index != null) state.mealPlans.splice(index, 0, mealPlan)
      else state.mealPlans.push(mealPlan)
      mealPlansDB.updateDocument('mealPlans', {
        mealPlans: [...state.mealPlans],
      })
    },
    deleteMealPlan(state, { title, date, type, index }) {
      state.mealPlans.splice(index, 1)
      state.mealPlans = [...state.mealPlans]
      mealPlansDB.updateDocument('mealPlans', {
        mealPlans: [...state.mealPlans],
      })
    },
    toggleState(state, { id, recipe, key, setDate }) {
      let index = state.recipes.indexOf(
        state.recipes.filter((e) => e.id === id)[0]
      )
      state.recipes[index][key] = !state.recipes[index][key]
      if (setDate) state.recipes[index].lastTried = new Date()
      EnRecipesDB.updateDocument(id, recipe)
    },
    setRecipeAsTried(state, { id, recipe }) {
      let index = state.recipes.indexOf(
        state.recipes.filter((e) => e.id === id)[0]
      )
      state.recipes[index].tried = true
      state.recipes[index].lastTried = new Date()
      EnRecipesDB.updateDocument(id, recipe)
    },
    setLastTriedDate(state, index) {
      state.recipes[index].lastTried = new Date()
      EnRecipesDB.updateDocument(state.recipes[index].id, state.recipes[index])
    },
    setComponent(state, comp) {
      state.currentComponent = comp
    },
    unSyncCombinations(state, { id, combinations }) {
      state.recipes.forEach((e, i) => {
        if (combinations.includes(e.id)) {
          state.recipes[i].combinations.splice(e.combinations.indexOf(id), 1)
          EnRecipesDB.updateDocument(state.recipes[i].id, state.recipes[i])
        }
      })
    },
    setShake(state, shake) {
      state.shakeEnabled = shake
    },
    setRating(state, { id, recipe, rating }) {
      let index = state.recipes.indexOf(
        state.recipes.filter((e) => e.id === id)[0]
      )
      state.recipes[index].rating = rating
      EnRecipesDB.updateDocument(id, recipe)
    },
    toggleCart(state, { id, recipe }) {
      let index = state.recipes.indexOf(
        state.recipes.filter((e) => e.id === id)[0]
      )
      state.recipes[index].inBag = !state.recipes[index].inBag
      EnRecipesDB.updateDocument(id, recipe)
    },
    unlinkBrokenImages(state) {
      state.recipes.forEach((r, i) => {
        if (r.imageSrc && !File.exists(r.imageSrc)) {
          r.imageSrc = null
          Object.assign(state.recipes[i], r)
          EnRecipesDB.updateDocument(r.id, r)
        }
      })
    },
    setCuisine(state, value) {
      state.selectedCuisine = value
    },
    setCategory(state, value) {
      state.selectedCategory = value
    },
    setTag(state, value) {
      state.selectedTag = value
    },
  },
  actions: {
    setTheme({ commit }, theme) {
      commit('setTheme', theme)
    },
    clearFilter({ commit }) {
      commit('clearFilter')
    },
    setLayout({ commit }, type) {
      commit('setLayout', type)
    },
    setSortTypeAction({ commit }, sortType) {
      commit('setSortType', sortType)
    },
    initRecipes({ commit }) {
      commit('initRecipes')
    },
    importRecipesAction({ commit }, recipes) {
      commit('importRecipes', recipes)
    },
    addRecipeAction({ commit }, recipe) {
      commit('addRecipe', recipe)
    },
    overwriteRecipeAction({ commit }, updatedRecipe) {
      commit('overwriteRecipe', updatedRecipe)
    },
    deleteRecipeAction({ commit }, recipe) {
      commit('deleteRecipe', recipe)
    },
    deleteRecipesAction({ commit }, ids) {
      commit('deleteRecipes', ids)
    },
    initListItems({ commit }) {
      commit('initListItems')
    },
    importListItemsAction({ commit }, data) {
      commit('importListItems', data)
    },
    addListItemAction({ commit }, item) {
      commit('addListItem', item)
    },
    removeListItemAction({ commit }, item) {
      commit('removeListItem', item)
    },
    resetListItemsAction({ commit }, listName) {
      commit('resetListItems', listName)
    },
    initMealPlans({ commit }) {
      commit('initMealPlans')
    },
    importMealPlansAction({ commit }, mealPlans) {
      commit('importMealPlans', mealPlans)
    },
    addMealPlanAction({ commit }, mealPlan) {
      commit('addMealPlan', mealPlan)
    },
    deleteMealPlanAction({ commit }, mealPlan) {
      commit('deleteMealPlan', mealPlan)
    },
    toggleStateAction({ commit }, toggledRecipe) {
      commit('toggleState', toggledRecipe)
    },
    setRecipeAsTriedAction({ commit }, recipe) {
      commit('setRecipeAsTried', recipe)
    },
    setLastTriedDateAction({ commit }, index) {
      commit('setLastTriedDate', index)
    },
    setComponent({ commit }, comp) {
      commit('setComponent', comp)
    },
    unSyncCombinationsAction({ commit }, combinations) {
      commit('unSyncCombinations', combinations)
    },
    setShakeAction({ commit }, shake) {
      commit('setShake', shake)
    },
    setRatingAction({ commit }, rating) {
      commit('setRating', rating)
    },
    toggleCartAction({ commit }, recipe) {
      commit('toggleCart', recipe)
    },
    unlinkBrokenImages({ commit }) {
      commit('unlinkBrokenImages')
    },
    setCuisine({ commit }, value) {
      commit('setCuisine', value)
    },
    setCategory({ commit }, value) {
      commit('setCategory', value)
    },
    setTag({ commit }, value) {
      commit('setTag', value)
    },
  },
})
