<template>
  <Page @loaded="onPageLoad" @unloaded="onPageUnload" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="auto, *">
      <ScrollView
        rowSpan="2"
        colSpan="2"
        @scroll="!showUndo && onScroll($event)"
      >
        <StackLayout padding="0 16 72">
          <Label class="pageTitle" padding="16 0" :text="`${title}` | L" />
          <Image
            margin="8 0 32"
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
            margin="8 0 32"
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
          <GridLayout columns="*, 8, *">
            <StackLayout class="inputField">
              <Label class="fieldLabel" :text="'cui' | L" />
              <TextField
                :text="recipe.cuisine | L"
                editable="false"
                @focus="!modalOpen && showCuisine(true)"
                @tap="showCuisine(false)"
              />
            </StackLayout>
            <StackLayout class="inputField" col="2">
              <Label class="fieldLabel" :text="'cat' | L" />
              <TextField
                ref="category"
                :text="recipe.category | L"
                editable="false"
                @focus="!modalOpen && showCategories(true)"
                @tap="showCategories(false)"
              />
            </StackLayout>
          </GridLayout>
          <StackLayout class="inputField">
            <Label class="fieldLabel" :text="'ts' | L" />
            <TextField
              :hint="'tsInfo' | L"
              autocapitalizationType="words"
              ref="tags"
              v-model="tags"
              @textChange="splitTags"
              returnKeyType="next"
            />
          </StackLayout>
          <GridLayout columns="*, 8, *">
            <StackLayout class="inputField">
              <Label class="fieldLabel" :text="'prepT' | L" />
              <TextField
                :text="timeRequired('prepTime')"
                editable="false"
                @focus="!modalOpen && setTimeRequired(true, 'prepTime')"
                @tap="setTimeRequired(false, 'prepTime')"
              />
            </StackLayout>
            <StackLayout class="inputField" col="2">
              <Label class="fieldLabel" :text="'cookT' | L" />
              <TextField
                ref="cookTime"
                :text="timeRequired('cookTime')"
                editable="false"
                @focus="!modalOpen && setTimeRequired(true, 'cookTime')"
                @tap="setTimeRequired(false, 'cookTime')"
              />
            </StackLayout>
          </GridLayout>
          <GridLayout columns="*, 8, *">
            <StackLayout class="inputField">
              <Label class="fieldLabel" :text="'yieldQ' | L" />
              <TextField
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
                :text="`${recipe.yieldUnit}` | L"
                editable="false"
                @focus="!modalOpen && showYieldUnits(true)"
                @tap="showYieldUnits(false)"
              />
            </StackLayout>
          </GridLayout>
          <GridLayout columns="*, 8, *">
            <StackLayout class="inputField">
              <Label class="fieldLabel" :text="'Difficulty level' | L" />
              <TextField
                ref="difficultyLevel"
                :text="`${recipe.difficulty}` | L"
                editable="false"
                @focus="!modalOpen && showDifficultyLevel(true)"
                @tap="showDifficultyLevel(false)"
              />
            </StackLayout>
          </GridLayout>
          <!-- INGREDIENTS -->
          <Label
            :text="getTitleCount('ings', 'ingredients')"
            class="sectionTitle"
          />
          <GridLayout
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
              @focus="!modalOpen && showUnits($event, true, index)"
              @tap="showUnits($event, false, index)"
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
              class="ico x"
              :text="icon.x"
              @tap="removeIngredient(index)"
            />
          </GridLayout>
          <Button
            class="text big"
            :text="'aIngBtn' | L"
            @tap="addIngredient()"
          />
          <!-- INSTRUCTIONS -->
          <Label
            :text="getTitleCount('inss', 'instructions')"
            class="sectionTitle"
          />
          <GridLayout
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
              class="ico x"
              :text="icon.x"
              @tap="removeInstruction(index)"
            />
          </GridLayout>
          <Button
            class="text big"
            :text="'aStpBtn' | L"
            @tap="addInstruction"
          />
          <!-- COMBINATIONS -->
          <Label
            :text="getTitleCount('cmbs', 'combinations')"
            class="sectionTitle"
          />
          <GridLayout
            columns="*,auto"
            v-for="(combination, index) in recipe.combinations"
            :key="'cmbs' + index"
          >
            <TextField
              class="combField"
              :text="getCombinationTitle(combination)"
              editable="false"
            />
            <Button
              col="1"
              class="ico x"
              :text="icon.x"
              @tap="removeCombination(combination)"
            />
          </GridLayout>
          <Button
            class="text big"
            :text="'addCmbBtn' | L"
            @tap="showCombinations"
          />
          <!-- NOTES -->
          <Label :text="getTitleCount('nos', 'notes')" class="sectionTitle" />
          <GridLayout
            columns="*,auto"
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
              class="ico x"
              :text="icon.x"
              @tap="removeNote(index)"
            />
          </GridLayout>
          <Button class="text big" :text="'aNoBtn' | L" @tap="addNote" />
        </StackLayout>
      </ScrollView>
      <GridLayout
        row="1"
        @loaded="onAppBarLoad"
        :hidden="showUndo"
        class="appbar"
        :colSpan="hasChanges ? 2 : 1"
        columns="auto, *, auto"
      >
        <Button class="ico" :text="icon.back" @tap="navigateBack" />
        <Button
          v-if="hasChanges && !saving"
          class="ico fab"
          :text="icon.save"
          col="2"
          @tap="saveOperation()"
        />
        <ActivityIndicator col="2" v-if="saving" :busy="saving" />
      </GridLayout>
      <GridLayout
        row="1"
        class="appbar snackBar"
        :hidden="!showUndo"
        colSpan="2"
        columns="auto, *, auto"
        @swipe="hideUndoBar"
      >
        <Button :text="countdown" class="ico countdown tb" />
        <Label class="title" col="1" :text="snackMsg | L" />
        <Button class="ico fab" :text="icon.undo" @tap="undoDel" col="3" />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import {
  AndroidApplication,
  ApplicationSettings,
  File,
  getFileAccess,
  ImageSource,
  knownFolders,
  path,
  Screen,
  Utils,
  Observable,
  CoreTypes,
} from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { ImageCropper } from "nativescript-imagecropper";
import { mapState, mapActions } from "vuex";
import ActionDialog from "./modal/ActionDialog.vue";
import ActionDialogWithSearch from "./modal/ActionDialogWithSearch.vue";
import ConfirmDialog from "./modal/ConfirmDialog.vue";
import PromptDialog from "./modal/PromptDialog.vue";
import TimePicker from "./modal/TimePicker.vue";
import * as utils from "~/shared/utils";
let undoTimer;
export default {
  props: [
    "recipeID",
    "filterFavourites",
    "filterTrylater",
    "navigationFromView",
  ],
  data() {
    return {
      title: "newRec",
      recipe: {
        id: this.recipeID ? this.recipeID : this.getRandomID(),
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
      modalOpen: false,
      // newRecipeID: null,
      saving: false,
      cacheImagePath: null,
      unSyncCombinations: [],
      difficultyLevels: ["Easy", "Moderate", "Challenging"],
      appbar: null,
      scrollPos: 1,
      countdown: 5,
      snackMsg: null,
      showUndo: false,
      undo: false,
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
      "currentComponent",
      "selectedCuisine",
      "selectedCategory",
      "selectedTag",
      "appTheme",
    ]),
    screenWidth() {
      return Screen.mainScreen.widthDIPs;
    },
    hasChanges() {
      return JSON.stringify(this.recipe) !== JSON.stringify(this.tempRecipe);
    },
  },
  methods: {
    ...mapActions([
      "setComponent",
      "addRecipeAction",
      "addListItemAction",
      "unSyncCombinationsAction",
    ]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
      this.hijackBackEvent();
    },
    onPageUnload() {
      this.releaseBackEvent();
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
          Utils.ad.dismissSoftInput();
          this.appbar.animate({
            translate: { x: 0, y: 0 },
            duration: 250,
            curve: CoreTypes.AnimationCurve.ease,
          });
        }
      }
    },

    // PHOTO HANDLERS
    imageHandler() {
      this.clearEmptyFields(true);
      if (this.recipe.image) {
        this.modalOpen = true;
        this.$showModal(ActionDialog, {
          props: {
            title: "recPic",
            list: ["aap", "rp"],
          },
        }).then((action) => {
          this.modalOpen = false;
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
      let aT = this.appTheme;
      utils.getRecipePhoto().then((uri) => {
        if (uri != null) {
          this.cacheImagePath = path.join(
            knownFolders.temp().path,
            `${this.getRandomID()}.jpg`
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

    // DATA LIST
    showCuisine(focus) {
      this.modalOpen = true;
      this.$showModal(ActionDialog, {
        props: {
          title: "cui",
          list: this.cuisines,
          action: "aNBtn",
        },
      }).then((action) => {
        if (action == "aNBtn") {
          this.$showModal(PromptDialog, {
            props: {
              title: "newCui",
              action: "aBtn",
            },
          }).then((item) => {
            this.modalOpen = false;
            if (item.length) {
              this.recipe.cuisine = item;
              this.addListItemAction({
                item,
                listName: "cuisines",
              });
              if (focus) this.autoFocusField("category", false);
            }
          });
        } else {
          this.modalOpen = false;
          if (action) {
            this.recipe.cuisine = action;
            if (focus) this.autoFocusField("category", false);
          } else
            this.cuisines.includes(this.recipe.cuisine)
              ? mull
              : (this.recipe.cuisine = "Undefined");
        }
      });
    },
    showCategories(focus) {
      this.modalOpen = true;
      this.$showModal(ActionDialog, {
        props: {
          title: "cat",
          list: this.categories,
          action: "aNBtn",
        },
      }).then((action) => {
        if (action == "aNBtn") {
          this.$showModal(PromptDialog, {
            props: {
              title: "nwCat",
              action: "aBtn",
            },
          }).then((item) => {
            this.modalOpen = false;
            if (item.length) {
              this.recipe.category = item;
              this.addListItemAction({
                item,
                listName: "categories",
              });
              if (focus) this.autoFocusField("tags", true);
            }
          });
        } else {
          this.modalOpen = false;
          if (action) {
            this.recipe.category = action;
            if (focus) this.autoFocusField("tags", true);
          } else
            this.categories.includes(this.recipe.category)
              ? mull
              : (this.recipe.category = "Undefined");
        }
      });
    },
    showYieldUnits(focus) {
      this.modalOpen = true;
      this.$showModal(ActionDialog, {
        props: {
          title: "yieldU",
          list: this.yieldUnits,
          action: "aNBtn",
        },
      }).then((action) => {
        if (action == "aNBtn") {
          this.$showModal(PromptDialog, {
            props: {
              title: "nwYiU",
              action: "aBtn",
            },
          }).then((item) => {
            this.modalOpen = false;
            if (item.length) {
              this.recipe.yieldUnit = item;
              this.addListItemAction({
                item,
                listName: "yieldUnits",
              });
              if (focus) this.autoFocusField("difficultyLevel", false);
            }
          });
        } else {
          this.modalOpen = false;
          if (action) {
            this.recipe.yieldUnit = action;
            if (focus) this.autoFocusField("difficultyLevel", false);
          } else
            this.yieldUnits.includes(this.recipe.yieldUnit)
              ? mull
              : (this.recipe.yieldUnit = "Serving");
        }
      });
    },
    showDifficultyLevel(focus) {
      this.modalOpen = true;
      this.$showModal(ActionDialog, {
        props: {
          title: "Difficulty level",
          list: this.difficultyLevels,
        },
      }).then((action) => {
        this.modalOpen = false;
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
      this.modalOpen = true;
      this.$showModal(ActionDialog, {
        props: {
          title: "Unit",
          list: this.units,
          action: "aNBtn",
        },
      }).then((action) => {
        if (action == "aNBtn") {
          this.$showModal(PromptDialog, {
            props: {
              title: "newUnit",
              action: "aBtn",
            },
          }).then((item) => {
            this.modalOpen = false;
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
          this.modalOpen = false;
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
      this.modalOpen = true;
      let existingCombinations = [...this.recipe.combinations, this.recipe.id];
      let filteredRecipes = this.recipes.filter(
        (e) => !existingCombinations.includes(e.id)
      );
      this.$showModal(ActionDialogWithSearch, {
        props: {
          title: "selRec",
          recipes: filteredRecipes,
        },
      }).then((res) => {
        this.modalOpen = false;
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
      this.modalOpen = true;
      if (this.recipe.ingredients[index].item.length) {
        let item = this.recipe.ingredients[index];
        this.recipe.ingredients.splice(index, 1);
        this.showUndoBar("rmIng").then(
          (res) => res && this.recipe.ingredients.splice(index, 0, item)
        );
      } else {
        this.recipe.ingredients.splice(index, 1);
      }
      setTimeout(() => (this.modalOpen = false), 200);
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
      this.saving = this.modalOpen = true;
      this.clearEmptyFields();
      this.recipe.lastModified = new Date().getTime();
      ApplicationSettings.setString("previousCuisine", this.recipe.cuisine);
      ApplicationSettings.setString("previousCategory", this.recipe.category);
      ApplicationSettings.setString("previousYieldUnit", this.recipe.yieldUnit);
      if (this.cacheImagePath) {
        let recipeImage = path.join(
          knownFolders.documents().getFolder("EnRecipes").getFolder("Images")
            .path,
          `${this.getRandomID()}.jpg`
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
      setTimeout(() => (this.saving = false), 100);
      this.$navigateBack();
    },

    // UNDO OPERATION
    showUndoBar(message) {
      return new Promise((resolve, reject) => {
        this.showUndo = true;
        this.appbar.translateY = 0;
        this.snackMsg = message;
        this.countdown = 5;
        let a = 5;
        clearTimeout(undoTimer);
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
    hideUndoBar({ object }) {
      object
        .animate({
          opacity: 0,
          translate: { x: 0, y: 64 },
          duration: 250,
          curve: CoreTypes.AnimationCurve.ease,
        })
        .then(() => {
          this.showUndo = false;
          this.appbar.translateY = 64;
          this.appbar.animate({
            translate: { x: 0, y: 0 },
            duration: 250,
            curve: CoreTypes.AnimationCurve.ease,
          });
          object.opacity = 1;
          object.translateY = 0;
          clearTimeout(undoTimer);
        });
    },
    undoDel() {
      this.undo = true;
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
      if (!args.object.text) {
        args.object.focus();
        setTimeout(() => Utils.ad.showSoftInput(args.object.android), 100);
      }
    },
    setInputTypeText(args, type) {
      let field = args.object;
      let common =
        android.text.InputType.TYPE_CLASS_TEXT |
        android.text.InputType.TYPE_TEXT_FLAG_AUTO_CORRECT;
      switch (type) {
        case "words":
          field.android.setInputType(
            android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS | common
          );
          break;
        case "sentence":
          field.android.setInputType(
            android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES | common
          );
          break;
        case "multiLine":
          field.android.setInputType(
            android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE |
              android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES |
              common
          );
          break;
      }
    },
    getRandomID() {
      let res = "";
      let chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < 16; i++) {
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return res;
    },
    setTimeRequired(focus, time) {
      this.modalOpen = true;
      let t = this.recipe[time].split(":");
      let hr = t[0];
      let min = t[1];
      this.$showModal(TimePicker, {
        props: {
          title: `${time == "prepTime" ? "prepT" : "cookT"}`,
          action: "SET",
          selectedHr: hr,
          selectedMin: min,
        },
      }).then((result) => {
        this.modalOpen = false;
        if (result) {
          this.recipe[time] = result;
          if (focus) {
            switch (time) {
              case "prepTime":
                this.autoFocusField("cookTime", false);
                break;
              case "cookTime":
                this.autoFocusField("yieldQuantity", true);
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
        this.navigateBack();
      }
    },
    navigateBack() {
      if (this.hasChanges) {
        this.modalOpen = true;
        this.$showModal(ConfirmDialog, {
          props: {
            title: "unsaved",
            description: localize("disc"),
            cancelButtonText: "disBtn",
            okButtonText: "kEdit",
          },
        }).then((action) => {
          this.modalOpen = false;
          if (action != null && !action) this.$navigateBack();
        });
      } else this.$navigateBack();
    },
  },
  created() {
    setTimeout(() => {
      this.setComponent("EditRecipe");
    }, 500);
    this.title = this.recipeID ? "editRec" : "newRec";
    if (this.recipeID) {
      let recipe = this.recipes.filter((e) => e.id === this.recipeID)[0];
      Object.assign(this.recipe, JSON.parse(JSON.stringify(recipe)));
      Object.assign(this.tempRecipe, JSON.parse(JSON.stringify(this.recipe)));
      if (this.recipe.tags.length) this.joinTags();
    } else {
      this.recipe.cuisine = this.selectedCuisine
        ? /all/.test(this.selectedCuisine)
          ? "Undefined"
          : this.selectedCuisine
        : ApplicationSettings.getString("previousCuisine", "Undefined");
      this.recipe.category = this.selectedCategory
        ? /all/.test(this.selectedCategory)
          ? "Undefined"
          : this.selectedCategory
        : ApplicationSettings.getString("previousCategory", "Undefined");
      if (this.selectedTag && !/all/.test(this.selectedTag)) {
        this.tags = this.selectedTag;
        this.splitTags();
      }
      this.recipe.yieldUnit = ApplicationSettings.getString(
        "previousYieldUnit",
        "Serving"
      );
      if (this.filterFavourites) this.recipe.favorite = true;
      if (this.filterTrylater) this.recipe.tried = false;
      this.recipe.created = new Date().getTime();
      Object.assign(this.tempRecipe, JSON.parse(JSON.stringify(this.recipe)));
      // this.newRecipeID = this.getRandomID();
    }
  },
};
</script>
