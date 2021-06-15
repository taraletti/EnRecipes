<template>
  <Page @loaded="pgLoad" @unloaded="onPageUnload" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="auto, *, auto">
      <ScrollView rowSpan="2" colSpan="3" @scroll="!showUndo && svLoad($event)">
        <StackLayout padding="0 16 72">
          <RLabel class="pageTitle" padding="16 0 24" :text="`${title}` | L" />
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
          <StackLayout class="inputField">
            <Label class="fieldLabel" :text="'title' | L" />
            <TextField
              :hint="'recTitle' | L"
              v-model="recipe.title"
              @loaded="setInputTypeText($event, 'words')"
            />
          </StackLayout>
          <RGridLayout :rtl="RTL" class="" columns="*, 8, *">
            <StackLayout class="inputField">
              <Label class="fieldLabel" :text="'cui' | L" />
              <TextField
                @loaded="setGravity"
                :text="recipe.cuisine | L"
                editable="false"
                @focus="!modalOpen && showCuisine(1)"
                @tap="showCuisine(0)"
              />
            </StackLayout>
            <StackLayout class="inputField" col="2">
              <Label class="fieldLabel" :text="'cat' | L" />
              <TextField
                @loaded="setGravity"
                ref="category"
                :text="recipe.category | L"
                editable="false"
                @focus="!modalOpen && showCategories(1)"
                @tap="showCategories(0)"
              />
            </StackLayout>
          </RGridLayout>
          <StackLayout class="inputField">
            <Label class="fieldLabel" :text="'ts' | L" />
            <TextField
              @loaded="setGravity"
              :hint="'tsInfo' | L"
              autocapitalizationType="words"
              ref="tags"
              v-model="tags"
              @textChange="splitTags"
              returnKeyType="next"
            />
          </StackLayout>
          <RGridLayout :rtl="RTL" columns="*, 8, *">
            <StackLayout class="inputField">
              <Label class="fieldLabel" :text="'prepT' | L" />
              <TextField
                @loaded="setGravity"
                :text="timeRequired('prepTime')"
                editable="false"
                @focus="!modalOpen && setTimeRequired(1, 'prepTime')"
                @tap="setTimeRequired(0, 'prepTime')"
              />
            </StackLayout>
            <StackLayout class="inputField" col="2">
              <Label class="fieldLabel" :text="'cookT' | L" />
              <TextField
                @loaded="setGravity"
                ref="cookTime"
                :text="timeRequired('cookTime')"
                editable="false"
                @focus="!modalOpen && setTimeRequired(1, 'cookTime')"
                @tap="setTimeRequired(0, 'cookTime')"
              />
            </StackLayout>
          </RGridLayout>
          <RGridLayout :rtl="RTL" columns="*, 8, *">
            <StackLayout class="inputField">
              <Label class="fieldLabel" :text="'yieldQ' | L" />
              <TextField
                @loaded="setGravity"
                ref="yieldQuantity"
                v-model="recipe.yieldQuantity"
                hint="1"
                keyboardType="number"
                returnKeyType="next"
              />
            </StackLayout>
            <StackLayout class="inputField" col="2">
              <Label class="fieldLabel" :text="'yieldU' | L" />
              <TextField
                @loaded="setGravity"
                :text="`${recipe.yieldUnit}` | L"
                editable="false"
                @focus="!modalOpen && showYieldUnits(1)"
                @tap="showYieldUnits(0)"
              />
            </StackLayout>
          </RGridLayout>
          <GridLayout columns="*, 8, *">
            <StackLayout class="inputField" :col="RTL ? 2 : 0">
              <Label class="fieldLabel" :text="'Difficulty level' | L" />
              <TextField
                @loaded="setGravity"
                ref="difficultyLevel"
                :text="`${recipe.difficulty}` | L"
                editable="false"
                @focus="!modalOpen && showDifficultyLevel(1)"
                @tap="showDifficultyLevel(0)"
              />
            </StackLayout>
          </GridLayout>
          <!-- INGREDIENTS -->
          <Label
            :text="getTitleCount('ings', 'ingredients')"
            class="sectionTitle"
          />
          <RGridLayout
            :rtl="RTL"
            columns="auto,8,auto,8,*,auto"
            v-for="(ingredient, index) in recipe.ingredients"
            :key="'ing' + index"
          >
            <TextField
              width="52"
              @loaded="!recipe.ingredients[index].item && focusField($event)"
              v-model="recipe.ingredients[index].quantity"
              hint="1.00"
              keyboardType="number"
              returnKeyType="next"
            />

            <TextField
              width="68"
              col="2"
              :text="`${recipe.ingredients[index].unit}` | L"
              editable="false"
              @focus="!modalOpen && showUnits($event, 1, index)"
              @tap="showUnits($event, 0, index)"
            />

            <TextField
              ref="ingredient"
              @loaded="setInputTypeText($event, 'sentence')"
              col="4"
              v-model="recipe.ingredients[index].item"
              :hint="`${$options.filters.L('it')} ${index + 1}`"
              @returnPress="
                index + 1 == recipe.ingredients.length && addIngredient()
              "
            />
            <Button
              col="5"
              class="ico min"
              :text="icon.x"
              @tap="removeIngredient(index)"
            />
          </RGridLayout>
          <Button
            class="text big hal"
            :class="{ r: RTL }"
            :text="'aIngBtn' | L"
            @tap="addIngredient()"
          />
          <!-- INSTRUCTIONS -->
          <Label
            :text="getTitleCount('inss', 'instructions')"
            class="sectionTitle"
          />
          <RGridLayout
            :rtl="RTL"
            columns="*,auto"
            v-for="(instruction, index) in recipe.instructions"
            :key="'ins' + index"
          >
            <TextView
              @loaded="focusField($event, 'multiLine')"
              :hint="`${$options.filters.L('stp')} ${index + 1}`"
              v-model="recipe.instructions[index]"
            />
            <Button
              col="1"
              class="ico min"
              :text="icon.x"
              @tap="removeInstruction(index)"
            />
          </RGridLayout>
          <Button
            class="text big hal"
            :class="{ r: RTL }"
            :text="'aStpBtn' | L"
            @tap="addInstruction"
          />
          <!-- COMBINATIONS -->
          <Label
            :text="getTitleCount('cmbs', 'combinations')"
            class="sectionTitle"
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
              class="ico min"
              :text="icon.x"
              @tap="removeCombination(combination)"
            />
          </RGridLayout>
          <Button
            class="text big hal"
            :class="{ r: RTL }"
            :text="'addCmbBtn' | L"
            @tap="showCombinations"
          />
          <!-- NOTES -->
          <Label :text="getTitleCount('nos', 'notes')" class="sectionTitle" />
          <RGridLayout
            :rtl="RTL"
            columns="*, auto"
            v-for="(note, index) in recipe.notes"
            :key="'nos' + index"
          >
            <TextView
              @loaded="focusField($event, 'multiLine')"
              :hint="`${$options.filters.L('no')} ${index + 1}`"
              v-model="recipe.notes[index]"
            />
            <Button
              col="1"
              class="ico min"
              :text="icon.x"
              @tap="removeNote(index)"
            />
          </RGridLayout>
          <Button
            class="text big hal"
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
  CoreTypes,
  Frame,
  Application,
  GridLayout,
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
      unSyncCombinations: [],
      difficultyLevels: ["Easy", "Moderate", "Challenging"],
      appbar: null,
      snackbar: null,
      scrollPos: 1,
      countdown: 5,
      snackMsg: null,
      showUndo: 0,
      undo: 0,
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
    ...mapActions([
      "addRecipeAction",
      "addListItemAction",
      "unSyncCombinationsAction",
    ]),
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
        if (!scrollUp && ab == 0) {
          this.appbar.animate({
            translate: { x: 0, y: 64 },
            duration: 200,
            curve: CoreTypes.AnimationCurve.ease,
          });
        } else if (scrollUp && ab == 64) {
          Utils.ad.dismissSoftInput();
          this.appbar.animate({
            translate: { x: 0, y: 0 },
            duration: 200,
            curve: CoreTypes.AnimationCurve.ease,
          });
        }
      }
    },

    // PHOTO HANDLERS
    imageHandler() {
      this.clearEmptyFields(1);
      if (this.recipe.image) {
        this.modalOpen = 1;
        this.$showModal(Action, {
          props: {
            title: "recPic",
            list: ["aap", "rp"],
          },
        }).then((action) => {
          this.modalOpen = 0;
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
          utils.copyPhotoToCache(uri, this.cacheImagePath).then((imgPath) => {
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
      this.modalOpen = 1;
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
            this.modalOpen = 0;
            if (item.length) {
              this.recipe.cuisine = item;
              this.addListItemAction({
                item,
                listName: "cuisines",
              });
              if (focus) this.autoFocusField("category", 0);
            }
          });
        } else {
          this.modalOpen = 0;
          if (action) {
            this.recipe.cuisine = action;
            if (focus) this.autoFocusField("category", 0);
          } else
            this.cuisines.includes(this.recipe.cuisine)
              ? mull
              : (this.recipe.cuisine = "Undefined");
        }
      });
    },
    showCategories(focus) {
      this.modalOpen = 1;
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
            this.modalOpen = 0;
            if (item.length) {
              this.recipe.category = item;
              this.addListItemAction({
                item,
                listName: "categories",
              });
              if (focus) this.autoFocusField("tags", 1);
            }
          });
        } else {
          this.modalOpen = 0;
          if (action) {
            this.recipe.category = action;
            if (focus) this.autoFocusField("tags", 1);
          } else
            this.categories.includes(this.recipe.category)
              ? mull
              : (this.recipe.category = "Undefined");
        }
      });
    },
    showYieldUnits(focus) {
      this.modalOpen = 1;
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
            this.modalOpen = 0;
            if (item.length) {
              this.recipe.yieldUnit = item;
              this.addListItemAction({
                item,
                listName: "yieldUnits",
              });
              if (focus) this.autoFocusField("difficultyLevel", 0);
            }
          });
        } else {
          this.modalOpen = 0;
          if (action) {
            this.recipe.yieldUnit = action;
            if (focus) this.autoFocusField("difficultyLevel", 0);
          } else
            this.yieldUnits.includes(this.recipe.yieldUnit)
              ? mull
              : (this.recipe.yieldUnit = "Serving");
        }
      });
    },
    showDifficultyLevel(focus) {
      this.modalOpen = 1;
      this.$showModal(Action, {
        props: {
          title: "Difficulty level",
          list: this.difficultyLevels,
          selected: this.recipe.difficulty,
        },
      }).then((action) => {
        this.modalOpen = 0;
        if (action) {
          this.recipe.difficulty = action;
          if (focus) this.addIngredient();
        } else
          this.difficultyLevels.includes(this.recipe.difficulty)
            ? mull
            : (this.recipe.difficulty = "Easy");
      });
    },
    showUnits(e, focus, index) {
      this.modalOpen = 1;
      this.$showModal(Action, {
        props: {
          title: "Unit",
          list: this.units,
          action: "aNBtn",
          selected: this.recipe.ingredients[index].unit,
        },
      }).then((action) => {
        if (action == "aNBtn") {
          this.$showModal(Prompt, {
            props: {
              title: "newUnit",
              action: "aBtn",
            },
          }).then((item) => {
            this.modalOpen = 0;
            if (item.length) {
              this.recipe.ingredients[index].unit = item;
              this.addListItemAction({
                item,
                listName: "units",
              });
              if (focus && this.recipe.ingredients.length - 1 === index)
                this.autoFocusRefField("ingredient", index);
            }
          });
        } else {
          this.modalOpen = 0;
          if (action) {
            this.recipe.ingredients[index].unit = action;
            if (focus && this.recipe.ingredients.length - 1 === index)
              this.autoFocusRefField("ingredient", index);
          }
        }
      });
    },
    showCombinations() {
      Utils.ad.dismissSoftInput();
      this.modalOpen = 1;
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
        this.modalOpen = 0;
        if (res) this.recipe.combinations.push(res);
      });
    },

    // INPUT FIELD HANDLERS
    addIngredient() {
      let ingredients = this.recipe.ingredients;
      let unit = ingredients.length
        ? ingredients[ingredients.length - 1].unit
        : "unit";
      this.recipe.ingredients.push({
        item: "",
        quantity: null,
        unit,
      });
    },
    removeIngredient(index) {
      this.modalOpen = 1;
      if (this.recipe.ingredients[index].item.length) {
        let item = this.recipe.ingredients[index];
        this.recipe.ingredients.splice(index, 1);
        this.showUndoBar("rmIng").then(
          (res) => res && this.recipe.ingredients.splice(index, 0, item)
        );
      } else {
        this.recipe.ingredients.splice(index, 1);
      }
      setTimeout(() => (this.modalOpen = 0), 200);
    },
    addInstruction() {
      this.recipe.instructions.push("");
    },
    removeInstruction(index) {
      if (this.recipe.instructions[index].length) {
        let item = this.recipe.instructions[index];
        this.recipe.instructions.splice(index, 1);
        this.showUndoBar("rmIns").then(
          (res) => res && this.recipe.instructions.splice(index, 0, item)
        );
      } else this.recipe.instructions.splice(index, 1);
    },
    addNote() {
      this.recipe.notes.push("");
    },
    removeNote(index) {
      if (this.recipe.notes[index].length) {
        let item = this.recipe.notes[index];
        this.recipe.notes.splice(index, 1);
        this.showUndoBar("rmN").then((res) =>
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
      this.unSyncCombinations.push(id);
      this.showUndoBar("rmCmb").then((res) =>
        this.recipe.combinations.splice(index, 0, id)
      );
    },

    // SAVE OPERATION
    clearEmptyFields(bool) {
      if (!this.recipe.title && !bool) this.recipe.title = localize("untRec");
      if (!this.recipe.yieldQuantity) this.recipe.yieldQuantity = 1;
      this.recipe.ingredients = this.recipe.ingredients.filter((e) => e.item);
      let vm = this;

      function clearEmpty(arr) {
        vm.recipe[arr] = vm.recipe[arr].filter((e) => e);
      }
      clearEmpty("instructions");
      clearEmpty("notes");
    },
    saveOperation() {
      this.saving = this.modalOpen = 1;
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
      this.unSyncCombinationsAction({
        id: this.recipeID,
        combinations: this.unSyncCombinations,
      });
      this.saveRecipe();
    },
    saveRecipe() {
      this.addRecipeAction(this.recipe);
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
          this.animateBar(this.snackbar, 1).then(() => {
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
    autoFocusField(ref, showSoftInput) {
      this.$refs[ref].nativeView.focus();
      if (showSoftInput) {
        setTimeout(() => {
          Utils.ad.showSoftInput(this.$refs[ref].nativeView.android);
        }, 100);
      }
    },
    autoFocusRefField(ref, index) {
      this.$refs[ref][index].nativeView.focus();
      setTimeout(() => {
        Utils.ad.showSoftInput(this.$refs[ref][index].nativeView.android);
      }, 100);
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
    focusField(args, type) {
      if (type) this.setInputTypeText(args, type);
      else this.setGravity(args);
      if (!args.object.text) {
        args.object.focus();
        setTimeout(() => Utils.ad.showSoftInput(args.object.android), 100);
      }
    },
    setInputTypeText({ object }, type) {
      this.setGravity(object);
      let common =
        android.text.InputType.TYPE_CLASS_TEXT |
        android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT;
      switch (type) {
        case "words":
          object.android.setInputType(
            android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS | common
          );
          break;
        case "sentence":
          object.android.setInputType(
            android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES | common
          );
          break;
        case "multiLine":
          object.android.setInputType(
            android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE |
              android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES |
              common
          );
          break;
      }
    },
    setTimeRequired(focus, time) {
      this.modalOpen = 1;
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
        this.modalOpen = 0;
        if (result) {
          this.recipe[time] = result;
          if (focus) {
            switch (time) {
              case "prepTime":
                this.autoFocusField("cookTime", 0);
                break;
              case "cookTime":
                this.autoFocusField("yieldQuantity", 1);
                break;
            }
          }
        }
      });
    },
    getTitleCount(title, type) {
      let count = this.recipe[type].length;
      let text = count ? ` (${count})` : "";
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
