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
            v-if="recipeContent.imageSrc"
            :src="recipeContent.imageSrc"
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
              v-model="recipeContent.title"
              @loaded="setInputTypeText($event, 'words')"
            />
          </StackLayout>
          <GridLayout columns="*, 8, *">
            <StackLayout class="inputField">
              <Label class="fieldLabel" :text="'cui' | L" />
              <TextField
                :text="recipeContent.cuisine | L"
                editable="false"
                @focus="modalOpen === false && showCuisine(true)"
                @tap="showCuisine(false)"
              />
            </StackLayout>
            <StackLayout class="inputField" col="2">
              <Label class="fieldLabel" :text="'cat' | L" />
              <TextField
                ref="category"
                :text="recipeContent.category | L"
                editable="false"
                @focus="modalOpen === false && showCategories(true)"
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
                @focus="
                  modalOpen === false && setTimeRequired(true, 'prepTime')
                "
                @tap="setTimeRequired(false, 'prepTime')"
              />
            </StackLayout>
            <StackLayout class="inputField" col="2">
              <Label class="fieldLabel" :text="'cookT' | L" />
              <TextField
                ref="cookTime"
                :text="timeRequired('cookTime')"
                editable="false"
                @focus="
                  modalOpen === false && setTimeRequired(true, 'cookTime')
                "
                @tap="setTimeRequired(false, 'cookTime')"
              />
            </StackLayout>
          </GridLayout>
          <GridLayout columns="*, 8, *">
            <StackLayout class="inputField">
              <Label class="fieldLabel" :text="'yieldQ' | L" />
              <TextField
                ref="yieldQuantity"
                v-model="recipeContent.yield.quantity"
                hint="1"
                keyboardType="number"
                returnKeyType="next"
              />
            </StackLayout>
            <StackLayout class="inputField" col="2">
              <Label class="fieldLabel" :text="'yieldU' | L" />
              <TextField
                :text="`${recipeContent.yield.unit}` | L"
                editable="false"
                @focus="modalOpen === false && showYieldUnits(true)"
                @tap="showYieldUnits(false)"
              />
            </StackLayout>
          </GridLayout>
          <GridLayout columns="*, 8, *">
            <StackLayout class="inputField">
              <Label class="fieldLabel" :text="'Difficulty level' | L" />
              <TextField
                ref="difficultyLevel"
                :text="`${recipeContent.difficulty}` | L"
                editable="false"
                @focus="modalOpen === false && showDifficultyLevel(true)"
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
            columns="auto,8,auto,8,*,8,auto"
            v-for="(ingredient, index) in recipeContent.ingredients"
            :key="'ing' + index"
          >
            <TextField
              width="60"
              @loaded="
                !recipeContent.ingredients[index].item && focusField($event)
              "
              v-model="recipeContent.ingredients[index].quantity"
              hint="1.00"
              keyboardType="number"
              returnKeyType="next"
            />

            <TextField
              width="76"
              col="2"
              :text="`${recipeContent.ingredients[index].unit}` | L"
              editable="false"
              @focus="modalOpen === false && showUnits($event, true, index)"
              @tap="showUnits($event, false, index)"
            />

            <TextField
              ref="ingredient"
              @loaded="setInputTypeText($event, 'sentence')"
              col="4"
              v-model="recipeContent.ingredients[index].item"
              :hint="`${$options.filters.L('it')} ${index + 1}`"
              @returnPress="
                index + 1 == recipeContent.ingredients.length && addIngredient()
              "
            />

            <Button
              col="6"
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
            columns="*,8,auto"
            v-for="(instruction, index) in recipeContent.instructions"
            :key="'ins' + index"
          >
            <TextView
              @loaded="focusField($event, 'multiLine')"
              :hint="`${$options.filters.L('stp')} ${index + 1}`"
              v-model="recipeContent.instructions[index]"
            />
            <Button
              col="2"
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
            columns="*,8,auto"
            v-for="(combination, index) in recipeContent.combinations"
            :key="'cmbs' + index"
          >
            <TextField
              class="combField"
              :text="getCombinationTitle(combination)"
              editable="false"
            />
            <Button
              col="2"
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
            columns="*,8,auto"
            v-for="(note, index) in recipeContent.notes"
            :key="'nos' + index"
          >
            <TextView
              @loaded="focusField($event, 'multiLine')"
              :hint="`${$options.filters.L('no')} ${index + 1}`"
              v-model="recipeContent.notes[index]"
            />
            <Button
              col="2"
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
        :colSpan="hasChanges || showUndo ? '2' : '1'"
        class="appbar"
        :class="{ snackBar: showUndo }"
        columns="auto, *, auto"
      >
        <Button v-if="showUndo" :text="countdown" class="countdown tb" />
        <Button v-else class="ico" :text="icon.back" @tap="navigateBack" />
        <Label
          class="title"
          verticalAlignment="center"
          col="1"
          v-if="showUndo"
          :text="snackMsg | L"
        />
        <Button
          v-if="(hasChanges && !saving) || showUndo"
          class="ico fab"
          :text="showUndo ? icon.alert : icon.save"
          col="2"
          @tap="showUndo ? undoDel() : saveOperation()"
        />
        <ActivityIndicator margin="16" col="2" v-if="saving" :busy="saving" />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import {
  AndroidApplication,
  Application,
  ApplicationSettings,
  File,
  getFileAccess,
  ImageSource,
  knownFolders,
  path,
  Screen,
  Utils,
  Observable,
} from "@nativescript/core";
import * as Permissions from "@nativescript-community/perms";
import * as Toast from "nativescript-toast";
import * as Filepicker from "nativescript-plugin-filepicker";
import { ImageCropper } from "nativescript-imagecropper";
import { localize } from "@nativescript/localize";
import { mapState, mapActions } from "vuex";
import ActionDialog from "./modal/ActionDialog.vue";
import ActionDialogWithSearch from "./modal/ActionDialogWithSearch.vue";
import ConfirmDialog from "./modal/ConfirmDialog.vue";
import PromptDialog from "./modal/PromptDialog.vue";
import ListPicker from "./modal/ListPicker.vue";
import ViewRecipe from "./ViewRecipe";
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
      recipeContent: {
        imageSrc: null,
        title: undefined,
        cuisine: "Undefined",
        category: "Undefined",
        tags: [],
        prepTime: "00:00",
        cookTime: "00:00",
        yield: {
          quantity: undefined,
          unit: "Serving",
        },
        difficulty: "Easy",
        rating: 0,
        ingredients: [],
        instructions: [],
        combinations: [],
        notes: [],
        isFavorite: false,
        tried: true,
        lastTried: null,
        lastModified: null,
        created: null,
        inBag: false,
      },
      tempRecipeContent: {},
      tags: undefined,
      blockModal: false,
      modalOpen: false,
      newRecipeID: null,
      showFab: false,
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
    ]),
    screenWidth() {
      return Screen.mainScreen.widthDIPs;
    },
    appTheme() {
      return Application.systemAppearance();
    },
    hasChanges() {
      return (
        JSON.stringify(this.recipeContent) !==
        JSON.stringify(this.tempRecipeContent)
      );
    },
  },
  methods: {
    ...mapActions([
      "setComponent",
      "addRecipeAction",
      "overwriteRecipeAction",
      "addListItemAction",
      "unSyncCombinationsAction",
    ]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
      this.showFab = true;
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
          this.animateInOut(
            250,
            false,
            (val) => (this.appbar.translateY = val * 64)
          );
        } else if (scrollUp && ab == 64) {
          Utils.ad.dismissSoftInput();
          this.animateInOut(
            250,
            true,
            (val) => (this.appbar.translateY = val * 64)
          );
        }
      }
    },
    timeRequired(time) {
      let t = this.recipeContent[time].split(":");
      let h = parseInt(t[0]);
      let m = parseInt(t[1]);
      let hr = localize("hr");
      let min = localize("min");
      return h ? (m ? `${h} ${hr} ${m} ${min}` : `${h} ${hr}`) : `${m} ${min}`;
    },
    // HELPERS
    focusField(args, type) {
      if (type) this.setInputTypeText(args, type);
      if (!args.object.text) {
        args.object.focus();
        setTimeout((e) => Utils.ad.showSoftInput(args.object.android), 100);
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
        default:
          break;
      }
    },
    getRandomID() {
      let res = "";
      let chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < 20; i++) {
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return res;
    },
    setTimeRequired(focus, time) {
      this.modalOpen = true;
      let t = this.recipeContent[time].split(":");
      let hr = t[0];
      let min = t[1];
      this.$showModal(ListPicker, {
        props: {
          title: `${time == "prepTime" ? "prepT" : "cookT"}`,
          action: "SET",
          selectedHr: hr,
          selectedMin: min,
        },
      }).then((result) => {
        if (result) {
          this.recipeContent[time] = result;
          this.modalOpen = false;
          if (focus) {
            switch (time) {
              case "prepTime":
                this.autoFocusField("cookTime", false);
                break;
              case "cookTime":
                this.autoFocusField("yieldQuantity", true);
                break;
              default:
                break;
            }
          }
        }
      });
    },
    getTitleCount(title, type) {
      let count = this.recipeContent[type].length;
      let text = count ? ` (${count})` : "";
      return localize(title) + text;
    },
    // DATA LIST
    showCuisine(focus) {
      this.modalOpen = true;
      this.releaseBackEvent();
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
            this.hijackBackEvent();
            if (item.length) {
              this.recipeContent.cuisine = item;
              this.addListItemAction({
                item,
                listName: "cuisines",
              });
              this.modalOpen = false;
              if (focus) this.autoFocusField("category", false);
            }
          });
        } else if (action) {
          this.recipeContent.cuisine = action;
          this.hijackBackEvent();
          this.modalOpen = false;
          if (focus) this.autoFocusField("category", false);
        } else {
          this.cuisines.includes(this.recipeContent.cuisine)
            ? mull
            : (this.recipeContent.cuisine = "Undefined");
          this.hijackBackEvent();
        }
      });
    },
    showCategories(focus) {
      this.modalOpen = true;
      this.releaseBackEvent();
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
            this.hijackBackEvent();
            if (item.length) {
              this.recipeContent.category = item;
              this.addListItemAction({
                item,
                listName: "categories",
              });
              this.modalOpen = false;
              if (focus) this.autoFocusField("tags", true);
            }
          });
        } else if (action) {
          this.recipeContent.category = action;
          this.hijackBackEvent();
          this.modalOpen = false;
          if (focus) this.autoFocusField("tags", true);
        } else {
          this.categories.includes(this.recipeContent.category)
            ? mull
            : (this.recipeContent.category = "Undefined");
          this.hijackBackEvent();
        }
      });
    },
    showYieldUnits(focus) {
      this.modalOpen = true;
      this.releaseBackEvent();
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
            this.hijackBackEvent();
            if (item.length) {
              this.recipeContent.yield.unit = item;
              this.addListItemAction({
                item,
                listName: "yieldUnits",
              });
              this.modalOpen = false;
              if (focus) this.autoFocusField("difficultyLevel", false);
            }
          });
        } else if (action) {
          this.recipeContent.yield.unit = action;
          this.hijackBackEvent();
          this.modalOpen = false;
          if (focus) this.autoFocusField("difficultyLevel", false);
        } else {
          this.yieldUnits.includes(this.recipeContent.yield.unit)
            ? mull
            : (this.recipeContent.yield.unit = "Serving");
          this.hijackBackEvent();
        }
      });
    },
    showDifficultyLevel(focus) {
      this.modalOpen = true;
      this.releaseBackEvent();
      this.$showModal(ActionDialog, {
        props: {
          title: "Difficulty level",
          list: this.difficultyLevels,
        },
      }).then((action) => {
        if (action) {
          this.recipeContent.difficulty = action;
          this.hijackBackEvent();
          this.modalOpen = false;
          if (focus) this.addIngredient();
        } else {
          this.difficultyLevels.includes(this.recipeContent.difficulty)
            ? mull
            : (this.recipeContent.difficulty = "Easy");
          this.hijackBackEvent();
        }
      });
    },
    showUnits(e, focus, index) {
      this.modalOpen = true;
      this.releaseBackEvent();
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
            this.hijackBackEvent();
            if (item.length) {
              this.recipeContent.ingredients[index].unit = item;
              this.addListItemAction({
                item,
                listName: "units",
              });
              this.modalOpen = false;
              if (focus && this.recipeContent.ingredients.length - 1 === index)
                this.autoFocusRefField("ingredient", index);
            }
          });
        } else if (action) {
          this.recipeContent.ingredients[index].unit = action;
          this.hijackBackEvent();
          this.modalOpen = false;
          if (focus && this.recipeContent.ingredients.length - 1 === index)
            this.autoFocusRefField("ingredient", index);
        }
      });
    },
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
    // NAVIGATION HANDLERS
    navigateBack() {
      if (this.hasChanges) {
        this.blockModal = true;
        this.$showModal(ConfirmDialog, {
          props: {
            title: "unsaved",
            description: localize("disc"),
            cancelButtonText: "disBtn",
            okButtonText: "kEdit",
          },
        }).then((action) => {
          this.blockModal = false;
          if (action != null && !action) {
            this.$navigateBack();
            this.releaseBackEvent();
          }
        });
      } else {
        this.$navigateBack();
        this.releaseBackEvent();
      }
    },
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
      if (this.hasChanges && !this.blockModal) {
        args.cancel = true;
        this.navigateBack();
      }
    },
    // DATA HANDLERS
    imageHandler() {
      this.clearEmptyFields(true);
      if (this.recipeContent.imageSrc) {
        this.blockModal = true;
        this.$showModal(ConfirmDialog, {
          props: {
            title: "recPic",
            secondButtonText: "rBtn",
            cancelButtonText: "cBtn",
            okButtonText: "repBtn",
          },
        }).then((action) => {
          this.blockModal = false;
          if (action > 0) {
            this.permissionCheck(this.permissionConfirmation, this.imagePicker);
          } else if (action < 0) {
            this.recipeContent.imageSrc = null;
            this.releaseBackEvent();
          } else if (action != null) {
            this.releaseBackEvent();
          }
        });
      } else {
        this.permissionCheck(this.permissionConfirmation, this.imagePicker);
      }
    },
    permissionConfirmation() {
      return this.$showModal(ConfirmDialog, {
        props: {
          title: "grant",
          description: localize("reqAcc"),
          cancelButtonText: "nNBtn",
          okButtonText: "conBtn",
        },
      });
    },
    permissionCheck(confirmation, action) {
      if (!ApplicationSettings.getBoolean("storagePermissionAsked", false)) {
        confirmation().then((e) => {
          if (e) {
            Permissions.request("photo").then((status) => {
              switch (status[0]) {
                case "authorized":
                  action();
                  break;
                case "never_ask_again":
                  ApplicationSettings.setBoolean(
                    "storagePermissionAsked",
                    true
                  );
                  break;
                case "denied":
                  Toast.makeText(localize("dend")).show();
                  break;
                default:
                  break;
              }
            });
          }
        });
      } else {
        Permissions.check("photo").then((res) => {
          res[0] !== "authorized"
            ? confirmation().then((e) => e && utils.openAppSettingsPage())
            : action();
        });
      }
    },
    imagePicker() {
      ApplicationSettings.setBoolean("storagePermissionAsked", true);
      Filepicker.create({
        mode: "single",
        extensions: ["png", "jpeg", "jpg"],
      })
        .present()
        .then((selection) => {
          this.cacheImagePath = path.join(
            knownFolders.temp().path,
            `${this.getRandomID()}.jpg`
          );
          let imgPath = selection[0];
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
                  toolbarTextColor:
                    this.appTheme == "light" ? "#1A1A1A" : "#e9ecef",
                  toolbarColor:
                    this.appTheme == "light" ? "#e9ecef" : "#1A1A1A",
                  cropFrameColor: "#ff5200",
                }
              )
              .then((cropped) => {
                cropped.image.saveToFile(this.cacheImagePath, "jpg", 75);
                this.recipeContent.imageSrc = this.cacheImagePath;
              });
          });
        });
    },
    // INPUT FIELD HANDLERS
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
      this.recipeContent.tags = tags;
    },
    joinTags() {
      this.tags = this.recipeContent.tags.join(" ");
    },
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
    undoDel() {
      this.undo = true;
    },
    addIngredient() {
      let ingredients = this.recipeContent.ingredients;
      let unit = ingredients.length
        ? ingredients[ingredients.length - 1].unit
        : "unit";
      this.recipeContent.ingredients.push({
        item: "",
        quantity: null,
        unit,
      });
    },
    removeIngredient(index) {
      this.modalOpen = true;
      if (this.recipeContent.ingredients[index].item.length) {
        let item = this.recipeContent.ingredients[index];
        this.recipeContent.ingredients.splice(index, 1);
        this.showUndoBar("rmIng").then(
          (res) => res && this.recipeContent.ingredients.splice(index, 0, item)
        );
      } else {
        this.recipeContent.ingredients.splice(index, 1);
      }
      setTimeout((e) => (this.modalOpen = false), 200);
    },
    addInstruction() {
      this.recipeContent.instructions.push("");
    },
    removeInstruction(index) {
      if (this.recipeContent.instructions[index].length) {
        let item = this.recipeContent.instructions[index];
        this.recipeContent.instructions.splice(index, 1);
        this.showUndoBar("rmIns").then(
          (res) => res && this.recipeContent.instructions.splice(index, 0, item)
        );
      } else this.recipeContent.instructions.splice(index, 1);
    },
    addNote() {
      this.recipeContent.notes.push("");
    },
    removeNote(index) {
      if (this.recipeContent.notes[index].length) {
        let item = this.recipeContent.notes[index];
        this.recipeContent.notes.splice(index, 1);
        this.showUndoBar("rmN").then((res) =>
          this.recipeContent.notes.splice(index, 0, item)
        );
      } else this.recipeContent.notes.splice(index, 1);
    },
    getCombinationTitle(id) {
      return this.recipes.filter((e) => e.id === id)[0].title;
    },
    showCombinations() {
      Utils.ad.dismissSoftInput();
      this.modalOpen = true;
      this.releaseBackEvent();
      let existingCombinations = [
        ...this.recipeContent.combinations,
        this.recipeContent.id,
      ];
      let filteredRecipes = this.recipes.filter(
        (e) => !existingCombinations.includes(e.id)
      );
      this.$showModal(ActionDialogWithSearch, {
        props: {
          title: "selRec",
          recipes: filteredRecipes,
        },
      }).then((res) => {
        this.hijackBackEvent();
        if (res) {
          this.recipeContent.combinations.push(res);
        }
      });
    },
    removeCombination(id) {
      let index = this.recipeContent.combinations.indexOf(id);
      this.recipeContent.combinations.splice(index, 1);
      this.unSyncCombinations.push(id);
      this.showUndoBar("rmCmb").then((res) =>
        this.recipeContent.combinations.splice(index, 0, id)
      );
    },
    // SAVE OPERATION
    clearEmptyFields(bool) {
      if (!this.recipeContent.title && !bool)
        this.recipeContent.title = localize("untRec");
      if (!this.recipeContent.yield.quantity)
        this.recipeContent.yield.quantity = 1;
      this.recipeContent.ingredients = this.recipeContent.ingredients.filter(
        (e) => e.item
      );
      let vm = this;

      function clearEmpty(arr) {
        vm.recipeContent[arr] = vm.recipeContent[arr].filter((e) => e);
      }
      clearEmpty("instructions");
      clearEmpty("notes");
    },
    saveOperation() {
      this.saving = this.modalOpen = true;
      this.clearEmptyFields();
      this.recipeContent.lastModified = new Date();
      ApplicationSettings.setString(
        "previousCuisine",
        this.recipeContent.cuisine
      );
      ApplicationSettings.setString(
        "previousCategory",
        this.recipeContent.category
      );
      ApplicationSettings.setString(
        "previousYieldUnit",
        this.recipeContent.yield.unit
      );
      if (this.cacheImagePath) {
        let recipeImage = path.join(
          knownFolders.documents().getFolder("EnRecipes").getFolder("Images")
            .path,
          `${this.getRandomID()}.jpg`
        );
        let binarySource = File.fromPath(this.cacheImagePath).readSync();
        File.fromPath(recipeImage).writeSync(binarySource);
        this.recipeContent.imageSrc = recipeImage;
        knownFolders.temp().clear();
      }
      if (this.recipeContent.imageSrc) {
        if (
          this.tempRecipeContent.imageSrc &&
          this.tempRecipeContent.imageSrc !== this.recipeContent.imageSrc
        ) {
          getFileAccess().deleteFile(this.tempRecipeContent.imageSrc);
        }
      } else if (this.tempRecipeContent.imageSrc) {
        getFileAccess().deleteFile(this.tempRecipeContent.imageSrc);
      }
      this.unSyncCombinationsAction({
        id: this.recipeID,
        combinations: this.unSyncCombinations,
      });
      this.saveRecipe();
    },
    saveRecipe() {
      if (this.recipeID) {
        this.overwriteRecipeAction({
          id: this.recipeID,
          recipe: this.recipeContent,
        });
      } else {
        this.recipeContent.id = this.newRecipeID;
        this.addRecipeAction({
          id: this.newRecipeID,
          recipe: this.recipeContent,
        });
      }
      setTimeout(() => {
        this.saving = false;
      }, 100);
      this.$navigateBack();
    },
  },
  created() {
    setTimeout((e) => {
      this.setComponent("EditRecipe");
    }, 500);
    this.title = this.recipeID ? "editRec" : "newRec";
    if (this.recipeID) {
      let recipe = this.recipes.filter((e) => e.id === this.recipeID)[0];
      Object.assign(this.recipeContent, JSON.parse(JSON.stringify(recipe)));
      Object.assign(
        this.tempRecipeContent,
        JSON.parse(JSON.stringify(this.recipeContent))
      );
      if (this.recipeContent.tags.length) this.joinTags();
    } else {
      this.recipeContent.cuisine = this.selectedCuisine
        ? /all/.test(this.selectedCuisine)
          ? "Undefined"
          : this.selectedCuisine
        : ApplicationSettings.getString("previousCuisine", "Undefined");
      this.recipeContent.category = this.selectedCategory
        ? /all/.test(this.selectedCategory)
          ? "Undefined"
          : this.selectedCategory
        : ApplicationSettings.getString("previousCategory", "Undefined");
      if (this.selectedTag && !/all/.test(this.selectedTag)) {
        this.tags = this.selectedTag;
        this.splitTags();
      }
      this.recipeContent.yield.unit = ApplicationSettings.getString(
        "previousYieldUnit",
        "Serving"
      );
      if (this.filterFavourites) this.recipeContent.isFavorite = true;
      if (this.filterTrylater) this.recipeContent.tried = false;
      this.recipeContent.created = new Date();
      Object.assign(
        this.tempRecipeContent,
        JSON.parse(JSON.stringify(this.recipeContent))
      );
      this.newRecipeID = this.getRandomID();
    }
    this.hijackBackEvent();
  },
};
</script>
