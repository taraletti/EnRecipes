<template>
  <Page
    @loaded="transparentPage"
    backgroundColor="transparent"
    :class="appTheme"
  >
    <GridLayout rows="auto, auto, auto" class="modal">
      <Label class="title" :text="title | L" />
      <StackLayout row="1">
        <StackLayout class="input">
          <TextField
            class="modalInput"
            v-model="setLabel"
            :hint="label"
            autocapitalizationType="words"
        /></StackLayout>
        <!-- @loaded="focusField" -->
        <StackLayout orientation="horizontal" horizontalAlignment="center">
          <ListPicker
            @loaded="onLPLoad"
            :items="hrsList"
            @selectedIndexChange="setHr"
          ></ListPicker>
          <ListPicker
            @loaded="onLPLoad"
            :items="minsList"
            @selectedIndexChange="setMin"
          ></ListPicker>
          <ListPicker
            @loaded="onLPLoad"
            :items="secsList"
            @selectedIndexChange="setSec"
          ></ListPicker>
        </StackLayout>
      </StackLayout>

      <GridLayout row="2" columns="auto, *, auto, auto" class="actions">
        <Button
          v-if="showPreset"
          class="text sm"
          :text="'prstBtn' | L"
          @tap="$modal.close('presets')"
        />
        <Button
          col="2"
          class="text sm"
          :text="'cBtn' | L"
          @tap="$modal.close(false)"
        />
        <Button col="3" class="text sm" :text="action | L" @tap="sendRespose" />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { Utils } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { mapState } from "vuex";
export default {
  props: ["title", "label", "action", "showPreset"],
  data() {
    return {
      hrs: [],
      mins: [],
      secs: [],
      selectedHrs: "00",
      selectedMins: "00",
      selectedSecs: "00",
      setLabel: null,
    };
  },
  computed: {
    ...mapState(["icon", "appTheme"]),
    hrsList() {
      let h = [...Array(24).keys()];
      this.hrs = h;
      return h.map((e) => `${e} ${localize("hr")}`);
    },
    minsList() {
      let m = [...Array(60).keys()];
      this.mins = m;
      return m.map((e) => `${e} ${localize("min")}`);
    },
    secsList() {
      let s = [...Array(60).keys()];
      this.secs = s;
      return s.map((e) => `${e} ${localize("sec")}`);
    },
    selectedTime() {
      return `${this.selectedHrs}:${this.selectedMins}:${this.selectedSecs}`;
    },
  },
  methods: {
    onLPLoad({ object }) {
      object.android.setWrapSelectorWheel(true);
    },
    setHr(args) {
      let hr = "0" + this.hrs[args.object.selectedIndex];
      this.selectedHrs = hr.slice(-2);
    },
    setMin(args) {
      let min = "0" + this.mins[args.object.selectedIndex];
      this.selectedMins = min.slice(-2);
    },
    setSec(args) {
      let sec = "0" + this.secs[args.object.selectedIndex];
      this.selectedSecs = sec.slice(-2);
    },
    focusField({ object }) {
      object.focus();
      setTimeout(() => Utils.ad.showSoftInput(object.android), 100);
    },
    sendRespose() {
      this.$modal.close({
        label: this.setLabel ? this.setLabel : this.label,
        time: this.selectedTime,
      });
    },
  },
};
</script>
