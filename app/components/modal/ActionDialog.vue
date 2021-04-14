<template>
  <Page
    @loaded="transparentPage"
    backgroundColor="transparent"
    :class="appTheme"
  >
    <GridLayout
      columns="*"
      :rows="`auto, auto, ${stretch ? '*' : 'auto'}, auto`"
      class="modal"
    >
      <Label class="title" :text="title | L" />
      <ListView
        rowHeight="48"
        row="2"
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

<script lang="ts">
import { Screen } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { mapState, mapActions } from "vuex";
import ConfirmDialog from "./ConfirmDialog.vue";

interface IData {
  newList: unknown[];
  stretch: boolean;
  listHeight: number;
}

export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    list: {
      type: Array,
      required: true,
    },
    action: {
      type: String,
      required: false,
    },
  },
  data(): IData {
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
    localized(item: string): string {
      return this.title !== "lang" ? localize(item) : item;
    },
    tapAction(item: string): void {
      this.$modal.close(item);
    },
    deletionConfirmation(description: string): void {
      return this.$showModal(ConfirmDialog, {
        props: {
          title: "conf",
          description,
          cancelButtonText: "cBtn",
          okButtonText: "rBtn",
        },
      });
    },
    removeItem(item: string): void {
      let vm = this;
      function removeListItem(listName: string, desc: string): void {
        vm.deletionConfirmation(
          `${localize(desc)} "${localize(item)}"\n\n${localize("rmLIInfo")}`
        ).then((action: boolean) => {
          if (action != null && action)
            vm.removeListItemAction({
              item,
              listName,
            });
        });
      }
      switch (this.title) {
        case "cui":
          removeListItem("cuisines", "rmCuiInfo");
          break;
        case "cat":
          removeListItem("categories", "rmCatInfo");
          break;
        case "yieldU":
          removeListItem("yieldUnits", "rmYUInfo");
          break;
        case "Unit":
          removeListItem("units", "rmUInfo");
          break;
      }
    },
    touch({ object, action }): void {
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
