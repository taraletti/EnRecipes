<template>
  <Page @loaded="onPageLoad" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="auto, *">
      <ListView
        colSpan="2"
        rowSpan="2"
        class="options-list"
        @loaded="listViewLoad"
        for="item in items"
      >
        <v-template if="$index == 0">
          <Label class="pageTitle" :text="'db' | L" />
        </v-template>
        <v-template if="$index == 3">
          <StackLayout class="listSpace"> </StackLayout>
        </v-template>
        <v-template>
          <GridLayout
            columns="auto, *"
            class="option"
            @touch="touch($event, item.action)"
          >
            <Label class="ico" :text="icon[item.icon]" />
            <StackLayout col="1">
              <Label :text="item.title | L" class="info" />
              <Label :text="item.subTitle | L" class="sub" />
            </StackLayout>
          </GridLayout>
        </v-template>
      </ListView>
      <GridLayout row="1" class="appbar" rows="*" columns="auto, *">
        <Button
          class="ico"
          :text="icon.back"
          @tap="$navigateBack()"
        />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import {
  ApplicationSettings,
  path,
  knownFolders,
  File,
  Folder,
  Observable,
} from "@nativescript/core";
import * as Permissions from "@nativescript-community/perms";
import { Zip } from "@nativescript/zip";
// import * as Filepicker from "nativescript-plugin-filepicker";
import { localize } from "@nativescript/localize";
import ConfirmDialog from "../modal/ConfirmDialog.vue";
import { mapState, mapActions } from "vuex";

import * as utils from "~/shared/utils";

export default {
  data() {
    return {
      backupProgress: 0,
      backupInProgress: false,
    };
  },
  computed: {
    ...mapState([
      "icon",
      "recipes",
      "cuisines",
      "categories",
      "yieldUnits",
      "units",
      "mealPlans",
      "importSummary",
    ]),
    items() {
      return [
        {},
        {
          icon: "exp",
          title: "expBu",
          subTitle: "buInfo",
          action: this.exportCheck,
        },
        {
          icon: "imp",
          title: "impBu",
          subTitle: "impInfo",
          action: this.importCheck,
        },
        {},
      ];
    },
  },
  methods: {
    ...mapActions([
      "importListItemsAction",
      "importRecipesAction",
      "importMealPlansAction",
      "unlinkBrokenImages",
    ]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
    },
    // EXPORT HANDLERS
    exportCheck() {
      if (!this.recipes.length) {
        // Toast.makeText(localize("aFBu")).show();
      } else {
        this.permissionCheck(
          this.permissionConfirmation,
          localize("reqAcc"),
          this.exportBackup
        );
      }
    },
    exportBackup() {
      this.exportFiles("create");
      let date = new Date();
      let formattedDate =
        date.getFullYear() +
        "-" +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + date.getDate()).slice(-2) +
        "_" +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);
      const sdDownloadPath = Folder.fromPath(
        android.os.Environment.getExternalStorageDirectory().getAbsolutePath()
      ).getFolder("Download").path;
      let fromPath = path.join(knownFolders.documents().path, "EnRecipes");
      let destPath = path.join(
        sdDownloadPath,
        `EnRecipes-Backup_${formattedDate}.zip`
      );
      this.backupInProgress = true;
      Zip.zip({
        directory: fromPath,
        archive: destPath,
        onProgress: (progress) => {
          this.backupProgress = progress;
        },
      }).then((success) => {
        // Toast.makeText(
        //   "Backup file successfully saved to Download folder",
        //   "long"
        // ).show();
        this.exportFiles("delete");
        setTimeout((e) => (this.backupInProgress = false), 3000);
      });
    },
    exportFiles(option) {
      const folder = path.join(knownFolders.documents().path, "EnRecipes");
      const EnRecipesFile = File.fromPath(path.join(folder, "recipes.json"));
      let userCuisinesFile,
        userCategoriesFile,
        userYieldUnitsFile,
        userUnitsFile,
        mealPlansFile;
      if (this.cuisines.length)
        userCuisinesFile = File.fromPath(
          path.join(folder, "userCuisines.json")
        );
      if (this.categories.length)
        userCategoriesFile = File.fromPath(
          path.join(folder, "userCategories.json")
        );
      if (this.yieldUnits.length)
        userYieldUnitsFile = File.fromPath(
          path.join(folder, "userYieldUnits.json")
        );
      if (this.units.length)
        userUnitsFile = File.fromPath(path.join(folder, "userUnits.json"));
      if (this.mealPlans.length)
        mealPlansFile = File.fromPath(path.join(folder, "mealPlans.json"));
      switch (option) {
        case "create":
          this.writeDataToFile(EnRecipesFile, this.recipes);
          this.cuisines.length &&
            this.writeDataToFile(userCuisinesFile, this.cuisines);
          this.categories.length &&
            this.writeDataToFile(userCategoriesFile, this.categories);
          this.yieldUnits.length &&
            this.writeDataToFile(userYieldUnitsFile, this.yieldUnits);
          this.units.length && this.writeDataToFile(userUnitsFile, this.units);
          this.mealPlans.length &&
            this.writeDataToFile(mealPlansFile, this.mealPlans);
          break;
        case "delete":
          EnRecipesFile.remove();
          this.cuisines.length && userCuisinesFile.remove();
          this.categories.length && userCategoriesFile.remove();
          this.yieldUnits.length && userYieldUnitsFile.remove();
          this.units.length && userUnitsFile.remove();
          this.mealPlans.length && mealPlansFile.remove();
          break;
        default:
          break;
      }
    },
    writeDataToFile(file, data) {
      file.writeText(JSON.stringify(data));
    },
    // IMPORT HANDLERS
    importCheck() {
      this.permissionCheck(
        this.permissionConfirmation,
        localize("reqAcc"),
        this.openFilePicker
      );
    },
    openFilePicker() {
      // Filepicker.create({
      //   mode: "single",
      //   extensions: ["zip"],
      // })
      //   .present()
      //   .then((selection) => {
      //     // Toast.makeText(localize("vrfy") + "...").show();
      //     let zipPath = selection[0];
      //     this.validateZipContent(zipPath);
      //   });
    },
    importDataToDB(data, db, zipPath) {
      switch (db) {
        case "EnRecipesDB":
          this.importImages(zipPath);
          this.importRecipesAction(data);
          break;
        case "userCuisinesDB":
          this.importListItemsAction({
            data,
            listName: "cuisines",
          });
          break;
        case "userCategoriesDB":
          this.importListItemsAction({
            data,
            listName: "categories",
          });
          break;
        case "userYieldUnitsDB":
          this.importListItemsAction({
            data,
            listName: "yieldUnits",
          });
          break;
        case "userUnitsDB":
          this.importListItemsAction({
            data,
            listName: "units",
          });
          break;
        case "mealPlansDB":
          this.importMealPlansAction(data);
          break;
        default:
          break;
      }
    },
    hasValidJSON(data) {
      try {
        JSON.parse(data) && Array.isArray(JSON.parse(data));
      } catch (e) {
        return false;
      }
      return true;
    },
    isFileDataValid(file) {
      const files = file.filter((e) => File.exists(e.path));
      if (files.length) {
        let isValid = files.map((e) => false);
        files.forEach((file, i) => {
          File.fromPath(file.path)
            .readText()
            .then((data) => {
              isValid[i] = this.hasValidJSON(data);
              if (!isValid[i]) {
                this.failedImport(
                  `${localize("buMod")}\n\n${localize("invFile")}: ${file.file}`
                );
                return 0;
              }
              if (isValid.every((e) => e === true)) {
                files.forEach((file, i) => {
                  File.fromPath(file.path)
                    .readText()
                    .then((data) => {
                      this.importDataToDB(
                        JSON.parse(data),
                        file.db,
                        file.zipPath
                      );
                    });
                });
              }
            });
        });
      } else {
        this.failedImport(localize("buEmp"));
      }
    },
    failedImport(description) {
      this.$showModal(ConfirmDialog, {
        props: {
          title: "impFail",
          description,
          okButtonText: "OK",
        },
      });
    },
    validateZipContent(zipPath) {
      Zip.unzip({
        archive: zipPath,
        overwrite: true,
      }).then((extractedFolderPath) => {
        let cacheFolderPath = extractedFolderPath + "/EnRecipes";
        const EnRecipesFilePath = cacheFolderPath + "/recipes.json";
        const userCuisinesFilePath = cacheFolderPath + "/userCuisines.json";
        const userCategoriesFilePath = cacheFolderPath + "/userCategories.json";
        const userYieldUnitsFilePath = cacheFolderPath + "/userYieldUnits.json";
        const userUnitsFilePath = cacheFolderPath + "/userUnits.json";
        const mealPlansFilePath = cacheFolderPath + "/mealPlans.json";
        if (Folder.exists(cacheFolderPath)) {
          this.isFileDataValid([
            {
              zipPath,
              path: EnRecipesFilePath,
              db: "EnRecipesDB",
              file: "recipes.json",
            },
            {
              zipPath,
              path: userCuisinesFilePath,
              db: "userCuisinesDB",
              file: "userCuisines.json",
            },
            {
              zipPath,
              path: userCategoriesFilePath,
              db: "userCategoriesDB",
              file: "userCategories.json",
            },
            {
              zipPath,
              path: userYieldUnitsFilePath,
              db: "userYieldUnitsDB",
              file: "userYieldUnits.json",
            },
            {
              zipPath,
              path: userUnitsFilePath,
              db: "userUnitsDB",
              file: "userUnits.json",
            },
            {
              zipPath,
              path: mealPlansFilePath,
              db: "mealPlansDB",
              file: "mealPlans.json",
            },
          ]);
        } else {
          Folder.fromPath(extractedFolderPath).remove();
          this.failedImport(localize("buInc"));
        }
        if (Folder.exists(cacheFolderPath + "/Images")) {
          this.importImages(cacheFolderPath + "/Images");
        }
      });
    },
    importImages(sourcePath) {
      let dest = knownFolders.documents().path;
      Zip.unzip({
        archive: sourcePath,
        directory: dest,
        overwrite: true,
      }).then((res) => {
        this.showImportSummary();
        this.unlinkBrokenImages();
      });
    },
    showImportSummary() {
      let { found, imported, updated } = this.importSummary;
      let exists = Math.abs(found - imported - updated) + updated;
      let importedNote = `\n${imported} ${localize("recI")}`;
      let existsNote = `\n${exists} ${localize("recE")}`;
      let updatedNote = `\n${updated} ${localize("recU")}`;
      this.$showModal(ConfirmDialog, {
        props: {
          title: "impSuc",
          description: `${found} ${localize(
            "recF"
          )}${importedNote}${existsNote}${updatedNote}`,
          okButtonText: "OK",
        },
      });
    },
    // PERMISSIONS HANDLER
    permissionCheck(confirmation, description, action) {
      if (!ApplicationSettings.getBoolean("storagePermissionAsked", false)) {
        confirmation(description).then((e) => {
          if (e) {
            Permissions.request("photo").then((res) => {
              let status = res[Object.keys(res)[0]];
              if (status === "authorized") action();
              if (status !== "denied")
                ApplicationSettings.setBoolean("storagePermissionAsked", true);
              // else Toast.makeText(localize("dend")).show();
            });
          }
        });
      } else {
        Permissions.check("photo").then((res) => {
          let status = res[Object.keys(res)[0]];
          if (status !== "authorized") {
            confirmation(description).then((e) => {
              e && utils.openAppSettingsPage();
            });
          } else action();
        });
      }
    },
    permissionConfirmation(description) {
      return this.$showModal(ConfirmDialog, {
        props: {
          title: "grant",
          description,
          cancelButtonText: "nNBtn",
          okButtonText: "conBtn",
        },
      });
    },
    // HELPERS
    touch({ object, action }, method) {
      object.className = action.match(/down|move/) ? "option fade" : "option";
      if (action == "up") method();
    },
  },
};
</script>
