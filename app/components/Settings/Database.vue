<template>
  <Page @loaded="onPageLoad" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="auto, *">
      <ListView
        colSpan="2"
        rowSpan="2"
        class="options-list"
        for="item in items"
      >
        <v-template if="$index == 0">
          <Label class="pageTitle" :text="'db' | L" />
        </v-template>
        <v-template if="$index == 4">
          <StackLayout class="listSpace"> </StackLayout>
        </v-template>
        <v-template>
          <GridLayout
            columns="auto, *"
            class="option"
            @touch="touch($event, item.action)"
          >
            <Label class="ico" :text="icon[item.icon]" />
            <StackLayout col="1" verticalAlignment="center">
              <Label :text="item.title | L" class="info" />
              <Label v-if="item.subTitle" :text="item.subTitle" class="sub" />
            </StackLayout>
          </GridLayout>
        </v-template>
      </ListView>
      <GridLayout
        v-show="!toast && !progress"
        row="1"
        class="appbar"
        rows="*"
        columns="auto, *"
      >
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
      </GridLayout>
      <GridLayout
        v-show="toast"
        row="1"
        colSpan="2"
        class="appbar snackBar"
        columns="*"
        @tap="toast = null"
      >
        <FlexboxLayout minHeight="48" alignItems="center">
          <Label class="title msg" :text="toast" />
        </FlexboxLayout>
      </GridLayout>
      <GridLayout
        v-show="progress"
        row="1"
        colSpan="2"
        class="appbar snackBar"
        columns="auto, *"
      >
        <ActivityIndicator :busy="progress ? true : false" />
        <Label col="1" class="title" :text="progress" textWrap="true" />
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
  Application,
} from "@nativescript/core";
import { localize } from "@nativescript/localize";
import ConfirmDialog from "../modal/ConfirmDialog.vue";
import { mapState, mapActions } from "vuex";

import * as utils from "~/shared/utils";

export default {
  data() {
    return {
      backupFolder: null,
      progress: null,
      toast: null,
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
          icon: "folder",
          title: "buFol",
          subTitle: this.backupFolder,
          action: this.setBackupFolder,
        },
        {
          icon: "exp",
          title: "expBu",
          subTitle: localize("buInfo"),
          action: this.exportCheck,
        },
        {
          icon: "imp",
          title: "impBu",
          subTitle: localize("impInfo"),
          action: this.openZipFile,
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
      "clearImportSummary",
    ]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
      const ContentResolver = Application.android.nativeApp.getContentResolver();
      this.backupFolder = ApplicationSettings.getString("backupFolder");
      if (
        !this.backupFolder ||
        ContentResolver.getPersistedUriPermissions().isEmpty()
      ) {
        this.backupFolder = null;
      }
    },
    // BACKUP FOLDER PICKER
    setBackupFolder(startExport) {
      const ContentResolver = Application.android.nativeApp.getContentResolver();
      const FLAGS =
        android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION |
        android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION;
      utils.getBackupFolder().then((uri) => {
        if (uri != null) {
          if (this.backupFolder)
            ContentResolver.releasePersistableUriPermission(
              new android.net.Uri.parse(this.backupFolder),
              FLAGS
            );
          this.backupFolder = uri.toString();
          ApplicationSettings.setString("backupFolder", this.backupFolder);
          // PERSIST PERMISSIONS
          ContentResolver.takePersistableUriPermission(uri, FLAGS);
          if (startExport && this.backupFolder) {
            this.exportBackup();
          }
        }
      });
    },

    // EXPORT HANDLERS
    exportCheck() {
      const ContentResolver = Application.android.nativeApp.getContentResolver();
      if (!this.recipes.length) {
        this.toast = localize("aFBu");
        utils.timer(5, (val) => {
          if (!val) this.toast = val;
        });
      } else {
        if (
          !this.backupFolder ||
          ContentResolver.getPersistedUriPermissions().isEmpty()
        ) {
          this.setBackupFolder(true);
        } else this.exportBackup();
      }
    },
    exportBackup() {
      this.progress = localize("expip");
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

      let filename = `EnRecipes_${formattedDate}.zip`;
      let fromPath = path.join(knownFolders.documents().path, "EnRecipes");
      utils.Zip.zip(fromPath, this.backupFolder, filename)
        .then((res) => {
          if (res) this.showExportSummary(filename);
        })
        .catch((err) => console.log("Backup error: ", err));
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
      }
    },
    writeDataToFile(file, data) {
      file.writeText(JSON.stringify(data));
    },
    showExportSummary(filename) {
      this.progress = null;
      this.$showModal(ConfirmDialog, {
        props: {
          title: "expSuc",
          description: `Backed up to ${filename}`,
          okButtonText: "OK",
        },
      });
    },

    // IMPORT HANDLERS
    openZipFile() {
      utils.getBackupFile().then((uri) => {
        console.log(uri);
        if (uri) {
          let dest = path.join(knownFolders.temp().path, "tempUnZip");
          utils.Zip.unzip(uri, dest)
            .then((res) => {
              if (res) this.validateZipContent(res, uri);
            })
            .catch(() => this.failedImport(localize("buInc")));
        }
      });
    },
    validateZipContent(extractedFolderPath, uri) {
      this.progress = localize("impip");
      let cacheFolderPath = extractedFolderPath + "/EnRecipes";
      const EnRecipesFilePath = cacheFolderPath + "/recipes.json";
      const ImagesFolderPath = cacheFolderPath + "/Images";
      const userCuisinesFilePath = cacheFolderPath + "/userCuisines.json";
      const userCategoriesFilePath = cacheFolderPath + "/userCategories.json";
      const userYieldUnitsFilePath = cacheFolderPath + "/userYieldUnits.json";
      const userUnitsFilePath = cacheFolderPath + "/userUnits.json";
      const mealPlansFilePath = cacheFolderPath + "/mealPlans.json";
      if (Folder.exists(cacheFolderPath)) {
        this.isFileDataValid([
          {
            path: EnRecipesFilePath,
            db: "EnRecipesDB",
            file: "recipes.json",
          },
          {
            path: userCuisinesFilePath,
            db: "userCuisinesDB",
            file: "userCuisines.json",
          },
          {
            path: userCategoriesFilePath,
            db: "userCategoriesDB",
            file: "userCategories.json",
          },
          {
            path: userYieldUnitsFilePath,
            db: "userYieldUnitsDB",
            file: "userYieldUnits.json",
          },
          {
            path: userUnitsFilePath,
            db: "userUnitsDB",
            file: "userUnits.json",
          },
          {
            path: mealPlansFilePath,
            db: "mealPlansDB",
            file: "mealPlans.json",
          },
        ]);
      } else {
        Folder.fromPath(extractedFolderPath).remove();
        this.progress = null;
        this.failedImport(localize("buInc"));
      }
      if (Folder.exists(ImagesFolderPath)) {
        const timer = setInterval(() => {
          if (this.importSummary.found) {
            this.importImages(uri, extractedFolderPath);
            clearInterval(timer);
          }
        }, 100);
      }
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
                files.forEach((file) => {
                  File.fromPath(file.path)
                    .readText()
                    .then((data) => {
                      this.importDataToDB(JSON.parse(data), file.db);
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
    hasValidJSON(data) {
      try {
        JSON.parse(data) && Array.isArray(JSON.parse(data));
      } catch (e) {
        return false;
      }
      return true;
    },
    importDataToDB(data, db) {
      switch (db) {
        case "EnRecipesDB":
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
      }
    },
    importImages(uri, extractedFolderPath) {
      let destPath = knownFolders.documents().path;
      Folder.fromPath(destPath);
      utils.Zip.unzip(uri, destPath).then((res) => {
        if (res) {
          this.showImportSummary();
          this.unlinkBrokenImages();
          this.exportFiles("delete");
          Folder.fromPath(extractedFolderPath).remove();
        }
      });
    },
    showImportSummary() {
      let { found, imported, updated } = this.importSummary;
      let exists = Math.abs(found - imported - updated) + updated;
      let importedNote = `\n${localize("recI")} ${imported}`;
      let existsNote = `\n${localize("recE")} ${exists}`;
      let updatedNote = `\n${localize("recU")} ${updated}`;
      this.progress = null;
      this.$showModal(ConfirmDialog, {
        props: {
          title: "impSuc",
          description: `${found} ${localize(
            "recF"
          )}\n${importedNote}${existsNote}${updatedNote}`,
          okButtonText: "OK",
        },
      }).then(() => this.clearImportSummary());
    },

    // HELPERS
    touch({ object, action }, method) {
      object.className = action.match(/down|move/) ? "option fade" : "option";
      if (action == "up") method();
    },
  },
};
</script>
