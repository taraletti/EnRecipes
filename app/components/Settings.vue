<template>
  <Page @loaded="onPageLoad">
    <ActionBar androidElevation="1">
      <GridLayout rows="*" columns="auto, *">
        <MDButton
          class="er left"
          variant="text"
          :text="icon.back"
          automationText="Back"
          @tap="$navigateBack()"
          col="0"
        />
        <Label class="title orkm" :text="'Settings' | L" col="1" />
      </GridLayout>
    </ActionBar>
    <ScrollView>
      <StackLayout class="main-container">
        <Label :text="'intf' | L" class="group-header orkm" />
        <GridLayout
          columns="auto, *"
          class="option mdr"
          @tap="selectAppLanguage"
        >
          <Label
            col="0"
            verticalAlignment="center"
            class="er"
            :text="icon.lang"
          />
          <StackLayout col="1">
            <Label :text="'lang' | L" />
            <Label :text="appLanguage" class="info" />
          </StackLayout>
        </GridLayout>
        <GridLayout columns="auto, *" class="option mdr" @tap="selectThemes">
          <Label
            col="0"
            verticalAlignment="center"
            class="er"
            :text="icon.theme"
          />
          <StackLayout col="1">
            <Label :text="'Theme' | L" />
            <Label :text="`${appTheme}` | L" class="info" />
          </StackLayout>
        </GridLayout>
        <StackLayout class="hr m-10"></StackLayout>
        <Label :text="'opts' | L" class="group-header orkm" />
        <GridLayout columns="auto, *, auto" class="option">
          <Label
            col="0"
            verticalAlignment="center"
            class="er"
            :text="icon.shuf"
          />
          <StackLayout col="1">
            <Label :text="'sVw' | L" textWrap="true" />
            <Label :text="`sVwInfo` | L" class="info" textWrap="true" />
          </StackLayout>
          <Switch
            :color="shakeEnabled ? '#ff5200' : '#858585'"
            verticalAlignment="center"
            col="2"
            :checked="shakeEnabled"
            @checkedChange="toggleShake"
          />
        </GridLayout>
        <StackLayout class="hr m-10"></StackLayout>
        <Label :text="'db' | L" class="group-header orkm" />
        <GridLayout columns="auto, *" class="option mdr" @tap="exportCheck">
          <Label col="0" class="er" :text="icon.exp" />
          <StackLayout col="1">
            <Label :text="'expBu' | L" textWrap="true" />
            <Label
              v-if="!backupInProgress"
              :text="'buInfo' | L"
              class="info"
              textWrap="true"
            />
            <GridLayout class="progressContainer" v-else columns="*, 64">
              <MDProgress
                col="0"
                :value="backupProgress"
                maxValue="100"
              ></MDProgress>
              <Label col="1" :text="`  ${backupProgress}%`" />
            </GridLayout>
          </StackLayout>
        </GridLayout>
        <GridLayout columns="auto, *" class="option mdr" @tap="importCheck">
          <Label col="0" class="er" :text="icon.imp" />
          <StackLayout col="1">
            <Label :text="'impBu' | L" textWrap="true" />
            <Label :text="'impInfo' | L" class="info" textWrap="true" />
          </StackLayout>
        </GridLayout>
        <StackLayout class="hr m-10"></StackLayout>
        <Label :text="'rest' | L" class="group-header orkm" />
        <GridLayout
          columns="auto, *"
          class="option mdr"
          @tap="resetListItems('cuisines')"
        >
          <Label col="0" class="er" :text="icon.reset" />
          <Label
            col="1"
            verticalAlignment="center"
            :text="'restCuiL' | L"
            textWrap="true"
          />
        </GridLayout>
        <GridLayout
          columns="auto, *"
          class="option mdr"
          @tap="resetListItems('categories')"
        >
          <Label col="0" class="er" :text="icon.reset" />
          <Label
            col="1"
            verticalAlignment="center"
            :text="'restCatL' | L"
            textWrap="true"
          />
        </GridLayout>
        <GridLayout
          columns="auto, *"
          class="option mdr"
          @tap="resetListItems('yieldUnits')"
        >
          <Label col="0" class="er" :text="icon.reset" />
          <Label
            col="1"
            verticalAlignment="center"
            :text="'restYUL' | L"
            textWrap="true"
          />
        </GridLayout>
        <GridLayout
          columns="auto, *"
          class="option mdr"
          @tap="resetListItems('units')"
        >
          <Label col="0" class="er" :text="icon.reset" />
          <Label
            col="1"
            verticalAlignment="center"
            :text="'restUL' | L"
            textWrap="true"
          />
        </GridLayout>
        <Label class="group-info" :text="'restInfo' | L" textWrap="true" />

        <StackLayout class="hr m-10"></StackLayout>
        <Label :text="'help' | L" class="group-header orkm" />

        <GridLayout
          columns="auto, *"
          class="option mdr"
          @tap="openURL('https://t.me/enrecipes')"
        >
          <Label col="0" class="er" :text="icon.tg" />
          <StackLayout col="1">
            <Label :text="'joinTG' | L" textWrap="true" />
            <Label :text="'tgInfo' | L" class="info" textWrap="true" />
          </StackLayout>
        </GridLayout>
        <GridLayout
          columns="auto, *"
          class="option mdr"
          @tap="
            openURL(
              'https://github.com/vishnuraghavb/EnRecipes/wiki/User-Guide'
            )
          "
        >
          <Label col="0" class="er" :text="icon.help" />
          <Label
            verticalAlignment="center"
            col="1"
            :text="'guide' | L"
            textWrap="true"
          />
        </GridLayout>
        <GridLayout
          columns="auto, *"
          class="option mdr"
          @tap="
            openURL(
              'https://github.com/vishnuraghavb/EnRecipes/blob/main/PRIVACY.md'
            )
          "
        >
          <Label col="0" class="er" :text="icon.priv" />
          <Label
            verticalAlignment="center"
            col="1"
            :text="'priv' | L"
            textWrap="true"
          />
        </GridLayout>
        <StackLayout class="hr m-10"></StackLayout>
        <Label :text="'About' | L" class="group-header orkm" />

        <GridLayout columns="auto, *" class="option">
          <Label col="0" class="er" :text="icon.info" />
          <StackLayout col="1">
            <Label :text="'ver' | L" />
            <Label :text="getVersion" class="info" textWrap="true" />
          </StackLayout>
        </GridLayout>
        <GridLayout
          columns="auto, *"
          class="option mdr"
          @tap="openURL('https://github.com/vishnuraghavb/enrecipes')"
        >
          <Label col="0" class="er" :text="icon.gh" />
          <Label
            verticalAlignment="center"
            col="1"
            :text="'gh' | L"
            textWrap="true"
          />
        </GridLayout>
        <GridLayout
          columns="auto, *"
          class="option mdr"
          @tap="openURL('https://www.vishnuraghav.com/donate')"
        >
          <Label col="0" class="er" :text="icon.don" />
          <Label
            verticalAlignment="center"
            col="1"
            :text="'donate' | L"
            textWrap="true"
          />
        </GridLayout>
        <GridLayout
          columns="auto, *"
          class="option mdr"
          @tap="
            openURL(
              'https://hosted.weblate.org/projects/enrecipes/app-translations'
            )
          "
        >
          <Label col="0" class="er" :text="icon.trans" />
          <Label
            verticalAlignment="center"
            col="1"
            :text="'trnsl' | L"
            textWrap="true"
          />
        </GridLayout>
        <Label class="group-info" :text="'appInfo' | L" textWrap="true" />
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script>
import {
  Application,
  Utils,
  ApplicationSettings,
  path,
  knownFolders,
  File,
  Folder,
  Observable,
  Device,
} from "@nativescript/core";
import * as Permissions from "@nativescript-community/perms";
import { Zip } from "@nativescript/zip";
import * as Toast from "nativescript-toast";
import * as Filepicker from "nativescript-plugin-filepicker";
import Theme from "@nativescript/theme";
import { localize, overrideLocale } from "@nativescript/localize";
import { mapState, mapActions } from "vuex";
import ActionDialog from "./modal/ActionDialog.vue";
import ConfirmDialog from "./modal/ConfirmDialog.vue";
import * as utils from "~/shared/utils";
export default {
  data() {
    return {
      appTheme: "Light",
      appLanguage: "English",
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
      "currentComponent",
      "language",
      "shakeEnabled",
      "importSummary",
    ]),
    getVersion() {
      let ctx = Application.android.context;
      return ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0)
        .versionName;
    },
  },
  methods: {
    ...mapActions([
      "setCurrentComponentAction",
      "importListItemsAction",
      "importRecipesAction",
      "importMealPlansAction",
      "resetListItemsAction",
      "setShakeAction",
      "unlinkBrokenImages",
    ]),
    onPageLoad(args) {
      const page = args.object;
      page.bindingContext = new Observable();
      this.setCurrentComponentAction("Settings");
    },
    // HELPERS
    openURL(url) {
      Utils.openUrl(url);
    },
    // LANGUAGE SELECTION
    selectAppLanguage() {
      let languages = this.language.map((e) => e.title);
      this.$showModal(ActionDialog, {
        props: {
          title: "lang",
          list: [...languages],
          stretch: true,
          helpIcon: "lang",
        },
      }).then((action) => {
        if (action && action !== "Cancel" && this.appLanguage !== action) {
          let currentLocale = Device.language.split("-")[0];
          let locale = this.language.filter((e) => e.title === action)[0]
            .locale;
          if (currentLocale !== locale) {
            this.$showModal(ConfirmDialog, {
              props: {
                title: "appRst",
                description: localize("nLangInfo"),
                cancelButtonText: "cBtn",
                okButtonText: "rst",
                helpIcon: "res",
                bgColor: "#ff5200",
              },
            }).then((result) => {
              if (result) {
                this.appLanguage = action;
                ApplicationSettings.setString("appLanguage", action);
                overrideLocale(locale);
                setTimeout(utils.restartApp, 250);
              }
            });
          }
        }
      });
    },
    // THEME SELECTION
    selectThemes() {
      this.$showModal(ActionDialog, {
        props: {
          title: "Theme",
          list: ["Light", "Dark"],
          stretch: false,
          helpIcon: "theme",
        },
      }).then((action) => {
        if (action && action !== "Cancel" && this.appTheme !== action) {
          this.$showModal(ConfirmDialog, {
            props: {
              title: "appRst",
              description: localize("nThmInfo"),
              cancelButtonText: "cBtn",
              okButtonText: "rst",
              helpIcon: "res",
              bgColor: "#ff5200",
            },
          }).then((result) => {
            if (result) {
              this.appTheme = action;
              ApplicationSettings.setString("appTheme", action);
              setTimeout(utils.restartApp, 250);
            }
          });
        }
      });
    },
    // SHAKE VIEW RANDOM RECIPE
    toggleShake(args) {
      let checked = args.object.checked;
      if (checked && !utils.hasAccelerometer()) {
        args.object.checked = false;
        Toast.makeText(localize("noAccSensor"), "long").show();
      } else {
        ApplicationSettings.setBoolean("shakeEnabled", checked);
        this.setShakeAction(checked);
      }
    },
    // EXPORT HANDLERS
    exportCheck() {
      if (!this.recipes.length) {
        Toast.makeText(localize("aFBu")).show();
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
        Toast.makeText(
          "Backup file successfully saved to Download folder",
          "long"
        ).show();
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
      Filepicker.create({
        mode: "single",
        extensions: ["zip"],
      })
        .present()
        .then((selection) => {
          Toast.makeText(localize("vrfy") + "...").show();
          let zipPath = selection[0];
          this.validateZipContent(zipPath);
        });
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
          helpIcon: "alert",
          bgColor: "#c92a2a",
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
          helpIcon: "succ",
          bgColor: "#69db7c",
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
              else Toast.makeText(localize("dend")).show();
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
          helpIcon: "folder",
          bgColor: "#ff5200",
        },
      });
    },
    // RESET
    resetListItems(listName) {
      this.resetListItemsAction(listName);
      Toast.makeText(localize("restDone")).show();
    },
  },
  mounted() {
    this.appTheme = ApplicationSettings.getString("appTheme", "Light");
    this.appLanguage = ApplicationSettings.getString(
      "appLanguage",
      localize("sysDef")
    );
  },
};
</script>
