<template>
  <GridLayout
    v-show="toast"
    row="1"
    colSpan="2"
    class="appbar snackBar"
    columns="*"
    @swipe="action"
  >
    <FlexboxLayout minHeight="48" alignItems="center">
      <Label class="title msg" :text="toast" />
    </FlexboxLayout>
  </GridLayout>
</template>

<script>
export default {
  props: ["toast", "action"],
};
</script>