import Vue from 'nativescript-vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import {
  getFileAccess,
  File,
  Application,
  knownFolders,
  path,
} from '@nativescript/core'
import {
  getNumber,
  setNumber,
  getString,
  setString,
} from '@nativescript/core/application-settings'
import { openOrCreate } from '@akylas/nativescript-sqlite'
import * as utils from '~/shared/utils'

// OpenDatabaseFile
const db = openOrCreate(
  path.join(knownFolders.documents().path, 'EnRecipes.db')
)

// Create"recipes"Table
db.execute(
  'CREATE TABLE IF NOT EXISTS recipes (id TEXT PRIMARY KEY, image TEXT, title TEXT, cuisine TEXT, category TEXT, tags TEXT, prepTime TEXT, cookTime TEXT, yieldQuantity TEXT, yieldUnit TEXT, difficulty TEXT, rating INT, ingredients TEXT, instructions TEXT, combinations TEXT, notes TEXT, favorite INT, tried INT, lastTried INT, lastModified INT, created INT)'
)

// Create"lists"Table
db.execute(
  'CREATE TABLE IF NOT EXISTS lists (cuisines TEXT, categories TEXT, yieldUnits TEXT, units TEXT)'
)

// Create"mealPlans"Table
db.execute(
  'CREATE TABLE IF NOT EXISTS mealPlans (id TEXT PRIMARY KEY, date INT, mealType TEXT, recipeID TEXT, quantity INT, note TEXT)'
)

// Create"timerPresets"Table
db.execute(
  'CREATE TABLE IF NOT EXISTS timerPresets (id INT PRIMARY KEY, label TEXT, time TEXT)'
)

const defCuisines = [
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
const defCategories = [
  'Appetizers',
  'Barbecue',
  'Beverages',
  'Breads',
  'breakfast',
  'Desserts',
  'dinner',
  'Healthy',
  'lunch',
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
  'snacks',
  'Soups',
  'Undefined',
  'Vegan',
  'Vegetarian',
]
const defYieldUnits = [
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
const defUnits = [
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
    sort: 1,
    defs: defCuisines,
  },
  categories: {
    sort: 1,
    defs: defCategories,
  },
  yieldUnits: {
    sort: 0,
    defs: defYieldUnits,
  },
  units: {
    sort: 0,
    defs: defUnits,
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
      cog: '\ue900',
      home: '\ue901',
      try: '\ue902',
      tried: '\ue903',
      fav: '\ue904',
      faved: '\ue905',
      menu: '\ue906',
      cuisine: '\ue907',
      category: '\ue908',
      tag: '\ue909',
      star: '\ue90a',
      starred: '\ue90b',
      time: '\ue90c',
      diff: '\ue90d',
      bag: '\ue90e',
      bagged: '\ue90f',
      price: '\ue910',
      sear: '\ue911',
      sort: '\ue912',
      filter: '\ue913',
      plus: '\ue914',
      done: '\ue915',
      back: '\ue916',
      x: '\ue917',
      del: '\ue918',
      save: '\ue919',
      undo: '\ue91a',
      edit: '\ue91b',
      cal: '\ue91c',
      tod: '\ue91d',
      left: '\ue91e',
      right: '\ue91f',
      img: '\ue920',
      uncheck: '\ue921',
      check: '\ue922',
      share: '\ue923',
      timer: '\ue924',
      start: '\ue925',
      pause: '\ue926',
      addTo: '\ue927',
      sound: '\ue928',
      vibrate: '\ue929',
      interface: '\ue92a',
      opts: '\ue92b',
      db: '\ue92c',
      reset: '\ue92d',
      info: '\ue92e',
      lang: '\ue92f',
      theme: '\ue930',
      layout: '\ue931',
      shuf: '\ue932',
      week: '\ue933',
      folder: '\ue934',
      exp: '\ue935',
      imp: '\ue936',
      gh: '\ue937',
      tg: '\ue938',
      help: '\ue939',
      priv: '\ue93a',
      don: '\ue93b',
      trans: '\ue93c',
      delay: '\ue93d',
      ring: '\ue93e',
      print: '\ue93f',
      dup: '\ue940',
      calv: '\ue941',
      mpd: '\ue942',
      madd: '\ue943',
    },
    sortType: 'random',
    language: [
      {
        locale: 'ar',
        title: 'العربية',
        rtl: 1,
      },
      {
        locale: 'da',
        title: 'Dansk',
      },
      {
        locale: 'de',
        title: 'Deutsch',
      },
      {
        locale: 'en-IN',
        title: 'English (IN)',
      },
      {
        locale: 'en-GB',
        title: 'English (UK)',
      },
      {
        locale: 'en-US',
        title: 'English (US)',
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
        locale: 'hi',
        title: 'हिंदी',
      },
      {
        locale: 'id',
        title: 'Indonesia',
      },
      {
        locale: 'it',
        title: 'Italiano',
      },
      // {
      //   locale: 'ja',
      //   title: '日本語',
      // },
      // {
      //   locale: 'ml',
      //   title: 'മലയാളം',
      // },
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
        locale: 'pt-BR',
        title: 'Português (BR)',
      },
      {
        locale: 'ru',
        title: 'Русский',
      },
      {
        locale: 'ta',
        title: 'தமிழ்',
      },
      {
        locale: 'te',
        title: 'తెలుగు',
      },
    ],
    shake: getNumber('shake', 1),
    importSummary: {
      found: 0,
      imported: 0,
      updated: 0,
    },
    layout: getString('layout', 'detailed'),
    selCuisine: null,
    selCategory: null,
    selTag: null,
    theme: 'sysDef',
    mondayFirst: getNumber('mondayFirst', 0),
    timerDelay: getNumber('timerDelay', 1),
    timerSound: {},
    timerVibrate: getNumber('timerVibrate', 0),
    timerPresets: [],
    activeTimers: [],
    FGService: 0,
    RTL: getNumber('RTL', 0),
    plannerView: getString('plannerView', 'wk'),
    planDeletion: getString('planDeletion', 'nvr'),
  },
  mutations: {
    setPlanDeletion(state, s) {
      state.planDeletion = s
      setString('planDeletion', s)
    },
    setPlannerView(state, s) {
      state.plannerView = s
      setString('plannerView', s)
    },
    setRTL(state) {
      state.RTL = getNumber('RTL', 0)
    },
    setFGService(state, val) {
      state.FGService = val
    },
    addTimerPreset(state, timer) {
      let i = state.timerPresets.findIndex((e) => e.id == timer.id)
      if (state.timerPresets.some((e) => e.id == timer.id)) {
        state.timerPresets.splice(i, 1, timer)
      } else state.timerPresets.push(timer)
      db.execute(
        `REPLACE INTO timerPresets (id, label, time) VALUES (?, ?, ?)`,
        [timer.id, timer.label, timer.time]
      )
    },
    deleteTimerPreset(state, i) {
      let id = state.timerPresets[i]
      state.timerPresets.splice(i, 1)
      db.execute(`DELETE FROM timerPresets WHERE id = ${id}`)
    },
    initTimerPresets(state) {
      if (!state.timerPresets.length)
        db.select(`SELECT * FROM timerPresets`).then((res) => {
          res.forEach((t) => {
            t.recipeID = 0
            t.timerInt = 0
            t.isPaused = 0
            t.preset = 1
            t.done = 0
            state.timerPresets.push(t)
          })
        })
    },
    importTimerPresets(state, timers) {
      let newPresets = timers.filter(
        (e) => !state.timerPresets.some((f) => f.id === e.id)
      )
      newPresets.forEach((t) => {
        db.execute(
          `INSERT INTO timerPresets (id, label, time) VALUES (?, ?, ?)`,
          [t.id, t.label, t.time]
        )
        state.timerPresets.push(t)
      })
    },
    clearTimerInterval(state) {
      state.activeTimers.forEach((e) => {
        clearInterval(e.timerInt)
        e.timerInt = 0
      })
    },
    addActiveTimer(state, { timer, i }) {
      state.activeTimers.splice(i, 0, timer)
    },
    sortActiveTimers(state) {
      let a = state.activeTimers.reduce((acc, e) => {
        ;(acc[e.recipeID] = acc[e.recipeID] || []).push(e)
        return acc
      }, {})
      state.activeTimers = [...(<any>Object).values(a).flat(2)]
    },
    updateActiveTimer(state, timer) {
      let i = state.activeTimers.findIndex((e) => e.id == timer.id)
      state.activeTimers.splice(i, 1, timer)
    },
    removeActiveTimer(state, i) {
      state.activeTimers.splice(i, 1)
    },
    setTimerDelay(state, n: number) {
      state.timerDelay = n
      setNumber('timerDelay', n)
    },
    setTimerSound(state, sound) {
      state.timerSound = sound
      setString('timerSound', JSON.stringify(sound))
    },
    setTimerVibrate(state, n) {
      state.timerVibrate = n
      setNumber('timerVibrate', n)
    },
    clearImportSummary(state) {
      for (const key in state.importSummary) state.importSummary[key] = 0
    },
    setFirstDay(state, n) {
      state.mondayFirst = n
      setNumber('mondayFirst', n)
    },
    setTheme(state, theme) {
      switch (theme) {
        case 'sysDef':
          state.theme =
            Application.systemAppearance() == 'dark' ? 'Dark' : 'Light'
          break
        case 'sysDefB':
          state.theme =
            Application.systemAppearance() == 'dark' ? 'Black' : 'Light'
          break
        default:
          state.theme = theme
          break
      }
      setString('theme', theme)
    },
    clearFilter(state) {
      state.selCuisine = state.selCategory = state.selTag = null
    },
    setLayout(state, type) {
      state.layout = type
    },
    setSortType(state, sortType) {
      state.sortType = sortType
    },
    initRecipes(state) {
      if (!state.recipes.length) {
        db.select('SELECT * FROM recipes').then((res) => {
          res.forEach((e) => {
            Object.keys(e).forEach(
              (f) =>
                f.match(/tags|ingredients|instructions|combinations|notes/) &&
                (e[f] = JSON.parse(e[f]))
            )
            state.recipes.push(e)
          })
        })
      }
      state.shake = getNumber('shake', 1)
      state.sortType = getString('sortType', 'random')
    },
    importRecipesFromJSON(state, recipes) {
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
          if (r.imageSrc) {
            r.image = r.imageSrc.replace('enrecipes', 'EnRecipes')
            delete r.imageSrc
          }
          if (!r.hasOwnProperty('cuisine')) r.cuisine = 'Undefined'
          if (!r.hasOwnProperty('tags')) r.tags = []
          if (!r.hasOwnProperty('difficulty')) r.difficulty = 'Easy'
          if (!r.hasOwnProperty('rating')) r.rating = 0
          if (!r.hasOwnProperty('created')) r.created = r.lastModified
          r.yieldQuantity = r.yield.quantity
          r.yieldUnit = r.yield.unit
          delete r.yield
          function getTime(d) {
            return new Date(d).getTime()
          }
          r.lastTried = getTime(r.lastTried)
          r.lastModified = getTime(r.lastModified)
          r.created = getTime(r.created)
          r.favorite = r.favorite | 0
          r.tried = r.tried | 0
          return r
        })
      }
      function createDocuments(data) {
        data = getUpdatedData(data)
        state.recipes = [...state.recipes, ...data]
        data.forEach((r) => {
          imported++
          db.execute(
            `INSERT INTO recipes (id, image, title, cuisine, category, tags, prepTime, cookTime, yieldQuantity, yieldUnit, difficulty, rating, ingredients, instructions, combinations, notes, favorite, tried, lastTried, lastModified, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              r.id,
              r.image,
              r.title,
              r.cuisine,
              r.category,
              JSON.stringify(r.tags),
              r.prepTime,
              r.cookTime,
              r.yieldQuantity,
              r.yieldUnit,
              r.difficulty,
              r.rating,
              JSON.stringify(r.ingredients),
              JSON.stringify(r.instructions),
              JSON.stringify(r.combinations),
              JSON.stringify(r.notes),
              r.favorite,
              r.tried,
              r.lastTried,
              r.lastModified,
              r.created,
            ]
          )
        })
      }
      function updateDocuments(data) {
        data = getUpdatedData(data)
        data.forEach((r) => {
          let recipeIndex = state.recipes
            .map((e, i) => {
              let d1 = new Date(e.lastModified).getTime()
              let d2 = new Date(r.lastModified).getTime()
              return e.id === r.id && d1 < d2 ? i : -1
            })
            .filter((e) => e >= 0)[0]
          if (recipeIndex >= 0) {
            updated++
            Object.assign(state.recipes[recipeIndex], r)
            db.execute(
              `REPLACE INTO recipes (id, image, title, cuisine, category, tags, prepTime, cookTime, yieldQuantity, yieldUnit, difficulty, rating, ingredients, instructions, combinations, notes, favorite, tried, lastTried, lastModified, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                r.id,
                r.image,
                r.title,
                r.cuisine,
                r.category,
                JSON.stringify(r.tags),
                r.prepTime,
                r.cookTime,
                r.yieldQuantity,
                r.yieldUnit,
                r.difficulty,
                r.rating,
                JSON.stringify(r.ingredients),
                JSON.stringify(r.instructions),
                JSON.stringify(r.combinations),
                JSON.stringify(r.notes),
                r.favorite,
                r.tried,
                r.lastTried,
                r.lastModified,
                r.created,
              ]
            )
          }
        })
      }
      if (state.recipes.length) {
        localRecipesIDs = state.recipes.map((e) => e.id)
        partition = recipes.reduce(
          (result, recipe) => {
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
    importRecipesFromDB(state, recipes) {
      let localRecipesIDs: string[], partition: any[]
      let imported = 0
      let updated = 0
      function createDocuments(data: any[]) {
        data.forEach((r) => {
          const cols = Object.keys(r).join(', ')
          const placeholder = Object.keys(r)
            .fill('?')
            .join(', ')
          imported++
          db.execute(
            `REPLACE INTO recipes (${cols}) VALUES (${placeholder})`,
            Object.values(r)
          )
          Object.keys(r).forEach(
            (f) =>
              f.match(/tags|ingredients|instructions|combinations|notes/) &&
              (r[f] = JSON.parse(r[f]))
          )
          state.recipes.push(r)
        })
      }
      function updateDocuments(data: any[]) {
        data.forEach((r) => {
          let recipeIndex = state.recipes
            .map((e, i) => {
              let d1 = new Date(e.lastModified).getTime()
              let d2 = new Date(r.lastModified).getTime()
              return e.id === r.id && d1 < d2 ? i : -1
            })
            .filter((e) => e >= 0)[0]
          if (recipeIndex >= 0) {
            updated++
            const cols = Object.keys(r).join(', ')
            const placeholder = Object.keys(r)
              .fill('?')
              .join(', ')
            db.execute(
              `REPLACE INTO recipes (${cols}) VALUES (${placeholder})`,
              Object.values(r)
            )
            Object.keys(r).forEach(
              (f) =>
                f.match(/tags|ingredients|instructions|combinations|notes/) &&
                (r[f] = JSON.parse(r[f]))
            )
            Object.assign(state.recipes[recipeIndex], r)
          }
        })
      }
      if (state.recipes.length) {
        localRecipesIDs = state.recipes.map((e) => e.id)
        partition = recipes.reduce(
          (result, recipe) => {
            localRecipesIDs.indexOf(recipe.id) < 0
              ? result[0].push(recipe) // create candidates
              : result[1].push(recipe) // update candidates
            return result
          },
          [[], []]
        )
        if (partition[0].length) createDocuments(partition[0])
        if (partition[1].length) updateDocuments(partition[1])
      } else createDocuments(recipes)
      state.importSummary.found = recipes.length
      state.importSummary.imported = imported
      state.importSummary.updated = updated
    },
    addRecipe(state, recipe) {
      let r = JSON.parse(JSON.stringify(recipe))
      Object.keys(recipe).forEach((e) => {
        if (e.match(/tags|ingredients|instructions|combinations|notes/))
          r[e] = JSON.stringify(r[e])
        if (e.match(/favorite|tried/)) r[e] = r[e] ? 1 : 0
      })
      const cols = Object.keys(recipe).join(', ')
      const placeholder = Object.keys(recipe)
        .fill('?')
        .join(', ')
      db.execute(
        `REPLACE INTO recipes (${cols}) VALUES (${placeholder})`,
        Object.values(r)
      )
      let i: number
      function exist({ id }, index: number) {
        if (id === recipe.id) {
          i = index
          return 1
        }
        return 0
      }
      state.recipes.some(exist)
        ? Object.assign(state.recipes[i], recipe)
        : state.recipes.push(recipe)
    },
    deleteRecipes(state, ids) {
      ids.forEach((id: string) => {
        let i = state.recipes.findIndex((e) => e.id === id)
        getFileAccess().deleteFile(state.recipes[i].image)
        state.recipes.splice(i, 1)
        db.execute(`DELETE FROM recipes WHERE id = '${id}'`)
        state.recipes.forEach((e, i) => {
          if (e.combinations.includes(id)) {
            state.recipes[i].combinations.splice(e.combinations.indexOf(id), 1)
            db.execute(
              `UPDATE recipes SET combinations = '${JSON.stringify(
                state.recipes[i].combinations
              )}' WHERE id = '${id}'`
            )
          }
        })
      })
    },
    initListItems(state) {
      if (!state.cuisines.length) {
        db.select(`SELECT * FROM lists`).then((res) => {
          if (!res.length) {
            db.execute(
              `INSERT INTO lists (cuisines, categories, yieldUnits, units) VALUES (?, ?, ?, ?)`,
              [null, null, null, null]
            )
          }

          db.select(`SELECT * FROM lists`).then((res) => {
            Object.keys(res[0]).forEach((list) => {
              let userItems: string[]
              let defs = listItems[list].defs
              if (res[0][list]) {
                userItems = JSON.parse(res[0][list])
                state[list] = userItems.some((e: string) => defs.includes(e))
                  ? userItems
                  : [...defs, ...userItems]
              } else {
                state[list] = defs
                listItems[list].sort && state[list].sort()
              }
            })
          })
        })
      }
    },
    importListItems(state, { data, listName }) {
      state[listName] = [...new Set([...state[listName], ...data])]
      if (listItems[listName].sort) state[listName].sort()
      db.execute(
        `UPDATE lists SET ${listName} = '${JSON.stringify(state[listName])}'`
      )
    },
    addListItem(state, { item, listName }) {
      let lowercase = state[listName].map((e: string) => e.toLowerCase())
      if (lowercase.indexOf(item.toLowerCase()) == -1) {
        state[listName].push(item)
        if (listItems[listName].sort)
          state[listName].sort((a: string, b: string) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
          )
        db.execute(
          `UPDATE lists SET ${listName} = '${JSON.stringify(state[listName])}'`
        )
      }
    },
    removeListItem(state, { item, listName }) {
      state[listName].splice(state[listName].indexOf(item), 1)
      db.execute(
        `UPDATE lists SET ${listName} = '${JSON.stringify(state[listName])}'`
      )
    },
    resetListItems(state, listName) {
      let defs = listItems[listName].defs
      state[listName] = [...defs]
      if (listItems[listName].sort)
        state[listName].sort((a: string, b: string) =>
          a.toLowerCase().localeCompare(b.toLowerCase())
        )
      db.execute(
        `UPDATE lists SET ${listName} = '${JSON.stringify(state[listName])}'`
      )
    },
    initMealPlans(state) {
      if (!state.mealPlans.length) {
        let c = state.planDeletion
        let date = new Date()
        let d = new Date()
        if (c != 'nvr') {
          d.setHours(0, 0, 0, 0)
          let ld =
            c == 'otay'
              ? 365
              : c == 'otam'
              ? new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
              : 7
          d.setDate(d.getDate() - ld)
        }

        db.select(`SELECT * FROM mealPlans`).then((res) =>
          res.forEach((p: any) => {
            if (p.date < d.getTime())
              // DeletingOldMealPlans
              db.execute(`DELETE FROM mealPlans WHERE id = '${p.id}'`)
            else state.mealPlans.push(p)
          })
        )
      }
    },
    importMealPlansFromJSON(state, mealPlans) {
      let updatedMealPlans = []
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
            return f.recipeID == e.title && f.date == date && f.mealType == type
          })
        } else {
          return !state.mealPlans.some(
            (f) =>
              f.recipeID == e.title && f.date == e.date && f.mealType == e.type
          )
        }
      })
      newMealPlans.forEach((p) => {
        p.id = utils.getRandomID()
        p.recipeID = p.title
        p.quantity = 1
        p.note = null
        if (p.hasOwnProperty('eventColor')) {
          let d = new Date(p.startDate)
          p.date = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            0
          ).getTime()
          switch (d.getHours()) {
            case 0:
              p.mealType = 'breakfast'
              break
            case 5:
              p.mealType = 'lunch'
              break
            case 10:
              p.mealType = 'dinner'
              break
            case 15:
              p.mealType = 'snacks'
              break
          }
          delete p.title
          delete p.startDate
          delete p.endDate
          delete p.eventColor
        } else {
          p.mealType = p.type
          delete p.type
          delete p.title
        }
        updatedMealPlans.push(p)
      })
      state.mealPlans = [...state.mealPlans, ...updatedMealPlans]
      updatedMealPlans.forEach((p) => {
        db.execute(
          `INSERT INTO mealPlans (id, date, mealType, recipeID, quantity, note) VALUES (?, ?, ?, ?, ?, ?)`,
          [p.id, p.date, p.mealType, p.recipeID, p.quantity, p.note]
        )
      })
    },
    importMealPlansFromDB(state, mealPlans) {
      let newMealPlans = mealPlans.filter(
        (e) =>
          !state.mealPlans.some((f) =>
            Object.keys(f).every((key) => f[key] == e[key])
          )
      )
      state.mealPlans = [...state.mealPlans, ...newMealPlans]
      newMealPlans.forEach((p) => {
        db.execute(
          `INSERT INTO mealPlans (id, date, mealType, recipeID, quantity, note) VALUES (?, ?, ?, ?, ?, ?)`,
          [p.id, p.date, p.mealType, p.recipeID, p.quantity, p.note]
        )
      })
    },
    addMealPlan(state, { plan, index, inDB }) {
      let mealPlan = {
        id: plan.id,
        date: plan.date,
        mealType: plan.mealType,
        recipeID: plan.recipeID,
        quantity: plan.quantity,
        note: plan.note,
      }
      if (inDB) {
        const cols = Object.keys(mealPlan).join(', ')
        const placeholder = Object.keys(mealPlan)
          .fill('?')
          .join(', ')
        db.execute(
          `REPLACE INTO mealPlans (${cols}) VALUES (${placeholder})`,
          Object.values(mealPlan)
        )
        if (index === null) state.mealPlans.push(mealPlan)
      } else {
        state.mealPlans.splice(index, 0, mealPlan)
      }
    },
    deleteMealPlan(state, { id, index, inDB }) {
      if (inDB) {
        db.execute(`DELETE FROM mealPlans WHERE id = '${id}'`)
      } else {
        state.mealPlans.splice(index, 1)
        state.mealPlans = [...state.mealPlans]
      }
    },
    toggleState(state, { id, key, setDate }) {
      let i = state.recipes.findIndex((e) => e.id == id)
      state.recipes[i][key] = state.recipes[i][key] ? 0 : 1
      db.execute(
        `UPDATE recipes SET ${key} = ${state.recipes[i][key]} WHERE id = '${id}'`
      )
      if (setDate) {
        state.recipes[i].lastTried = new Date().getTime()
        db.execute(
          `UPDATE recipes SET lastTried = ${state.recipes[i].lastTried} WHERE id = '${id}'`
        )
      }
    },
    unSyncCombinations(state, { id, combinations }) {
      state.recipes.forEach((e, i) => {
        if (combinations.includes(e.id)) {
          state.recipes[i].combinations.splice(e.combinations.indexOf(id), 1)
          db.execute(
            `UPDATE recipes SET combinations = '${JSON.stringify(
              state.recipes[i].combinations
            )}' WHERE id = '${id}'`
          )
        }
      })
    },
    setShake(state, n) {
      state.shake = n
      setNumber('shake', n)
    },
    setRating(state, { id, rating }) {
      let i = state.recipes.findIndex((e) => e.id == id)
      state.recipes[i].rating = rating
      db.execute(`UPDATE recipes SET rating = ${rating} WHERE id = '${id}'`)
    },
    toggleCart(state, { id }) {
      let i = state.recipes.indexOf(state.recipes.filter((e) => e.id === id)[0])
      state.recipes[i].inBag = !state.recipes[i].inBag
    },
    unlinkBrokenImages(state) {
      state.recipes.forEach((r, i) => {
        if (r.image && !File.exists(r.image)) {
          r.image = null
          Object.assign(state.recipes[i], r)
          db.execute(`UPDATE recipes SET image = null WHERE id = '${r.id}'`)
        }
      })
    },
    setCuisine(state, value) {
      state.selCuisine = value
    },
    setCategory(state, value) {
      state.selCategory = value
    },
    setTag(state, value) {
      state.selTag = value
    },
  },
  actions: {
    setPlanDeletion({ commit }, s) {
      commit('setPlanDeletion', s)
    },
    setPlannerView({ commit }, s) {
      commit('setPlannerView', s)
    },
    setRTL({ commit }) {
      commit('setRTL')
    },
    sortActiveTimers({ commit }) {
      commit('sortActiveTimers')
    },
    setFGService({ commit }, val) {
      commit('setFGService', val)
    },
    addTimerPreset({ commit }, timer) {
      commit('addTimerPreset', timer)
    },
    deleteTimerPreset({ commit }, timer) {
      commit('deleteTimerPreset', timer)
    },
    initTimerPresets({ commit }) {
      commit('initTimerPresets')
    },
    importTimerPresets({ commit }, timers) {
      commit('importTimerPresets', timers)
    },
    clearTimerInterval({ commit }) {
      commit('clearTimerInterval')
    },
    addActiveTimer({ commit }, timer) {
      commit('addActiveTimer', timer)
    },
    updateActiveTimer({ commit }, timer) {
      commit('updateActiveTimer', timer)
    },
    removeActiveTimer({ commit }, i) {
      commit('removeActiveTimer', i)
    },
    setTimerDelay({ commit }, n) {
      commit('setTimerDelay', n)
    },
    setTimerSound({ commit }, sound) {
      commit('setTimerSound', sound)
    },
    setTimerVibrate({ commit }, n) {
      commit('setTimerVibrate', n)
    },
    clearImportSummary({ commit }) {
      commit('clearImportSummary')
    },
    setFirstDay({ commit }, n) {
      commit('setFirstDay', n)
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
    importRecipesFromJSON({ commit }, recipes) {
      commit('importRecipesFromJSON', recipes)
    },
    importRecipesFromDB({ commit }, recipes) {
      commit('importRecipesFromDB', recipes)
    },
    addRecipeAction({ commit }, recipe) {
      commit('addRecipe', recipe)
    },
    deleteRecipes({ commit }, ids) {
      commit('deleteRecipes', ids)
    },
    initListItems({ commit }) {
      commit('initListItems')
    },
    importListItems({ commit }, data) {
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
    importMealPlansFromJSON({ commit }, mealPlans) {
      commit('importMealPlansFromJSON', mealPlans)
    },
    importMealPlansFromDB({ commit }, mealPlans) {
      commit('importMealPlansFromDB', mealPlans)
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
    unSyncCombinationsAction({ commit }, combinations) {
      commit('unSyncCombinations', combinations)
    },
    setShake({ commit }, n) {
      commit('setShake', n)
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
