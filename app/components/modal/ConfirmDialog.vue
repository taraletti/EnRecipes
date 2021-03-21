<template>
  <Page @loaded="onPageLoad" backgroundColor="transparent">
    <StackLayout class="dialogContainer" :class="appTheme">
      <StackLayout class="dialogHeader" orientation="horizontal">
        <Label
          class="er dialogIcon"
          :color="iconColor"
          :text="icon[helpIcon]"
        />
        <Label
          class="dialogTitle orkm"
          :text="`${title}` | L"
          textWrap="true"
        />
      </StackLayout>
      <Label
        v-if="description"
        class="dialogDescription"
        :text="description"
        textWrap="true"
      />
      <GridLayout rows="auto" columns="*, auto, auto" class="actionsContainer">
        <MDButton
          v-if="cancelButtonText"
          variant="text"
          col="1"
          class="action orkm"
          :text="`${cancelButtonText}` | L"
          @tap="$modal.close(false)"
        />
        <MDButton
          variant="text"
          col="2"
          class="action orkm"
          :text="`${okButtonText}` | L"
          @tap="$modal.close(true)"
        />
      </GridLayout>
    </StackLayout>
  </Page>
</template>

<script>
import { Application, Color } from "@nativescript/core";
import { mapState } from "vuex";
export default {
  props: [
    "title",
    "description",
    "cancelButtonText",
    "okButtonText",
    "helpIcon",
    "iconColor",
  ],
  computed: {
    ...mapState(["icon"]),
    appTheme() {
      return Application.systemAppearance();
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
