<template>
  <Page
    @loaded="transparentPage"
    backgroundColor="transparent"
    :class="appTheme"
  >
    <GridLayout rows="auto, auto, auto" class="modal">
      <Label class="title" :text="title | L" />
      <Label
        row="1"
        v-if="description"
        class="description tw"
        :text="description"
      />
      <GridLayout row="2" columns="*, auto, auto" class="actions">
        <Button
          v-if="cancelButtonText"
          col="1"
          class="text sm"
          :text="cancelButtonText | L"
          @tap="$modal.close(false)"
        />
        <Button
          col="2"
          class="text sm"
          :text="okButtonText | L"
          @tap="$modal.close(true)"
        />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import { mapState } from "vuex";
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cancelButtonText: {
      type: String,
      required: true,
    },
    okButtonText: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState(["icon", "appTheme"]),
  },
};
</script>
