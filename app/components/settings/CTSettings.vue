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
import {
  Observable,
  Device,
  Application,
  ApplicationSettings,
  Utils,
} from "@nativescript/core";
import { mapState, mapActions } from "vuex";
import { localize } from "@nativescript/localize";
import OptionsList from "../sub/OptionsList";
import Action from "../modals/Action";
import * as utils from "~/shared/utils";

export default {
  components: { OptionsList },
  computed: {
    ...mapState(["icon", "timerDelay", "timerSound", "timerVibrate", "RTL"]),
    items() {
      let options = [
        {
          type: "list",
          icon: "sound",
          rtl: 0,
          title: "tmrSnd",
          subTitle: this.timerSound.title,
          action: this.showSoundsList,
        },
        {
          type: "switch",
          icon: "vibrate",
          rtl: 0,
          title: "tmrvbrt",
          checked: !!this.timerVibrate,
          action: this.toggleTimerVibrate,
        },
      ];
      let openSettings = [
        {
          type: "list",
          icon: "sound",
          rtl: 0,
          title: "notifSetg",
          subTitle: null,
          action: this.openNotificationChannelSettings,
        },
      ];
      let list = this.channelExists() ? openSettings : options;
      return [
        {},
        {
          type: "list",
          icon: "delay",
          rtl: 0,
          title: "dlyDur",
          subTitle:
            this.delayList[
              this.delayList.findIndex((e) => e.n == this.timerDelay)
            ].l,
          action: this.showDelayList,
        },
        ...list,
        {},
      ];
    },
    delayList() {
      return [
        ...Array.from(Array(4), (_, x) => x + 1),
        ...Array.from(Array(6), (_, x) => (x + 1) * 5),
      ].map((e) => {
        return {
          l: `${this.getLocaleN(e)} ${localize(e > 1 ? "minutes" : "minute")}`,
          n: e,
        };
      });
    },
  },
  methods: {
    ...mapActions(["setTimerDelay", "setTimerSound", "setTimerVibrate"]),
    pgLoad({ object }) {
      object.bindingContext = new Observable();
      ApplicationSettings.setNumber("isTimer", 2);
    },
    showDelayList() {
      this.$showModal(Action, {
        props: {
          title: "dlyDur",
          list: this.delayList.map((e) => e.l),
          selected: this.delayList.findIndex((e) => e.n == this.timerDelay),
        },
      }).then(
        (res) =>
          res &&
          this.setTimerDelay(
            this.delayList[this.delayList.findIndex((e) => e.l == res)].n
          )
      );
    },
    showSoundsList() {
      let getTones = utils.getTones();
      this.$showModal(Action, {
        props: {
          title: "tmrSnd",
          list: getTones.tones.map((e) => e.title),
        },
      }).then(
        (tone) =>
          tone &&
          tone !== this.timerSound.title &&
          this.setTimerSound(getTones.tones.filter((e) => e.title === tone)[0])
      );
    },
    toggleTimerVibrate() {
      this.setTimerVibrate(!this.timerVibrate | 0);
    },
    openNotificationChannelSettings() {
      const ctx = Application.android.context;
      const Settings = android.provider.Settings;
      const Intent = android.content.Intent;
      let intent = new Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS);
      intent.putExtra(
        Settings.EXTRA_APP_PACKAGE,
        Application.android.packageName
      );
      intent.putExtra(Settings.EXTRA_CHANNEL_ID, "cta");
      intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
      ctx.startActivity(intent);
    },

    // HELPERS
    channelExists() {
      if (Device.sdkVersion * 1 >= 26) {
        const ctx = Utils.ad.getApplicationContext();
        const NotifySrv = ctx.getSystemService(
          android.content.Context.NOTIFICATION_SERVICE
        );
        return NotifySrv.getNotificationChannel("cta");
      }
      return null;
    },
  },
};
</script>
