<template>
  <Page @loaded="onPageLoad" backgroundColor="transparent">
    <StackLayout class="dialogContainer" :class="appTheme">
      <Label
        class="er dialogIcon"
        backgroundColor="#858585"
        :color="iconColor"
        :text="icon[helpIcon]"
      />
      <Label class="dialogTitle orkm" :text="`${title}` | L" />
      <GridLayout rows="auto, auto, auto" columns="*" class="actionsContainer">
        <GridLayout
          class="shareItem mdr"
          :backgroundColor="bgColor"
          row="0"
          columns="*"
          rows="auto, auto"
          @tap="$modal.close('photo')"
        >
          <Label row="0" class="er" :text="icon.img" />
          <Label row="1" class="item" :text="'pht' | L" textWrap="true" />
        </GridLayout>
        <GridLayout
          class="shareItem mdr"
          :backgroundColor="bgColor"
          row="1"
          columns="*"
          rows="auto, auto"
          @tap="$modal.close('recipe')"
        >
          <Label row="0" class="er" :text="icon.text" />
          <Label row="1" class="item" :text="'rec' | L" textWrap="true" />
        </GridLayout>
        <!-- <GridLayout
          class="shareItem mdr"
          :backgroundColor="bgColor"
          row="2"
          columns="*"
          rows="auto, auto"
          @tap="$modal.close('file')"
        >
          <Label row="0" class="er" :text="icon.zip" />
          <Label row="1" class="item" :text="'fil' | L" textWrap="true" />
        </GridLayout> -->
      </GridLayout>
      <GridLayout rows="auto" columns="*, auto" class="actionsContainer">
        <MDButton
          variant="text"
          col="1"
          class="action orkm mdr"
          :text="'cBtn' | L"
          @tap="$modal.close()"
        />
      </GridLayout>
    </StackLayout>
  </Page>
</template>

<script>
import { Application } from "@nativescript/core";
import { mapState } from "vuex";
export default {
  props: ["title", "helpIcon"],
  computed: {
    ...mapState(["icon"]),
    appTheme() {
      return Application.systemAppearance();
    },
    isLightMode() {
      return this.appTheme == "light";
    },
    iconColor() {
      return this.isLightMode ? "#f0f0f0" : "#1A1A1A";
    },
    bgColor() {
      return this.isLightMode ? "#fff" : "#292929";
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
  },
};
</script>
