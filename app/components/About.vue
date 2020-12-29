<template>
<Page @loaded="onPageLoad">
  <ActionBar :androidElevation="viewIsScrolled ? 4 : 0">
    <GridLayout rows="*" columns="auto, *">
      <MDButton variant="text" class="bx" :text="icon.menu" automationText="Back" @tap="showDrawer" col="0" />
      <Label class="title orkm" :text="'About' | L" col="1" />
    </GridLayout>
  </ActionBar>
  <ScrollView @scroll="onScroll">
    <StackLayout class="main-container">
      <StackLayout horizontalAlignment="center" orientation="horizontal" class="appIconContainer">
        <Image src="res://logo" class="appIcon" stretch="aspectFit" />
      </StackLayout>
      <StackLayout class="m-8"></StackLayout>
      <GridLayout columns="auto, *" class="option">
        <Label col="0" class="bx" :text="icon.info" />
        <StackLayout col="1">
          <Label :text="'Version' | L" />
          <Label :text="getVersion" class="info" textWrap="true" />
        </StackLayout>
      </GridLayout>
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="openURL('https://github.com/vishnuraghavb/enrecipes')" />
        <Label col="0" class="bx" :text="icon.github" />
        <Label verticalAlignment="center" col="1" :text="'View on GitHub' | L" textWrap="true" />
      </GridLayout>
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="openURL('https://github.com/vishnuraghavb/EnRecipes/blob/main/PRIVACY.md')" />
        <Label col="0" class="bx" :text="icon.lock" />
        <Label verticalAlignment="center" col="1" :text="'Privacy policy' | L" textWrap="true" />
      </GridLayout>
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="openURL('https://github.com/vishnuraghavb/EnRecipes/wiki/User-Guide')" />
        <Label col="0" class="bx" :text="icon.compass" />
        <Label verticalAlignment="center" col="1" :text="'User guide' | L" textWrap="true" />
      </GridLayout>
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="openURL('https://www.vishnuraghav.com/donate')" />
        <Label col="0" class="bx" :text="icon.donate" />
        <Label verticalAlignment="center" col="1" :text="'Donate' | L" textWrap="true" />
      </GridLayout>
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="openURL('https://t.me/enrecipes')" />
        <Label col="0" class="bx" :text="icon.telegram" />
        <StackLayout col="1">
          <Label :text="'Join the Telegram group' | L" textWrap="true" />
          <Label :text="'for reporting issues, suggestions and feedback' | L" class="info" textWrap="true" />
        </StackLayout>
      </GridLayout>
      <StackLayout class="hr m-10"></StackLayout>
      <Label :text="'Author' | L" class="group-header orkm" />
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="openURL('https://www.vishnuraghav.com')" />
        <Label col="0" class="bx" :text="icon.user" />
        <Label verticalAlignment="center" col="1" :text="'Vishnu Raghav B' | L" textWrap="true" />
      </GridLayout>
      <StackLayout class="hr m-10"></StackLayout>
      <Label :text="'Contributors' | L" class="group-header orkm" />
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="openURL('https://codeberg.org/mondstern')" />
        <Label col="0" class="bx" :text="icon.link" />
        <StackLayout col="1">
          <Label text="mondstern" textWrap="true" />
          <Label :text="'Translator' | L" class="info" textWrap="true" />
        </StackLayout>
      </GridLayout>
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="openURL('https://github.com/epicalxyz')" />
        <Label col="0" class="bx" :text="icon.github" />
        <StackLayout col="1">
          <Label text="EpicalXYZ" textWrap="true" />
          <Label :text="'Translator' | L" class="info" textWrap="true" />
        </StackLayout>
      </GridLayout>
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="openURL('https://github.com/dm9pZCAq')" />
        <Label col="0" class="bx" :text="icon.github" />
        <StackLayout col="1">
          <Label text="dm9pZCAq" textWrap="true" />
          <Label :text="'Translator' | L" class="info" textWrap="true" />
        </StackLayout>
      </GridLayout>
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="openURL('https://github.com/taraletti')" />
        <Label col="0" class="bx" :text="icon.github" />
        <StackLayout col="1">
          <Label text="AHaro88" textWrap="true" />
          <Label :text="'Translator' | L" class="info" textWrap="true" />
        </StackLayout>
      </GridLayout>
      <GridLayout columns="auto, *" class="option">
        <MDRipple colSpan="2" @tap="openURL('https://github.com/RAPXT')" />
        <Label col="0" class="bx" :text="icon.github" />
        <StackLayout col="1">
          <Label text="RAPXT" textWrap="true" />
          <Label :text="'Translator' | L" class="info" textWrap="true" />
        </StackLayout>
      </GridLayout>
    </StackLayout>
  </ScrollView>
</Page>
</template>

<script>
import {
  Application,
  Utils,
  Observable
} from "@nativescript/core"
import {
  mapActions,
  mapState
} from "vuex"
import * as utils from "~/shared/utils"
export default {
  computed: {
    ...mapState( [ "icon", "currentComponent" ] ),
    getVersion() {
      let ctx = Application.android.context
      return ctx.getPackageManager().getPackageInfo( ctx.getPackageName(), 0 ).versionName
    },
  },
  data() {
    return {
      viewIsScrolled: false,
      appTheme: "Light",
    }
  },
  methods: {
    ...mapActions( [ "setCurrentComponentAction" ] ),
    onPageLoad( args ) {
      const page = args.object;
      page.bindingContext = new Observable();
      this.setCurrentComponentAction( "About" )
    },
    // HELPERS
    showDrawer() {
      utils.showDrawer()
    },
    onScroll( args ) {
      this.viewIsScrolled = args.scrollY ? true : false
    },
    openURL( url ) {
      Utils.openUrl( url )
    },
  },
}
</script>
