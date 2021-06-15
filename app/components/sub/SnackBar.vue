<template>
  <RGridLayout
    :rtl="RTL"
    row="1"
    class="appbar snackBar"
    columns="auto, *, auto"
    @swipe="action"
    @loaded="onload"
  >
    <Button @tap="action" :text="count" class="ico countdown tb" />
    <RLabel @tap="action" class="title" col="1" :text="msg | L" />
    <Button class="ico fab rtl" :text="icon.undo" @tap="undo" col="3" />
  </RGridLayout>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: ["count", "msg", "undo", "action", "onload"],
  computed: {
    ...mapState(["icon", "RTL"]),
  },
};
</script>