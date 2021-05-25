<template>
  <GridLayout
    row="1"
    class="appbar snackBar"
    columns="auto, *, auto"
    @swipe="action"
  >
    <Button :text="count" class="ico countdown tb" />
    <Label class="title" col="1" :text="msg | L" />
    <Button class="ico fab" :text="icon.undo" @tap="undo" col="3" />
  </GridLayout>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: ["count", "msg", "undo", "action"],
  computed: {
    ...mapState(["icon"]),
  },
};
</script>