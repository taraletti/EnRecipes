<template>
  <Page @loaded="onPageLoad" backgroundColor="transparent">
    <StackLayout class="dialogContainer" :class="appTheme">
      <StackLayout class="dialogHeader" orientation="horizontal">
        <Label class="er dialogIcon" :text="icon[helpIcon]" />
        <Label
          class="dialogTitle "
          :text="`${title}` | L"
          textWrap="true"
        />
      </StackLayout>
      <StackLayout class="dialogInput">
        <TextField
          @loaded="focusField"
          :hint="hint ? hint : ''"
          v-model="category"
          autocapitalizationType="words"
          @returnPress="$modal.close(category)"
        />
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
          @tap="$modal.close(category)"
        />
      </GridLayout>
    </StackLayout>
  </Page>
</template>

<script>
import { Application, Utils } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { mapState } from "vuex";
export default {
  props: ["title", "hint", "text", "action", "helpIcon"],
  data() {
    return {
      category: null,
    };
  },
  computed: {
    ...mapState(["icon"]),
    appTheme() {
      return Application.systemAppearance();
    },
    isLightMode() {
      return this.appTheme == "light";
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
    focusField(args) {
      args.object.focus();
      setTimeout((e) => Utils.ad.showSoftInput(args.object.android), 1);
    },
  },
  mounted() {
    if (this.text) {
      this.category = localize(this.text);
    }
  },
};
</script>
