<template>
  <ListView colSpan="2" rowSpan="2" class="options-list" for="item in items">
    <v-template if="$index == 0">
      <Label class="pageTitle" :text="title | L" />
    </v-template>
    <v-template if="item.type == 'switch'">
      <GridLayout
        columns="auto, *, auto"
        class="option"
        @touch="touch($event, item.data, item.action)"
      >
        <Label class="ico" :text="icon[item.icon]" />
        <StackLayout col="1" verticalAlignment="center">
          <Label :text="item.title | L" class="info" />
          <Label v-if="item.subTitle" :text="item.subTitle | L" class="sub" />
        </StackLayout>
        <Switch
          isUserInteractionEnabled="false"
          :color="item.checked ? '#ff5200' : '#adb5bd'"
          col="2"
          :checked="item.checked"
        />
      </GridLayout>
    </v-template>
    <v-template if="item.type == 'list'">
      <GridLayout
        columns="auto, *"
        class="option"
        @touch="touch($event, item.data, item.action)"
      >
        <Label class="ico" :text="icon[item.icon]" />
        <StackLayout col="1">
          <Label :text="item.title | L" class="info" />
          <Label v-if="item.subTitle" :text="item.subTitle" class="sub" />
        </StackLayout>
      </GridLayout>
    </v-template>
    <v-template if="item.type == 'info'">
      <Label class="group-info sub tw" :text="item.title | L" />
    </v-template>
    <v-template>
      <StackLayout class="listSpace"> </StackLayout>
    </v-template>
  </ListView>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: ["title", "items", "action"],
  computed: {
    ...mapState(["icon"]),
  },
  methods: {
    touch({ object, action }, data, localAction) {
      object.className = action.match(/down|move/) ? "option fade" : "option";
      if (action == "up") localAction ? localAction(data) : this.action(data);
    },
  },
};
</script>