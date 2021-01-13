<template>
<Page>
  <GridLayout columns="*" :rows="`auto, auto, ${stretch? '*':'auto'}, auto`" class="dialogContainer" :class="appTheme">
    <Label row="0" class="bx dialogIcon" backgroundColor="#adb5bd" :color="iconColor" :text="icon[helpIcon]" />
    <Label row="1" class="dialogTitle orkm" :text="`${title}` | L" />
    <ScrollView row="2" width="100%">
      <StackLayout>
        <MDButton v-for="(item, index) in newList" :key="index" class="actionItem" :color="title==='srt' && sortType=== item ? '#ff5200':''" variant="text" :rippleColor="rippleColor" :text="`${localized(item)}${title==='srt' && sortType=== item ? '*':''}`" @loaded="onLabelLoaded" @tap="tapAction(item)"
          @longPress="removeItem(index)" />
      </StackLayout>
    </ScrollView>
    <GridLayout row="3" rows="auto" columns="auto, *, auto" class="actionsContainer">
      <MDButton :rippleColor="rippleColor" variant="text" v-if="action" col="0" class="action orkm pull-left" :text="`${action}` | L" @tap="$modal.close(action)" />
      <MDButton :rippleColor="rippleColor" variant="text" col="2" class="action orkm pull-right" :text="'cBtn' | L" @tap="$modal.close(false)" />
    </GridLayout>
  </GridLayout>
</Page>
</template>

<script>
import {
  Application
} from "@nativescript/core"
import * as Toast from "nativescript-toast"
import {
  localize
}
from "@nativescript/localize"
import {
  mapState,
  mapActions
}
from "vuex"
import ConfirmDialog from "./ConfirmDialog.vue"
export default {
  props: [ "title", "list", "stretch", "action", "helpIcon" ],
  data() {
    return {
      newList: this.list,
    }
  },
  computed: {
    ...mapState( [ "sortType", 'icon' ] ),
    appTheme() {
      return Application.systemAppearance()
    },
    isLightMode() {
      return this.appTheme == "light"
    },
    rippleColor() {
      return this.isLightMode ? "rgba(134,142,150,0.2)" : "rgba(206,212,218,0.1)"
    },
    iconColor() {
      return this.isLightMode ? "#f1f3f5" : "#212529"
    },
  },
  methods: {
    ...mapActions( [ "removeListItemAction" ] ),
    localized( item ) {
      if ( this.title !== 'lang' )
        return localize( item )
      else
        return item
    },
    tapAction( item ) {
      this.$modal.close( item )
    },
    onLabelLoaded( args ) {
      args.object.android.setGravity( 16 )
    },
    deletionConfirmation( type, description ) {
      return this.$showModal( ConfirmDialog, {
        props: {
          title: 'conf',
          description,
          cancelButtonText: "cBtn",
          okButtonText: "rBtn",
          helpIcon: 'fail',
          bgColor: '#c92a2a',
        },
      } )
    },
    removeItem( index ) {
      let item = this.newList[ index ]
      let vm = this

      function removeListItem( type, listName, desc ) {
        vm.deletionConfirmation( type, `${localize(desc)} "${localize(item)}"\n\n${localize('rmLIInfo')}` ).then( action => {
          if ( action != null && action )
            vm.removeListItemAction( {
              item,
              listName
            } )
        } )
      }
      switch ( this.title ) {
        case "cui":
          removeListItem( 'cuisine', "cuisines", "rmCuiInfo" )
          break;
        case "cat":
          removeListItem( "category", "categories", "rmCatInfo" )
          break;
        case "yieldU":
          removeListItem( "yield unit", "yieldUnits", "rmYUInfo" )
          break;
        case "Unit":
          removeListItem( "unit", "units", "rmUInfo" )
          break;
        default:
      }
    }
  },
}
</script>
