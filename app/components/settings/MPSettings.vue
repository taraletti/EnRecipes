<template>
  <Page @loaded="pgLoad" actionBarHidden="true">
    <RGridLayout :rtl="RTL" rows="*, auto" columns="auto, *">
      <OptionsList title="Settings" :items="items" />
      <GridLayout row="1" class="appbar rtl" rows="*" columns="auto, *">
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
      </GridLayout>
    </RGridLayout>
  </Page>
</template>

<script>
import { Observable } from "@nativescript/core";
import { mapState, mapActions } from "vuex";
import Action from "../modals/Action";
import OptionsList from "../sub/OptionsList";
import { localize } from "@nativescript/localize";

export default {
  components: { OptionsList },
  computed: {
    ...mapState(["icon", "mondayFirst", "RTL", "plannerView", "planDeletion"]),
    items() {
      return [
        {},
        {
          type: "list",
          icon: "calv",
          title: "calVM",
          subTitle: localize(this.plannerView),
          action: this.selectPlannerView,
        },
        {
          type: "switch",
          icon: "week",
          title: "swm",
          checked: !!this.mondayFirst,
          action: this.toggleFirstDay,
        },
        {
          type: "list",
          icon: "mpd",
          title: "admp",
          subTitle: localize(this.planDeletion),
          action: this.selectDeletionTime,
        },
        {},
      ];
    },
  },
  methods: {
    ...mapActions(["setFirstDay", "setPlannerView", "setPlanDeletion"]),
    pgLoad({ object }) {
      object.bindingContext = new Observable();
    },
    toggleFirstDay() {
      this.setFirstDay(!this.mondayFirst | 0);
    },
    selectPlannerView() {
      this.$showModal(Action, {
        props: {
          title: "calVM",
          list: ["mnth", "wk", "d"],
        },
      }).then((res) => {
        if (res && this.plannerView != res) this.setPlannerView(res);
      });
    },
    selectDeletionTime() {
      this.$showModal(Action, {
        props: {
          title: "admp",
          list: ["otay", "otam", "otaw", "nvr"],
        },
      }).then((res) => {
        if (res && this.planDeletion != res) this.setPlanDeletion(res);
      });
    },
  },
};
</script>
