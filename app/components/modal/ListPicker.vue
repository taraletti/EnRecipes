<template>
  <Page @loaded="onPageLoad" backgroundColor="transparent">
    <StackLayout class="dialogContainer" :class="appTheme">
      <StackLayout class="dialogHeader" orientation="horizontal">
        <Label class="er dialogIcon" :text="icon.time" />
        <Label class="dialogTitle " :text="`${title}` | L" />
      </StackLayout>
      <StackLayout
        class="dialogListPicker"
        orientation="horizontal"
        horizontalAlignment="center"
      >
        <ListPicker
          ref="hrPicker"
          :items="hrsList"
          :selectedIndex="hrIndex"
          @selectedIndexChange="setHrs"
        ></ListPicker>
        <ListPicker
          ref="minPicker"
          :items="minsList"
          :selectedIndex="minIndex"
          @selectedIndexChange="setMins"
        ></ListPicker>
      </StackLayout>
      <GridLayout rows="auto" columns="*, auto, auto" class="actionsContainer">
        <MDButton
          variant="text"
          col="1"
          class="action tb"
          :text="'cBtn' | L"
          @tap="$modal.close(false)"
        />
        <MDButton
          variant="text"
          col="2"
          class="action tb"
          :text="`${action}` | L"
          @tap="$modal.close(selectedTime)"
        />
      </GridLayout>
    </StackLayout>
  </Page>
</template>

<script>
import { Application } from "@nativescript/core";
import { mapState } from "vuex";
import { localize } from "@nativescript/localize";
export default {
  props: ["title", "selectedHr", "selectedMin", "action"],
  data() {
    return {
      hrs: [],
      mins: [],
      selectedHrs: "00",
      selectedMins: "00",
    };
  },
  computed: {
    ...mapState(["icon"]),
    hrsList() {
      let h = [...Array(24).keys()];
      this.hrs = h;
      return h.map((e) => `${e} ${localize("hr")}`);
    },
    minsList() {
      let m = [
        ...new Set([
          ...Array(11).keys(),
          ...Array.from(Array(12), (_, x) => x * 5),
        ]),
      ];
      this.mins = m;
      return m.map((e) => `${e} ${localize("min")}`);
    },
    hrIndex() {
      return this.hrs.indexOf(parseInt(this.selectedHr));
    },
    minIndex() {
      return this.mins.indexOf(parseInt(this.selectedMin));
    },
    appTheme() {
      return Application.systemAppearance();
    },
    selectedTime() {
      return this.selectedHrs + ":" + this.selectedMins;
    },
  },
  methods: {
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
    setHrs(args) {
      let hr = "0" + this.hrs[args.object.selectedIndex];
      this.selectedHrs = hr.slice(-2);
    },
    setMins(args) {
      let min = "0" + this.mins[args.object.selectedIndex];
      this.selectedMins = min.slice(-2);
    },
  },
};
</script>
