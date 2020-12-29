<template>
<Page>
  <GridLayout columns="*" :rows="`auto, ${stretch? '*':'auto'}, auto`" class="dialogContainer" :class="appTheme">
    <Label row="0" class="dialogTitle orkm" :text="`${title}` | L" />
    <ScrollView row="1" width="100%">
      <StackLayout>
        <MDButton v-for="(item, index) in newList" :key="index" class="actionItem" variant="text" :rippleColor="rippleColor" :text="`${title==='Sort by' && sortType=== item ? '→ ':''}${localized(item)}`" @loaded="onLabelLoaded" @tap="tapAction(item)"
          @longPress="removeItem(index)" />
      </StackLayout>
    </ScrollView>
    <GridLayout row="2" rows="auto" columns="auto, *, auto" class="actionsContainer">
      <MDButton :rippleColor="rippleColor" variant="text" v-if="action" col="0" class="action orkm pull-left" :text="`${action}` | L" @tap="$modal.close(action)" />
      <MDButton :rippleColor="rippleColor" variant="text" col="2" class="action orkm pull-right" :text="'CANCEL' | L" @tap="$modal.close(false)" />
    </GridLayout>
  </GridLayout>
</Page>
</template>

<script>
import {
  Application,
  Screen
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
  props: [ "title", "list", "stretch", "action" ],
  data() {
    return {
      newList: this.list,
    }
  },
  computed: {
    ...mapState( [ "sortType" ] ),
    appTheme() {
      return Application.systemAppearance()
    },
    rippleColor() {
      return this.appTheme == "light" ? "rgba(134,142,150,0.2)" : "rgba(206,212,218,0.1)"
    },
    screenHeight() {
      return Math.round( Screen.mainScreen.heightDIPs )
    },
  },
  methods: {
    ...mapActions( [ "removeListItemAction" ] ),
    localized( item ) {
      if ( this.title !== 'App language' )
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
          title: `Remove ${type}?`,
          description,
          cancelButtonText: "CANCEL",
          okButtonText: "REMOVE",
        },
      } )
    },
    removeItem( index ) {
      let item = this.newList[ index ]
      let vm = this

      function removeListItem( type, listName ) {
        vm.deletionConfirmation( type, `${vm.$options.filters.L('Are you sure you want to remove')} "${vm.$options.filters.L(item)}"?` ).then( action => {
          if ( action != null && action ) {
            vm.newList.splice( index, 1 )
            vm.removeListItemAction( {
              item,
              listName
            } )
          }
        } )
      }
      switch ( this.title ) {
        case "Cuisine":
          removeListItem( 'cuisine', "cuisines" )
          break;
        case "Category":
          removeListItem( "category", "categories" )
          break;
        case "Yield measured in":
          removeListItem( "yield unit", "yieldUnits" )
          break;
        case "Units":
          removeListItem( "unit", "units" )
          break;
        default:
      }
    }
  },
}
</script>
