<template>
  <Page @loaded="pgLoad" @unloaded="onPageUnload" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="auto, *, auto">
      <ScrollView rowSpan="2" colSpan="3" @scroll="!showUndo && svLoad($event)">
        <StackLayout padding="0 16 72">
          <RLabel
            class="pTitle tw tb"
            padding="16 0 24"
            :text="`${title}` | L"
          />
          <Image
            margin="0 0 32"
            v-if="recipe.image"
            :src="recipe.image"
            stretch="aspectFit"
            class="imgHolder"
            :width="screenWidth - 32"
            :height="screenWidth - 32"
            @tap="imageHandler"
          />
          <Button
            v-else
            margin="0 0 32"
            class="ico imgHolder"
            fontSize="128"
            :width="screenWidth - 32"
            :height="screenWidth - 32"
            :text="icon.img"
            @tap="imageHandler"
          />
          <!-- OVERVIEW -->
          <StackLayout class="inputC">
            <Label class="fLabel" :text="'title' | L" />
            <TextField
              :hint="'recTitle' | L"
              v-model="recipe.title"
              autocapitalizationType="words"
              autocorrect="true"
              @returnPress="showCuisine(1)"
            />
          </StackLayout>
          <RGridLayout :rtl="RTL" class="" columns="*, 8, *">
            <StackLayout class="inputC">
              <Label class="fLabel" :text="'cui' | L" />
              <TextField
                @loaded="setGravity"
                :text="recipe.cuisine | L"
                editable="false"
                @tap="showCuisine(0)"
              />
            </StackLayout>
            <StackLayout class="inputC" col="2">
              <Label class="fLabel" :text="'cat' | L" />
              <TextField
                @loaded="setGravity"
                :text="recipe.category | L"
                editable="false"
                @tap="showCategories(0)"
              />
            </StackLayout>
          </RGridLayout>
          <StackLayout class="inputC">
            <Label class="fLabel" :text="'ts' | L" />
            <TextField
              ref="tags"
              autocapitalizationType="words"
              autocorrect="true"
              :hint="'tsInfo' | L"
              v-model="tags"
              @textChange="splitTags"
              @loaded="setGravity"
              @returnPress="setTimeRequired(1, 'prepTime')"
            />
          </StackLayout>
          <RGridLayout :rtl="RTL" columns="*, 8, *">
            <StackLayout class="inputC">
              <Label class="fLabel" :text="'prepT' | L" />
              <TextField
                @loaded="setGravity"
                :text="timeRequired('prepTime')"
                editable="false"
                @tap="setTimeRequired(0, 'prepTime')"
              />
            </StackLayout>
            <StackLayout class="inputC" col="2">
              <Label class="fLabel" :text="'cookT' | L" />
              <TextField
                @loaded="setGravity"
                :text="timeRequired('cookTime')"
                editable="false"
                @tap="setTimeRequired(0, 'cookTime')"
              />
            </StackLayout>
          </RGridLayout>
          <RGridLayout :rtl="RTL" columns="*, 8, *">
            <StackLayout class="inputC">
              <Label class="fLabel" :text="'yieldQ' | L" />
              <TextField
                @loaded="setGravity"
                ref="yieldQ"
                v-model="recipe.yieldQuantity"
                hint="1"
                keyboardType="number"
                returnKeyType="next"
                @returnPress="showYieldUnits(1)"
              />
            </StackLayout>
            <StackLayout class="inputC" col="2">
              <Label class="fLabel" :text="'yieldU' | L" />
              <TextField
                @loaded="setGravity"
                :text="`${recipe.yieldUnit}` | L"
                editable="false"
                @tap="showYieldUnits(0)"
              />
            </StackLayout>
          </RGridLayout>
          <GridLayout columns="*, 8, *">
            <StackLayout class="inputC" :col="RTL ? 2 : 0">
              <Label class="fLabel" :text="'Difficulty level' | L" />
              <TextField
                @loaded="setGravity"
                :text="`${recipe.difficulty}` | L"
                editable="false"
                @tap="showDifficultyLevel(0)"
              />
            </StackLayout>
          </GridLayout>
          <!-- INGREDIENTS -->
          <Label
            :text="getTitleCount('ings', 'ingredients')"
            padding="0"
            class="section t2 tb tw"
          />
          <RGridLayout
            :rtl="RTL"
            columns="auto,8,auto,8,*,auto"
            v-for="(item, i) in recipe.ingredients"
            :key="item.key"
          >
            <TextField
              v-if="item.type"
              :ref="'ing' + i"
              width="52"
              @focus="setFocus(i)"
              @blur="setFocus(-1)"
              keyboardType="number"
              returnKeyType="next"
              hint="1.00"
              v-model="recipe.ingredients[i].quantity"
            />
            <TextField
              v-if="item.type"
              width="68"
              col="2"
              :text="`${recipe.ingredients[i].unit}` | L"
              editable="false"
              @focus="showUnits(1, i)"
              @tap="showUnits(0, i)"
            />
            <TextField
              :ref="'ing' + i"
              @focus="setFocus(i)"
              @blur="setFocus(-1)"
              autocapitalizationType="sentence"
              autocorrect="true"
              returnKeyType="done"
              :col="item.type ? 4 : 0"
              :colSpan="item.type ? 1 : 5"
              v-model="recipe.ingredients[i].value"
              :hint="getIngPos(i)"
              @returnPress="addIng(1)"
            />
            <Button col="5" class="ico si" :text="icon.x" @tap="rmIng(i)" />
          </RGridLayout>
          <RStackLayout :rtl="RTL" class="ingActions">
            <Button
              class="text tb big hal fb"
              :class="{ r: RTL }"
              :text="'aIngBtn' | L"
              @tap="addIng(1)"
            />
            <Button
              class="text tb big hal fb"
              :class="{ r: RTL }"
              :text="'addSectBtn' | L"
              @tap="addIng(0)"
            />
          </RStackLayout>
          <!-- INSTRUCTIONS -->
          <Label
            :text="getTitleCount('inss', 'instructions')"
            padding="0"
            class="section t2 tb tw"
          />
          <RGridLayout
            :rtl="RTL"
            columns="*,auto"
            v-for="(item, i) in recipe.instructions"
            :key="item.key"
          >
            <TextField
              :ref="'ins' + i"
              v-if="!item.type"
              @focus="setFocus(i)"
              @blur="setFocus(-1)"
              autocapitalizationType="sentence"
              autocorrect="true"
              :hint="getInsPos(i)"
              v-model="recipe.instructions[i].value"
              @returnPress="addIns(1)"
              returnKeyType="done"
            />
            <TextView
              :ref="'ins' + i"
              v-else
              @focus="setFocus(i)"
              @blur="setFocus(-1)"
              autocapitalizationType="multiLine"
              autocorrect="true"
              :hint="getInsPos(i)"
              v-model="recipe.instructions[i].value"
            />
            <Button col="1" class="ico si" :text="icon.x" @tap="rmIns(i)" />
          </RGridLayout>
          <RStackLayout :rtl="RTL" class="ingActions">
            <Button
              class="text tb big hal fb"
              :class="{ r: RTL }"
              :text="'aStpBtn' | L"
              @tap="addIns(1)"
            />
            <Button
              class="text tb big hal fb"
              :class="{ r: RTL }"
              :text="'addSectBtn' | L"
              @tap="addIns(0)"
            />
          </RStackLayout>

          <!-- COMBINATIONS -->
          <Label
            :text="getTitleCount('cmbs', 'combinations')"
            padding="0"
            class="section t2 tb tw"
          />
          <RGridLayout
            :rtl="RTL"
            columns="*,auto"
            v-for="(combination, index) in recipe.combinations"
            :key="'cmbs' + index"
          >
            <TextField
              @loaded="setGravity"
              class="combField"
              :text="getCombinationTitle(combination)"
              editable="false"
            />
            <Button
              col="1"
              class="ico si"
              :text="icon.x"
              @tap="removeCombination(combination)"
            />
          </RGridLayout>
          <Button
            class="text tb big hal fb"
            :class="{ r: RTL }"
            :text="'addCmbBtn' | L"
            @tap="showCombinations"
          />
          <!-- NOTES -->
          <Label
            :text="getTitleCount('nos', 'notes')"
            padding="0"
            class="section t2 tb tw"
          />
          <RGridLayout
            :rtl="RTL"
            columns="*, auto"
            v-for="(item, i) in recipe.notes"
            :key="item.key"
          >
            <TextView
              :ref="'note' + i"
              @focus="setFocus(i)"
              @blur="setFocus(-1)"
              autocapitalizationType="multiLine"
              autocorrect="true"
              :hint="`${$options.filters.L('no')} ${i + 1}`"
              v-model="recipe.notes[i].value"
            />
            <Button
              col="1"
              class="ico si"
              :text="icon.x"
              @tap="removeNote(i)"
            />
          </RGridLayout>
          <Button
            class="text tb big hal fb"
            :class="{ r: RTL }"
            :text="'aNoBtn' | L"
            @tap="addNote"
          />
        </StackLayout>
      </ScrollView>
      <RGridLayout
        :rtl="RTL && hasChanges"
        row="1"
        @loaded="abLoad"
        :hidden="showUndo"
        class="appbar"
        :col="RTL ? (hasChanges ? 0 : 2) : 0"
        :colSpan="hasChanges ? 3 : 1"
        columns="auto, *, auto"
      >
        <Button
          class="ico"
          :class="{ f: RTL }"
          :text="icon.back"
          @tap="navigateBack(0)"
        />
        <Button
          v-if="hasChanges && !saving"
          class="ico fab"
          :text="icon.save"
          col="2"
          @tap="saveOperation"
        />
        <ActivityIndicator col="2" v-if="saving" :busy="saving" />
      </RGridLayout>
      <SnackBar
        :hidden="!showUndo"
        colSpan="2"
        :count="countdown"
        :msg="snackMsg"
        :undo="undoDel"
        :action="hideBar"
        :onload="sbLoad"
      />
      <Label
        rowSpan="2"
        colSpan="3"
        class="edge hal"
        :class="{ 'f r': RTL }"
        @swipe="swipeBack($event, navigateBack)"
      />
      <Label
        rowSpan="2"
        colSpan="3"
        class="edge har rtl f"
        @swipe="swipeBack($event, navigateBack)"
      />
    </GridLayout>
  </Page>
</template>

<script>
import {
  AndroidApplication,
  File,
  getFileAccess,
  ImageSource,
  knownFolders,
  path,
  Screen,
  Utils,
  Observable,
  Frame,
  Application,
} from "@nativescript/core";
import { getString, setString } from "@nativescript/core/application-settings";
import { localize } from "@nativescript/localize";
import { ImageCropper } from "nativescript-imagecropper";
import { mapState, mapActions } from "vuex";
import EnRecipes from "./EnRecipes.vue";
import Action from "./modals/Action";
import ActionWithSearch from "./modals/ActionWithSearch";
import Confirm from "./modals/Confirm";
import Prompt from "./modals/Prompt";
import TimePickerHM from "./modals/TimePickerHM";
import * as utils from "~/shared/utils";
import SnackBar from "./sub/SnackBar";
let barTimer;
export default {
  components: {
    SnackBar,
  },
  props: ["recipeID", "filterFavourites", "filterTrylater", "dupRecipe"],
  data() {
    return {
      title: "newRec",
      recipe: {
        id: this.recipeID || utils.getRandomID(0),
        image: null,
        title: null,
        cuisine: "Undefined",
        category: "Undefined",
        tags: [],
        prepTime: "00:00",
        cookTime: "00:00",
        yieldQuantity: null,
        yieldUnit: "Serving",
        difficulty: "Easy",
        rating: 0,
        ingredients: [],
        instructions: [],
        combinations: [],
        notes: [],
        favorite: 0,
        tried: 1,
        lastTried: null,
        lastModified: null,
        created: null,
      },
      tempRecipe: {},
      tags: undefined,
      modalOpen: 0,
      saving: 0,
      cacheImagePath: null,
      unLinkCombs: [],
      difficultyLevels: ["Easy", "Moderate", "Challenging"],
      appbar: null,
      snackbar: null,
      scrollPos: 1,
      countdown: 5,
      snackMsg: null,
      showUndo: 0,
      undo: 0,
      fi: 0,
    };
  },
  computed: {
    ...mapState([
      "icon",
      "units",
      "yieldUnits",
      "recipes",
      "cuisines",
      "categories",
      "selCuisine",
      "selCategory",
      "selTag",
      "theme",
      "RTL",
    ]),
    screenWidth() {
      return Screen.mainScreen.widthDIPs;
    },
    hasChanges() {
      return JSON.stringify(this.recipe) != JSON.stringify(this.tempRecipe);
    },
    hasBackStack() {
      return Frame.topmost().backStack.length;
    },
  },
  methods: {
    ...mapActions(["addR", "addLI", "unLinkCs"]),
    pgLoad({ object }) {
      object.bindingContext = new Observable();
      this.hijackBackEvent();
    },
    onPageUnload() {
      this.releaseBackEvent();
    },
    abLoad(args) {
      this.appbar = args.object;
    },
    sbLoad({ object }) {
      this.snackbar = object;
    },
    svLoad(args) {
      let scrollUp;
      let y = args.scrollY;
      if (y) {
        scrollUp = y < this.scrollPos;
        this.scrollPos = Math.abs(y);
        let ab = this.appbar.translateY;
        if (!scrollUp && ab == 0) this.animateBar(this.appbar, 0);
        else if (scrollUp && ab == 64) {
          Utils.ad.dismissSoftInput();
          this.animateBar(this.appbar, 1);
        }
      }
    },

    // PHOTO HANDLERS
    imageHandler() {
      if (this.recipe.image) {
        this.$showModal(Action, {
          props: {
            title: "recPic",
            list: ["aap", "rp"],
          },
        }).then((action) => {
          switch (action) {
            case "aap":
              this.imagePicker();
              break;
            case "rp":
              this.recipe.image = null;
              break;
          }
        });
      } else this.imagePicker();
    },
    imagePicker() {
      let aT = this.theme;
      utils.getRecipePhoto().then((uri) => {
        if (uri != null) {
          this.cacheImagePath = path.join(
            knownFolders.temp().path,
            `${utils.getRandomID(0)}.jpg`
          );
          utils
            .copyPhotoToCache(uri.toString(), this.cacheImagePath)
            .then((imgPath) => {
              if (imgPath) {
                ImageSource.fromFile(imgPath).then((image) => {
                  ImageCropper.prototype
                    .show(
                      image,
                      {
                        width: 1080,
                        height: 1080,
                      },
                      {
                        hideBottomControls: true,
                        toolbarTitle: localize("cPic"),
                        statusBarColor: "#ff5200",
                        toolbarTextColor: aT == "Light" ? "#212529" : "#f1f3f5",
                        toolbarColor:
                          aT == "Light"
                            ? "#f1f3f5"
                            : aT == "Dark"
                            ? "#212529"
                            : "#000000",
                        cropFrameColor: "#ff5200",
                      }
                    )
                    .then((cropped) => {
                      cropped.image.saveToFile(this.cacheImagePath, "jpg", 75);
                      this.recipe.image = this.cacheImagePath;
                    });
                });
              }
            });
        }
      });
    },
    createDupImage() {
      if (this.recipe.image) {
        let cachePath = path.join(
          knownFolders.temp().path,
          `${utils.getRandomID(0)}.jpg`
        );
        utils.copyPhotoToCache(this.recipe.image, cachePath).then((imgPath) => {
          if (imgPath) this.recipe.image = imgPath;
        });
      }
    },

    // DATA LIST
    showCuisine(focus) {
      this.$showModal(Action, {
        props: {
          title: "cui",
          list: this.cuisines,
          action: "aNBtn",
          selected: this.recipe.cuisine,
        },
      }).then((action) => {
        if (action == "aNBtn") {
          this.$showModal(Prompt, {
            props: {
              title: "newCui",
              action: "aBtn",
            },
          }).then((item) => {
            if (item.length) {
              this.recipe.cuisine = item;
              this.addLI({
                item,
                listName: "cuisines",
              });
              if (focus) this.showCategories(1);
            }
          });
        } else {
          if (action) {
            this.recipe.cuisine = action;
            if (focus) this.showCategories(1);
          } else
            this.cuisines.includes(this.recipe.cuisine)
              ? null
              : (this.recipe.cuisine = "Undefined");
        }
      });
    },
    showCategories(focus) {
      this.$showModal(Action, {
        props: {
          title: "cat",
          list: this.categories,
          action: "aNBtn",
          selected: this.recipe.category,
        },
      }).then((action) => {
        if (action == "aNBtn") {
          this.$showModal(Prompt, {
            props: {
              title: "nwCat",
              action: "aBtn",
            },
          }).then((item) => {
            if (item.length) {
              this.recipe.category = item;
              this.addLI({
                item,
                listName: "categories",
              });
              if (focus) this.focusRef("tags");
            }
          });
        } else {
          if (action) {
            this.recipe.category = action;
            if (focus) this.focusRef("tags");
          } else
            this.categories.includes(this.recipe.category)
              ? null
              : (this.recipe.category = "Undefined");
        }
      });
    },
    setTimeRequired(focus, time) {
      let t = this.recipe[time].split(":");
      let hr = t[0];
      let min = t[1];
      this.$showModal(TimePickerHM, {
        props: {
          title: `${time == "prepTime" ? "prepT" : "cookT"}`,
          selectedHr: hr,
          selectedMin: min,
        },
      }).then((result) => {
        if (result) {
          this.recipe[time] = result;
          if (focus) {
            switch (time) {
              case "prepTime":
                this.setTimeRequired(1, "cookTime");
                break;
              case "cookTime":
                this.focusRef("yieldQ");
                break;
            }
          }
        }
      });
    },
    showYieldUnits(focus) {
      this.$showModal(Action, {
        props: {
          title: "yieldU",
          list: this.yieldUnits,
          action: "aNBtn",
          selected: this.recipe.yieldUnit,
        },
      }).then((action) => {
        if (action == "aNBtn") {
          this.$showModal(Prompt, {
            props: {
              title: "nwYiU",
              action: "aBtn",
            },
          }).then((item) => {
            if (item.length) {
              this.recipe.yieldUnit = item;
              this.addLI({
                item,
                listName: "yieldUnits",
              });
              if (focus) this.showDifficultyLevel(1);
            }
          });
        } else {
          if (action) {
            this.recipe.yieldUnit = action;
            if (focus) this.showDifficultyLevel(1);
          } else
            this.yieldUnits.includes(this.recipe.yieldUnit)
              ? null
              : (this.recipe.yieldUnit = "Serving");
        }
      });
    },
    showDifficultyLevel(focus) {
      this.$showModal(Action, {
        props: {
          title: "Difficulty level",
          list: this.difficultyLevels,
          selected: this.recipe.difficulty,
        },
      }).then((action) => {
        if (action) {
          this.recipe.difficulty = action;
          if (focus) this.addIng(1);
        } else
          this.difficultyLevels.includes(this.recipe.difficulty)
            ? null
            : (this.recipe.difficulty = "Easy");
      });
    },
    showUnits(focus, i) {
      this.$showModal(Action, {
        props: {
          title: "Unit",
          list: this.units,
          action: "aNBtn",
          selected: this.recipe.ingredients[i].unit,
        },
      }).then((action) => {
        if (action == "aNBtn") {
          this.$showModal(Prompt, {
            props: {
              title: "newUnit",
              action: "aBtn",
            },
          }).then((item) => {
            if (item.length) {
              this.recipe.ingredients[i].unit = item;
              this.addLI({
                item,
                listName: "units",
              });
              if (focus) this.focusRefs("ing" + i, 1);
            }
          });
        } else {
          if (action) {
            this.recipe.ingredients[i].unit = action;
            if (focus) this.focusRefs("ing" + i, 1);
          }
        }
      });
    },
    showCombinations() {
      Utils.ad.dismissSoftInput();
      let existingCombinations = [...this.recipe.combinations, this.recipe.id];
      let filteredRecipes = this.recipes.filter(
        (e) => !existingCombinations.includes(e.id)
      );
      this.$showModal(ActionWithSearch, {
        props: {
          title: "selRec",
          recipes: filteredRecipes,
        },
      }).then((res) => {
        if (res) this.recipe.combinations.push(res);
      });
    },

    // INPUT FIELD HANDLERS
    setFocus(i) {
      this.fi = i;
    },
    addIng(type) {
      let ing = {
        key: utils.getRandomID(1),
        type,
        quantity: null,
        unit: 0,
        value: "",
      };
      let ings = this.recipe.ingredients;
      if (type) {
        ing.unit = ings.length
          ? ings[this.fi >= 0 ? this.fi : ings.length - 1].unit
            ? ings[this.fi >= 0 ? this.fi : ings.length - 1].unit
            : "unit"
          : "unit";
      }
      let i = this.fi >= 0 ? this.fi + 1 : ings.length;
      this.recipe.ingredients.splice(i, 0, ing);
      if (!ing.value || !type) this.delayFocus("ing", ings.length);
    },
    rmIng(i) {
      if (this.recipe.ingredients[i].value.length) {
        let item = this.recipe.ingredients[i];
        this.recipe.ingredients.splice(i, 1);
        this.showUndoBar(item.type ? "rmIng" : "sectRm").then(
          (res) => res && this.recipe.ingredients.splice(i, 0, item)
        );
      } else {
        this.recipe.ingredients.splice(i, 1);
      }
    },
    addIns(type) {
      let obj = {
        key: utils.getRandomID(1),
        type,
        value: "",
      };
      let inss = this.recipe.instructions;
      let i = this.fi >= 0 ? this.fi + 1 : inss.length;
      this.recipe.instructions.splice(i, 0, obj);
      this.delayFocus("ins", inss.length);
    },
    rmIns(i) {
      if (this.recipe.instructions[i].value.length) {
        let item = this.recipe.instructions[i];
        this.recipe.instructions.splice(i, 1);
        this.showUndoBar(item.type ? "rmIns" : "sectRm").then(
          (res) => res && this.recipe.instructions.splice(i, 0, item)
        );
      } else this.recipe.instructions.splice(i, 1);
    },
    addNote() {
      let obj = {
        key: utils.getRandomID(1),
        value: "",
      };
      let nos = this.recipe.notes;
      let i = this.fi >= 0 ? this.fi + 1 : nos.length;
      this.recipe.notes.splice(i, 0, obj);
      this.delayFocus("note", nos.length);
    },
    removeNote(index) {
      if (this.recipe.notes[index].value.length) {
        let item = this.recipe.notes[index];
        this.recipe.notes.splice(index, 1);
        this.showUndoBar("rmN").then(() =>
          this.recipe.notes.splice(index, 0, item)
        );
      } else this.recipe.notes.splice(index, 1);
    },
    getCombinationTitle(id) {
      return this.recipes.filter((e) => e.id === id)[0].title;
    },
    removeCombination(id) {
      let index = this.recipe.combinations.indexOf(id);
      this.recipe.combinations.splice(index, 1);
      this.unLinkCombs.push(id);
      this.showUndoBar("rmCmb").then((res) =>
        this.recipe.combinations.splice(index, 0, id)
      );
    },
    getIngPos(n) {
      let a = 1;
      let b = 1;
      let ings = this.recipe.ingredients;
      let group = ings.reduce((acc, e) => {
        if (!e.type) {
          a = 1;
          acc.push(b++);
        } else acc.push(e.type ? a++ : a - 1);
        return acc;
      }, []);
      return localize(ings[n].type ? "it" : "sect", group[n]);
    },
    getInsPos(n) {
      let a = 1;
      let b = 1;
      let ins = this.recipe.instructions;
      let group = ins.reduce((acc, e) => {
        if (!e.type) {
          a = 1;
          acc.push(b++);
        } else acc.push(a++);
        return acc;
      }, []);
      return localize(ins[n].type ? "stp" : "sect", group[n]);
    },

    // SAVE OPERATION
    clearEmptyFields() {
      if (!this.recipe.title) this.recipe.title = localize("untRec");
      if (!this.recipe.yieldQuantity) this.recipe.yieldQuantity = 1;
      const clearEmpty = (arr) => {
        this.recipe[arr] = this.recipe[arr].filter((e) => e.value);
      };
      clearEmpty("ingredients");
      clearEmpty("instructions");
      clearEmpty("notes");
    },
    saveOperation() {
      this.saving = 1;
      this.clearEmptyFields();
      this.recipe.lastModified = new Date().getTime();
      setString("previousCuisine", this.recipe.cuisine);
      setString("previousCategory", this.recipe.category);
      setString("previousYieldUnit", this.recipe.yieldUnit);
      if (this.cacheImagePath) {
        let recipeImage = path.join(
          knownFolders.documents().getFolder("EnRecipes").getFolder("Images")
            .path,
          `${utils.getRandomID(0)}.jpg`
        );
        let binarySource = File.fromPath(this.cacheImagePath).readSync();
        File.fromPath(recipeImage).writeSync(binarySource);
        this.recipe.image = recipeImage;
        knownFolders.temp().clear();
      }
      if (this.recipe.image) {
        if (
          this.tempRecipe.image &&
          this.tempRecipe.image !== this.recipe.image
        ) {
          getFileAccess().deleteFile(this.tempRecipe.image);
        }
      } else if (this.tempRecipe.image) {
        getFileAccess().deleteFile(this.tempRecipe.image);
      }
      this.unLinkCs({
        id: this.recipeID,
        combs: this.unLinkCombs,
      });
      this.saveRecipe();
    },
    saveRecipe() {
      this.addR(this.recipe);
      this.saving = 0;
      this.dupRecipe
        ? this.$navigateTo(EnRecipes, {
            clearHistory: true,
            animated: false,
          })
        : this.goBackAction(0);
    },

    // UNDO OPERATION
    showUndoBar(message) {
      clearInterval(barTimer);
      return new Promise((resolve, reject) => {
        this.animateBar(this.appbar, 0).then(() => {
          this.showUndo = 1;
          this.snackMsg = message;
          this.countdown = 5;
          this.animateBar(this.snackbar, 1, 1).then(() => {
            let a = 5;
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
      this.animateBar(this.snackbar, 0).then(() => {
        this.showUndo = this.undo = 0;
        this.animateBar(this.appbar, 1);
      });
    },
    undoDel() {
      this.undo = 1;
    },

    // HELPERS
    focusRef(r) {
      this.$refs[r].nativeView.focus();
      setTimeout(() => {
        Utils.ad.showSoftInput(this.$refs[r].nativeView.android);
      }, 100);
    },
    focusRefs(r, i) {
      i = i != null ? i : 0;
      this.$refs[r][i].nativeView.focus();
      setTimeout(() => {
        Utils.ad.showSoftInput(this.$refs[r][i].nativeView.android);
      }, 100);
    },
    delayFocus(type, length) {
      setTimeout(
        () =>
          this.focusRefs(
            type + (length == 1 ? 0 : this.fi >= 0 ? this.fi + 1 : length - 1)
          ),
        100
      );
    },
    splitTags() {
      let tags = [];
      let string;
      if (this.tags) {
        tags = this.tags
          .split(" ")
          .map((e) => {
            string = e.replace(/^[^\w\s]+/, "");
            if (/^[A-Za-z]+/.test(string)) {
              return string.charAt(0).toUpperCase() + string.slice(1);
            }
          })
          .filter((e) => e);
      }
      this.recipe.tags = tags;
    },
    joinTags() {
      this.tags = this.recipe.tags.join(" ");
    },
    timeRequired(time) {
      let t = this.recipe[time].split(":");
      let h = parseInt(t[0]);
      let m = parseInt(t[1]);
      let hr = localize("hr");
      let min = localize("min");
      return h ? (m ? `${h} ${hr} ${m} ${min}` : `${h} ${hr}`) : `${m} ${min}`;
    },
    getTitleCount(title, type) {
      let c;
      switch (title) {
        case "ings" || "inss":
          c = this.recipe[type].filter((e) => e.type).length;
          break;
        default:
          c = this.recipe[type].length;
          break;
      }
      let text = c ? ` (${c})` : "";
      return localize(title) + text;
    },

    // NAVIGATION HANDLERS
    hijackBackEvent() {
      AndroidApplication.on(
        AndroidApplication.activityBackPressedEvent,
        this.backEvent
      );
    },
    releaseBackEvent() {
      AndroidApplication.off(
        AndroidApplication.activityBackPressedEvent,
        this.backEvent
      );
    },
    backEvent(args) {
      if (!this.modalOpen) {
        args.cancel = true;
        this.navigateBack(1);
      }
    },
    goBackAction(exit) {
      this.hasBackStack || this.recipeID
        ? this.$navigateBack()
        : exit
        ? Application.android.foregroundActivity.finish()
        : this.$navigateTo(EnRecipes, {
            clearHistory: true,
            animated: false,
          });
    },
    navigateBack(hwb) {
      if (this.hasChanges) {
        this.modalOpen = 1;
        this.$showModal(Confirm, {
          props: {
            title: "unsaved",
            description: localize("disc"),
            cancelButtonText: "disBtn",
            okButtonText: "kEdit",
          },
        }).then((action) => {
          this.modalOpen = 0;
          if (action != null && !action) {
            this.goBackAction(1);
            knownFolders.temp().clear();
          }
        });
      } else this.goBackAction(hwb);
    },
  },
  created() {
    this.title = this.recipeID || this.dupRecipe ? "editRec" : "newRec";
    if (this.recipeID) {
      let recipe = this.recipes.filter((e) => e.id === this.recipeID)[0];
      Object.assign(this.recipe, JSON.parse(JSON.stringify(recipe)));
      Object.assign(this.tempRecipe, JSON.parse(JSON.stringify(this.recipe)));
      if (this.recipe.tags.length) this.joinTags();
    } else if (this.dupRecipe) {
      this.recipe = Object.assign({}, this.dupRecipe);
      this.recipe.tried = 1;
      this.recipe.lastTried = 0;
      this.createDupImage();
    } else {
      this.recipe.cuisine = this.selCuisine
        ? /all/.test(this.selCuisine)
          ? "Undefined"
          : this.selCuisine
        : getString("previousCuisine", "Undefined");
      this.recipe.category = this.selCategory
        ? /all/.test(this.selCategory)
          ? "Undefined"
          : this.selCategory
        : getString("previousCategory", "Undefined");
      if (this.selTag && !/all/.test(this.selTag)) {
        this.tags = this.selTag;
        this.splitTags();
      }
      this.recipe.yieldUnit = getString("previousYieldUnit", "Serving");
      if (this.filterFavourites) this.recipe.favorite = 1;
      if (this.filterTrylater) this.recipe.tried = 0;
      this.recipe.created = new Date().getTime();
      this.tempRecipe = Object.assign({}, this.recipe);
    }
  },
};
</script>
