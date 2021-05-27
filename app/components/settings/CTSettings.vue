<template>
  <Page @loaded="onPageLoad" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="auto, *">
      <OptionsList title="Settings" :items="items" />
      <GridLayout row="1" class="appbar" rows="*" columns="auto, *">
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { Observable, Device, Application, Utils } from "@nativescript/core";
import { mapState, mapActions } from "vuex";
import { localize } from "@nativescript/localize";
import OptionsList from "../sub/OptionsList";
import Action from "../modals/Action";
import * as utils from "~/shared/utils";

export default {
  components: { OptionsList },
  computed: {
    ...mapState(["icon", "timerDelay", "timerSound", "timerVibrate"]),
    items() {
      let options = [
        {
          type: "list",
          icon: "sound",
          title: "tmrSnd",
          subTitle: this.timerSound.title,
          action: this.showSoundsList,
        },
        {
          type: "switch",
          icon: "vibrate",
          title: "tmrvbrt",
          checked: this.timerVibrate,
          action: this.toggleTimerVibrate,
        },
      ];
      let openSettings = [
        {
          type: "list",
          icon: "sound",
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
          title: "dlyDur",
          subTitle: this.timerDelay,
          action: this.showDelayList,
        },
        ...list,
        {},
      ];
    },
  },
  methods: {
    ...mapActions([
      "setTimerDelay",
      "setTimerSound",
      "setTimerVibrate",
      "setComponent",
    ]),
    onPageLoad({ object }) {
      object.bindingContext = new Observable();
      this.setComponent("CTSettings");
    },
    showDelayList() {
      let list = [
        ...Array.from(Array(4), (_, x) => x + 1),
        ...Array.from(Array(6), (_, x) => (x + 1) * 5),
      ].map(
        (e, i) => `${e} ${i == 0 ? localize("minute") : localize("minutes")}`
      );
      this.$showModal(Action, {
        props: {
          title: "dlyDur",
          list,
        },
      }).then((dur) => dur && this.setTimerDelay(dur));
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
      this.setTimerVibrate(!this.timerVibrate);
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
