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
      back: '\ue900',
      bag: '\ue901',
      bagged: '\ue902',
      cal: '\ue903',
      category: '\ue904',
      check: '\ue905',
      cog: '\ue906',
      cuisine: '\ue907',
      db: '\ue908',
      del: '\ue909',
      diff: '\ue90a',
      don: '\ue90b',
      done: '\ue90c',
      edit: '\ue90d',
      exp: '\ue90e',
      fav: '\ue90f',
      faved: '\ue910',
      filter: '\ue911',
      folder: '\ue912',
      gh: '\ue913',
      help: '\ue914',
      home: '\ue915',
      img: '\ue916',
      imp: '\ue917',
      info: '\ue918',
      interface: '\ue919',
      lang: '\ue91a',
      layout: '\ue91b',
      left: '\ue91c',
      menu: '\ue91d',
      opts: '\ue91e',
      plus: '\ue91f',
      price: '\ue920',
      priv: '\ue921',
      reset: '\ue922',
      right: '\ue923',
      save: '\ue924',
      sear: '\ue925',
      share: '\ue926',
      shuf: '\ue927',
      sort: '\ue928',
      star: '\ue929',
      starred: '\ue92a',
      tag: '\ue92b',
      tg: '\ue92c',
      theme: '\ue92d',
      time: '\ue92e',
      tod: '\ue92f',
      trans: '\ue930',
      tried: '\ue931',
      try: '\ue932',
      uncheck: '\ue933',
      undo: '\ue934',
      week: '\ue935',
      x: '\ue936',
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
    mondayFirst: false,
  },
  mutations: {
    clearImportSummary(state) {
      for (const key in state.importSummary) state.importSummary[key] = 0
    },
    setFirstDay(state, bool) {
      state.mondayFirst = bool
      ApplicationSettings.setBoolean('mondayFirst', bool)
    },
    setTheme(state, theme) {
      state.appTheme = theme
      ApplicationSettings.setString('appTheme', theme)
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
      ApplicationSettings.setBoolean('shakeEnabled', shake)
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
    clearImportSummary({ commit }) {
      commit('clearImportSummary')
    },
    setFirstDay({ commit }, bool) {
      commit('setFirstDay', bool)
    },
    setTheme({ commit }, theme) {
      commit('setTheme', theme)
    },
    clearFilter({ commit }) {
      commit('clearFilter')
    },
    setLayout({ commit }, type) {
      commit('setLayout', type)
    },
    setSortType({ commit }, sortType) {
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
    setShake({ commit }, shake) {
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
