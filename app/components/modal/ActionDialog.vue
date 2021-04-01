<template>
  <Page @loaded="onPageLoad" backgroundColor="transparent" :class="appTheme">
    <GridLayout
      columns="*"
      :rows="`auto, auto, ${stretch ? '*' : 'auto'}, auto`"
      class="modal"
    >
      <Label class="title" :text="title | L" />
      <ListView
        rowHeight="48"
        row="2"
        @loaded="listViewLoad"
        for="item in newList"
        :height="stretch ? '100%' : listHeight"
      >
        <v-template>
          <Label
            class="listItem"
            :class="{ tb: title === 'srt' && sortType === item }"
            :color="title === 'srt' && sortType === item ? '#ff5200' : ''"
            :text="`${localized(item)}`"
            @touch="touch"
            @tap="tapAction(item)"
            @longPress="removeItem(item)"
          />
        </v-template>
      </ListView>
      <GridLayout row="3" columns="auto, *, auto" class="actions">
        <Button
          v-if="action"
          class="text sm"
          :text="action | L"
          @tap="$modal.close(action)"
        />
        <Button
          col="2"
          class="text sm"
          :text="'cBtn' | L"
          @tap="$modal.close(false)"
        />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { Screen } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { mapState, mapActions } from "vuex";
import ConfirmDialog from "./ConfirmDialog.vue";

export default {
  props: ["title", "list", "action"],
  data() {
    return {
      newList: this.list,
      stretch: false,
      listHeight: 0,
    };
  },
  computed: {
    ...mapState(["sortType", "icon", "appTheme"]),
  },
  methods: {
    ...mapActions(["removeListItemAction"]),
    onPageLoad(args) {
      args.object._dialogFragment
        .getDialog()
        .getWindow()
        .setBackgroundDrawable(
          new android.graphics.drawable.ColorDrawable(
            android.graphics.Color.TRANSPARENT
          )
        );
    },
    localized(item) {
      if (this.title !== "lang") return localize(item);
      else return item;
    },
    tapAction(item) {
      this.$modal.close(item);
    },
    deletionConfirmation(type, description) {
      return this.$showModal(ConfirmDialog, {
        props: {
          title: "conf",
          description,
          cancelButtonText: "cBtn",
          okButtonText: "rBtn",
        },
      });
    },
    removeItem(item) {
      let vm = this;

      function removeListItem(type, listName, desc) {
        vm.deletionConfirmation(
          type,
          `${localize(desc)} "${localize(item)}"\n\n${localize("rmLIInfo")}`
        ).then((action) => {
          if (action != null && action)
            vm.removeListItemAction({
              item,
              listName,
            });
        });
      }
      switch (this.title) {
        case "cui":
          removeListItem("cuisine", "cuisines", "rmCuiInfo");
          break;
        case "cat":
          removeListItem("category", "categories", "rmCatInfo");
          break;
        case "yieldU":
          removeListItem("yield unit", "yieldUnits", "rmYUInfo");
          break;
        case "Unit":
          removeListItem("unit", "units", "rmUInfo");
          break;
        default:
      }
    },
    touch({ object, action }) {
      object.className = action.match(/down|move/)
        ? "listItem fade"
        : "listItem";
    },
  },
  created() {
    let screenHeight = Screen.mainScreen.heightDIPs;
    let usableHeight = screenHeight - 144 - 24; // margin and statusbar
    let count = this.newList.length;
    let listHeight = 48 * count;
    let modalHeight = 104 + listHeight; // header + actions height = 104
    if (modalHeight < usableHeight) {
      this.listHeight = listHeight;
    } else {
      this.stretch = true;
    }
  },
};
</script>
