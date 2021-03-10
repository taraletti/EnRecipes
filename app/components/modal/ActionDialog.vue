<template>
  <Page @loaded="onPageLoad" backgroundColor="transparent">
    <GridLayout
      columns="*"
      :rows="`auto, auto, ${stretch ? '*' : 'auto'}, auto`"
      class="dialogContainer"
      :class="appTheme"
    >
      <Label
        row="0"
        class="er dialogIcon"
        backgroundColor="#858585"
        :color="iconColor"
        :text="icon[helpIcon]"
      />
      <Label row="1" class="dialogTitle orkm" :text="`${title}` | L" />
      <ScrollView row="2" width="100%">
        <StackLayout>
          <MDButton
            v-for="(item, index) in newList"
            :key="index"
            class="actionItem"
            :class="{ orkm: title === 'srt' && sortType === item }"
            :color="title === 'srt' && sortType === item ? '#ff5200' : ''"
            variant="text"
            :text="`${localized(item)}${
              title === 'srt' && sortType === item ? '*' : ''
            }`"
            @loaded="centerLabel"
            @tap="tapAction(item)"
            @longPress="removeItem(index)"
          />
        </StackLayout>
      </ScrollView>
      <GridLayout
        row="3"
        rows="auto"
        columns="auto, *, auto"
        class="actionsContainer"
      >
        <MDButton
          variant="text"
          v-if="action"
          col="0"
          class="action orkm pull-left"
          :text="`${action}` | L"
          @tap="$modal.close(action)"
        />
        <MDButton
          variant="text"
          col="2"
          class="action orkm pull-right"
          :text="'cBtn' | L"
          @tap="$modal.close(false)"
        />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { Application, Color } from "@nativescript/core";
import * as Toast from "nativescript-toast";
import { localize } from "@nativescript/localize";
import { mapState, mapActions } from "vuex";
import ConfirmDialog from "./ConfirmDialog.vue";

export default {
  props: ["title", "list", "stretch", "action", "helpIcon"],
  data() {
    return {
      newList: this.list,
    };
  },
  computed: {
    ...mapState(["sortType", "icon"]),
    appTheme() {
      return Application.systemAppearance();
    },
    isLightMode() {
      return this.appTheme == "light";
    },
    iconColor() {
      return this.isLightMode ? "#f0f0f0" : "#1A1A1A";
    },
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
    centerLabel(args) {
      args.object.android.setGravity(16);
    },
    deletionConfirmation(type, description) {
      return this.$showModal(ConfirmDialog, {
        props: {
          title: "conf",
          description,
          cancelButtonText: "cBtn",
          okButtonText: "rBtn",
          helpIcon: "err",
          bgColor: "#c92a2a",
        },
      });
    },
    removeItem(index) {
      let item = this.newList[index];
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
  },
};
</script>
