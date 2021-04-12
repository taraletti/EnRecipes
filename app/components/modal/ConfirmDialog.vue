<template>
  <Page @loaded="transparentPage" backgroundColor="transparent" :class="appTheme">
    <GridLayout rows="auto, auto, auto" class="modal">
      <Label class="title" :text="title | L" />
      <Label
        row="1"
        v-if="description"
        class="description tw"
        :text="description"
      />
      <GridLayout row="2" columns="auto, *, auto, auto" class="actions">
        <Button
          v-if="secondButtonText"
          col="0"
          class="text sm"
          :text="secondButtonText | L"
          @tap="$modal.close(-1)"
        />
        <Button
          v-if="cancelButtonText"
          col="2"
          class="text sm"
          :text="cancelButtonText | L"
          @tap="$modal.close(false)"
        />
        <Button
          col="3"
          class="text sm"
          :text="okButtonText | L"
          @tap="$modal.close(true)"
        />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: [
    "title",
    "description",
    "secondButtonText",
    "cancelButtonText",
    "okButtonText",
  ],
  computed: {
    ...mapState(["icon", "appTheme"]),
  },
};
</script>
