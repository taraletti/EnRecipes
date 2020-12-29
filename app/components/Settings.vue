<template>
<Page @loaded="onPageLoad">
  <ActionBar :androidElevation="viewIsScrolled ? 4 : 0">
    <GridLayout rows="*" columns="auto, *">
      <MDButton class="bx left" variant="text" :text="icon.menu" automationText="Back" @tap="showDrawer" col="0" />
      <Label class="title orkm" :text="'Settings' | L" col="1" />
    </GridLayout>
  </ActionBar>
  <ScrollView @scroll="onScroll">
    <StackLayout class="main-container">
      <Label :text="'Interface' | L" class="group-header orkm" />
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="selectAppLanguage" />
        <Label col="0" verticalAlignment="center" class="bx" :text="icon.globe" />
        <StackLayout col="1">
          <Label :text="'App language' | L" />
          <Label :text="appLanguage" class="info" />
        </StackLayout>
      </GridLayout>
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="selectThemes" />
        <Label col="0" verticalAlignment="center" class="bx" :text="icon.theme" />
        <StackLayout col="1">
          <Label :text="'Theme' | L" />
          <Label :text="`${appTheme}` | L" class="info" />
        </StackLayout>
      </GridLayout>
      <StackLayout class="hr m-10"></StackLayout>
      <Label :text="'Options' | L" class="group-header orkm" />
      <!-- <GridLayout columns="auto, *, auto" class="option">
        <Label col="0" verticalAlignment="center" class="bx" :text="icon.show" />
        <Label col="1" verticalAlignment="center" :text="'Keep display on while viewing a recipe' | L" textWrap="true" />
        <Switch :color="shakeEnabled ? '#ff5200' : appTheme==='Light' ? '#495057' : '#adb5bd'" verticalAlignment="center" col="2" :checked="shakeEnabled" @checkedChange="toggleShake" />
      </GridLayout> -->
      <GridLayout columns="auto, *, auto" class="option">
        <Label col="0" verticalAlignment="center" class="bx" :text="icon.shuffle" />
        <StackLayout col="1">
          <Label :text="'Shake to view random recipe' | L" textWrap="true" />
          <Label :text="`Helps you choose what to cook when you can't decide` | L" class="info" textWrap="true" />
        </StackLayout>
        <Switch :color="shakeEnabled ? '#ff5200' : appTheme==='Light' ? '#495057' : '#adb5bd'" verticalAlignment="center" col="2" :checked="shakeEnabled" @checkedChange="toggleShake" />
      </GridLayout>
      <StackLayout class="hr m-10"></StackLayout>
      <Label :text="'Database' | L" class="group-header orkm" />
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="exportCheck" />
        <Label col="0" class="bx" :text="icon.export" />
        <StackLayout col="1">
          <Label :text="'Export a full backup' | L" textWrap="true" />
          <Label v-if="!backupInProgress" :text="'Generates a zip file that contains all your data. This file can be imported back.' | L" class="info" textWrap="true" />
          <GridLayout class="progressContainer" v-else columns="*, 64">
            <MDProgress col="0" :value="backupProgress" maxValue="100"></MDProgress>
            <Label col="1" :text="`  ${backupProgress}%`" />
          </GridLayout>
        </StackLayout>
      </GridLayout>
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="importCheck" />
        <Label col="0" class="bx" :text="icon.import" />
        <StackLayout col="1">
          <Label :text="'Import from backup' | L" textWrap="true" />
          <Label :text="'Supports full backups exported by this app' | L" class="info" textWrap="true" />
        </StackLayout>
      </GridLayout>
      <StackLayout class="hr m-10"></StackLayout>
      <Label :text="'Reset' | L" class="group-header orkm" />
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="resetListItems('cuisines')" />
        <Label col="0" class="bx" :text="icon.reset" />
        <Label col="1" verticalAlignment="center" :text="'Reset cuisines list' | L" textWrap="true" />
      </GridLayout>
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="resetListItems('categories')" />
        <Label col="0" class="bx" :text="icon.reset" />
        <Label col="1" verticalAlignment="center" :text="'Reset categories list' | L" textWrap="true" />
      </GridLayout>
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="resetListItems('yieldUnits')" />
        <Label col="0" class="bx" :text="icon.reset" />
        <Label col="1" verticalAlignment="center" :text="'Reset yield units list' | L" textWrap="true" />
      </GridLayout>
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="resetListItems('units')" />
        <Label col="0" class="bx" :text="icon.reset" />
        <Label col="1" verticalAlignment="center" :text="'Reset units list' | L" textWrap="true" />
      </GridLayout>
      <Label class="group-info" :text="'Resetting a list will NOT delete your existing entries but only restores the deleted default entries.' | L" textWrap="true" />
    </StackLayout>
  </ScrollView>
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
  Device
}
from "@nativescript/core"
import * as Permissions from "@nativescript-community/perms"
import {
  Zip
}
from "@nativescript/zip"
import * as Toast from "nativescript-toast"
import * as Filepicker from "nativescript-plugin-filepicker"
import Theme from "@nativescript/theme"
import {
  localize,
  overrideLocale
}
from "@nativescript/localize"
import {
  mapState,
  mapActions
}
from "vuex"
import ActionDialog from "./modal/ActionDialog.vue"
import ConfirmDialog from "./modal/ConfirmDialog.vue"
import * as utils from "~/shared/utils"
export default {
  data() {
    return {
      viewIsScrolled: false,
      appTheme: "Light",
      appLanguage: "English",
      backupProgress: 0,
      backupInProgress: false,
    }
  },
  computed: {
    ...mapState( [ "icon", "recipes", "cuisines", "categories", "yieldUnits", "units", "mealPlans", "currentComponent", "language", "shakeEnabled", "importSummary" ] ),
  },
  methods: {
    ...mapActions( [ "setCurrentComponentAction", "importListItemsAction", "importRecipesAction", "importMealPlansAction", "resetListItemsAction", "setShakeAction", "unlinkBrokenImages" ] ),
    onPageLoad( args ) {
      const page = args.object;
      page.bindingContext = new Observable();
      this.setCurrentComponentAction( "Settings" )
    },
    // HELPERS
    showDrawer() {
      utils.showDrawer()
    },
    onScroll( args ) {
      this.viewIsScrolled = args.scrollY ? true : false
    },
    // LANGUAGE SELECTION
    selectAppLanguage() {
      let languages = this.language.map( e => e.title )
      this.$showModal( ActionDialog, {
        props: {
          title: "App language",
          list: [ ...languages ],
          stretch: true,
        },
      } ).then( ( action ) => {
        if ( action && action !== "Cancel" && this.appLanguage !== action ) {
          let currentLocale = Device.language.split( '-' )[ 0 ]
          let locale = this.language.filter( e => e.title === action )[ 0 ].locale
          if ( currentLocale !== locale ) {
            this.$showModal( ConfirmDialog, {
              props: {
                title: "Restart required",
                description: localize( "EnRecipes needs to be restarted for the app language to take effect." ),
                cancelButtonText: "CANCEL",
                okButtonText: "RESTART",
              },
            } ).then( ( result ) => {
              if ( result ) {
                this.appLanguage = action
                ApplicationSettings.setString( "appLanguage", action )
                overrideLocale( locale )
                setTimeout( ( e ) => utils.restartApp(), 250 )
              }
            } )
          }
        }
      } )
    },
    // THEME SELECTION
    selectThemes() {
      this.$showModal( ActionDialog, {
        props: {
          title: "Theme",
          list: [ "Light", "Dark" ],
          stretch: false
        },
      } ).then( ( action ) => {
        if ( action && action !== "Cancel" && this.appTheme !== action ) {
          this.$showModal( ConfirmDialog, {
            props: {
              title: "Restart required",
              description: localize( "EnRecipes needs to be restarted for the theme change to take effect." ),
              cancelButtonText: "CANCEL",
              okButtonText: "RESTART",
            },
          } ).then( ( result ) => {
            if ( result ) {
              this.appTheme = action
              ApplicationSettings.setString( "appTheme", action )
              setTimeout( ( e ) => utils.restartApp(), 250 )
            }
          } )
        }
      } )
    },
    // SHAKE VIEW RANDOM RECIPE
    toggleShake( args ) {
      let checked = args.object.checked
      // let checked = !this.shakeEnabled
      ApplicationSettings.setBoolean( 'shakeEnabled', checked )
      this.setShakeAction( checked )
    },
    // EXPORT HANDLERS
    exportCheck() {
      if ( !this.recipes.length ) {
        Toast.makeText( localize( "Add at least one recipe to perform a backup" ), "long" ).show()
      } else {
        this.permissionCheck( this.permissionConfirmation, localize( "EnRecipes requires storage permission in order to backup your data to this device." ), this.exportBackup )
      }
    },
    exportBackup() {
      this.exportFiles( "create" )
      let date = new Date()
      let formattedDate = date.getFullYear() + "-" + ( "0" + ( date.getMonth() + 1 ) ).slice( -2 ) + "-" + ( "0" + date.getDate() ).slice( -2 ) + "_" + ( "0" + date.getHours() ).slice( -2 ) + ( "0" + date.getMinutes() ).slice( -2 ) + ( "0" + date
        .getSeconds() ).slice( -2 )
      const sdDownloadPath = Folder.fromPath( android.os.Environment.getExternalStorageDirectory().getAbsolutePath() ).getFolder( "Download" ).path
      let fromPath = path.join( knownFolders.documents().path, "EnRecipes" )
      let destPath = path.join( sdDownloadPath, `EnRecipes-Backup_${formattedDate}.zip` )
      this.backupInProgress = true
      Zip.zip( {
        directory: fromPath,
        archive: destPath,
        onProgress: ( progress ) => {
          this.backupProgress = progress
        },
      } ).then( ( success ) => {
        Toast.makeText( "Backup file successfully saved to Download folder", "long" ).show()
        this.exportFiles( "delete" )
      } )
    },
    exportFiles( option ) {
      const folder = path.join( knownFolders.documents().path, "EnRecipes" )
      const EnRecipesFile = File.fromPath( path.join( folder, "recipes.json" ) )
      let userCuisinesFile, userCategoriesFile, userYieldUnitsFile, userUnitsFile, mealPlansFile
      if ( this.cuisines.length ) userCuisinesFile = File.fromPath( path.join( folder, "userCuisines.json" ) )
      if ( this.categories.length ) userCategoriesFile = File.fromPath( path.join( folder, "userCategories.json" ) )
      if ( this.yieldUnits.length ) userYieldUnitsFile = File.fromPath( path.join( folder, "userYieldUnits.json" ) )
      if ( this.units.length ) userUnitsFile = File.fromPath( path.join( folder, "userUnits.json" ) )
      if ( this.mealPlans.length ) mealPlansFile = File.fromPath( path.join( folder, "mealPlans.json" ) )
      switch ( option ) {
        case "create":
          this.writeDataToFile( EnRecipesFile, this.recipes )
          this.cuisines.length && this.writeDataToFile( userCuisinesFile, this.cuisines )
          this.categories.length && this.writeDataToFile( userCategoriesFile, this.categories )
          this.yieldUnits.length && this.writeDataToFile( userYieldUnitsFile, this.yieldUnits )
          this.units.length && this.writeDataToFile( userUnitsFile, this.units )
          this.mealPlans.length && this.writeDataToFile( mealPlansFile, this.mealPlans )
          break
        case "delete":
          EnRecipesFile.remove()
          this.cuisines.length && userCuisinesFile.remove()
          this.categories.length && userCategoriesFile.remove()
          this.yieldUnits.length && userYieldUnitsFile.remove()
          this.units.length && userUnitsFile.remove()
          this.mealPlans.length && mealPlansFile.remove()
          break
        default:
          break
      }
    },
    writeDataToFile( file, data ) {
      file.writeText( JSON.stringify( data ) )
    },
    // IMPORT HANDLERS
    importCheck() {
      this.permissionCheck( this.permissionConfirmation, localize( "EnRecipes requires storage permission in order to import your data from a previous backup." ), this.openFilePicker )
    },
    openFilePicker() {
      Filepicker.create( {
        mode: "single",
        extensions: [ "zip" ],
      } ).present().then( ( selection ) => {
        Toast.makeText( localize( "Verifying..." ) ).show()
        let zipPath = selection[ 0 ]
        this.validateZipContent( zipPath )
      } )
    },
    importDataToDB( data, db, zipPath ) {
      switch ( db ) {
        case "EnRecipesDB":
          this.importImages( zipPath )
          this.importRecipesAction( data )
          break
        case "userCuisinesDB":
          this.importListItemsAction( {
            data,
            listName: "cuisines",
          } )
          break
        case "userCategoriesDB":
          this.importListItemsAction( {
            data,
            listName: "categories",
          } )
          break
        case "userYieldUnitsDB":
          this.importListItemsAction( {
            data,
            listName: "yieldUnits",
          } )
          break
        case "userUnitsDB":
          this.importListItemsAction( {
            data,
            listName: "units",
          } )
          break
        case "mealPlansDB":
          this.importMealPlansAction( data )
          break
        default:
          break
      }
    },
    hasValidJSON( data ) {
      try {
        JSON.parse( data ) && Array.isArray( JSON.parse( data ) )
      } catch ( e ) {
        return false;
      }
      return true;
    },
    isFileDataValid( file ) {
      const files = file.filter( e => File.exists( e.path ) )
      if ( files.length ) {
        let isValid = files.map( e => false )
        files.forEach( ( file, i ) => {
          File.fromPath( file.path ).readText().then( ( data ) => {
            isValid[ i ] = this.hasValidJSON( data )
            if ( !isValid[ i ] ) {
              this.failedImport( `${localize("Backup file has been modified externally.")}\n\n${localize("Invalid file:")} ${file.file}` )
              return 0;
            }
            if ( isValid.every( e => e === true ) ) {
              files.forEach( ( file, i ) => {
                File.fromPath( file.path ).readText().then( ( data ) => {
                  this.importDataToDB( JSON.parse( data ), file.db, file.zipPath )
                } )
              } )
            }
          } )
        } )
      } else {
        this.failedImport( localize( "Backup file seems empty." ) )
      }
    },
    failedImport( description ) {
      this.$showModal( ConfirmDialog, {
        props: {
          title: "Import failed",
          description,
          okButtonText: "OK",
        },
      } )
    },
    validateZipContent( zipPath ) {
      Zip.unzip( {
        archive: zipPath,
        overwrite: true,
      } ).then( ( extractedFolderPath ) => {
        let cacheFolderPath = extractedFolderPath + "/EnRecipes"
        const EnRecipesFilePath = cacheFolderPath + "/recipes.json"
        const userCuisinesFilePath = cacheFolderPath + "/userCuisines.json"
        const userCategoriesFilePath = cacheFolderPath + "/userCategories.json"
        const userYieldUnitsFilePath = cacheFolderPath + "/userYieldUnits.json"
        const userUnitsFilePath = cacheFolderPath + "/userUnits.json"
        const mealPlansFilePath = cacheFolderPath + "/mealPlans.json"
        if ( Folder.exists( cacheFolderPath ) ) {
          this.isFileDataValid( [ {
            zipPath,
            path: EnRecipesFilePath,
            db: "EnRecipesDB",
            file: "recipes.json"
          }, {
            zipPath,
            path: userCuisinesFilePath,
            db: "userCuisinesDB",
            file: "userCuisines.json"
          }, {
            zipPath,
            path: userCategoriesFilePath,
            db: "userCategoriesDB",
            file: "userCategories.json"
          }, {
            zipPath,
            path: userYieldUnitsFilePath,
            db: "userYieldUnitsDB",
            file: "userYieldUnits.json"
          }, {
            zipPath,
            path: userUnitsFilePath,
            db: "userUnitsDB",
            file: "userUnits.json"
          }, {
            zipPath,
            path: mealPlansFilePath,
            db: "mealPlansDB",
            file: "mealPlans.json"
          }, ] )
        } else {
          Folder.fromPath( extractedFolderPath ).remove()
          this.failedImport( localize( "Backup file is incorrect or corrupt." ) )
        }
        if ( Folder.exists( cacheFolderPath + "/Images" ) ) {
          this.importImages( cacheFolderPath + "/Images" )
        }
      } )
    },
    importImages( sourcePath ) {
      let dest = knownFolders.documents().path
      Zip.unzip( {
        archive: sourcePath,
        directory: dest,
        overwrite: true,
      } ).then( ( res ) => {
        Toast.makeText( localize( "Import successful" ) ).show()
        this.showImportSummary()
        this.unlinkBrokenImages()
      } )
    },
    showImportSummary() {
      let {
        found,
        imported,
        updated
      } = this.importSummary
      let exists = found - imported + updated
      let importedNote = `\n${imported} ${localize('recipes imported')}`
      let existsNote = `\n${exists} ${localize('recipes already exists')}`
      let updatedNote = `\n${updated} ${localize('recipes updated')}`
      this.$showModal( ConfirmDialog, {
        props: {
          title: "Import summary",
          description: `${found} ${localize('recipes found')}${ importedNote}${existsNote}${updatedNote}`,
          okButtonText: "OK",
        },
      } )
    },
    // PERMISSIONS HANDLER
    permissionCheck( confirmation, description, action ) {
      if ( !ApplicationSettings.getBoolean( "storagePermissionAsked", false ) ) {
        confirmation( description ).then( ( e ) => {
          if ( e ) {
            Permissions.request( "photo" ).then( ( res ) => {
              let status = res[ Object.keys( res )[ 0 ] ]
              if ( status === "authorized" ) action()
              if ( status !== "denied" ) ApplicationSettings.setBoolean( "storagePermissionAsked", true )
              else Toast.makeText( localize( "Permission denied" ) ).show()
            } )
          }
        } )
      } else {
        Permissions.check( "photo" ).then( ( res ) => {
          let status = res[ Object.keys( res )[ 0 ] ]
          if ( status !== "authorized" ) {
            confirmation( description ).then( ( e ) => {
              e && utils.openAppSettingsPage()
            } )
          } else action()
        } )
      }
    },
    permissionConfirmation( description ) {
      return this.$showModal( ConfirmDialog, {
        props: {
          title: "Grant permission",
          description,
          cancelButtonText: "NOT NOW",
          okButtonText: "CONTINUE",
        },
      } )
    },
    // RESET
    resetListItems( listName ) {
      this.resetListItemsAction( listName )
      Toast.makeText( localize( "Reset successful" ) ).show()
    }
  },
  mounted() {
    this.appTheme = ApplicationSettings.getString( "appTheme", "Light" )
    this.appLanguage = ApplicationSettings.getString( "appLanguage", localize( "System default" ) )
  },
}
</script>
