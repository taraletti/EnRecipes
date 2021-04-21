<template>
  <Page
    @loaded="transparentPage"
    backgroundColor="transparent"
    :class="appTheme"
  >
    <GridLayout rows="auto, auto, auto" class="modal">
      <Label class="title" :text="title | L" />
      <StackLayout row="1" class="input">
        <TextField
          class="modalInput"
          @loaded="focusField"
          v-model="text"
          @returnPress="$modal.close(text)"
        />
      </StackLayout>
      <GridLayout row="2" columns="*, auto, auto" class="actions">
        <Button
          col="1"
          class="text sm"
          :text="'cBtn' | L"
          @tap="$modal.close(false)"
        />
        <Button
          col="2"
          class="text sm"
          :text="action | L"
          @tap="$modal.close(text)"
        />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { Utils } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { mapState } from "vuex";
export default {
  props: ["title", "hint", "placeholder", "action"],
  data() {
    return {
      text: null,
    };
  },
  computed: {
    ...mapState(["icon", "appTheme"]),
  },
  methods: {
    focusField({ object }) {
      let a = this.placeholder;
      typeof a == "number"
        ? (object.keyboardType = "number")
        : (object.autocapitalizationType = "words");
      object.hint = this.hint;
      object.focus();
      setTimeout(() => Utils.ad.showSoftInput(object.android), 100);
    },
  },
  created() {
    let a = this.placeholder;
    if (a) this.text = typeof a == "number" ? a : localize(a);
  },
};
</script>
