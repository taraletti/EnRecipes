<template>
  <Page @loaded="onPageLoad" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="*">
      <ScrollView
        @scroll="onScroll($event)"
        rowSpan="2"
        scrollBarIndicatorVisible="false"
      >
        <StackLayout>
          <GridLayout rows="auto" columns="*, auto, 8">
            <Label class="pageTitle" :text="'timer' | L" />
            <Button
              col="1"
              class="ico"
              :text="icon.cog"
              @tap="$navigateTo(CTSettings)"
            />
          </GridLayout>
          <Timer
            v-for="(timer, i) in activeTimers"
            :key="timer.id"
            :timer="timer"
            :timerIndex="i"
            :formattedTime="formattedTime"
            :removeTimer="removeTimer"
            :addToPreset="addToPreset"
            :togglePause="togglePause"
            :fireTimer="fireTimer"
          />
          <StackLayout class="listSpace"> </StackLayout>
        </StackLayout>
      </ScrollView>
      <GridLayout
        row="1"
        @loaded="onAppBarLoad"
        class="appbar"
        :hidden="showUndo"
        columns="auto, *, auto"
      >
        <Button class="ico" :text="icon.back" @tap="$navigateBack()" />
        <Button class="ico fab" :text="icon.plus" @tap="addTimer" col="2" />
      </GridLayout>
      <SnackBar
        :hidden="!showUndo || toast"
        :count="countdown"
        :msg="snackMsg"
        :undo="undoDel"
        :action="hideBar"
      />
      <Toast :toast="toast" :action="hideBar" />
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import { localize } from "@nativescript/localize";
import {
  Observable,
  CoreTypes,
  Application,
  ApplicationSettings,
  AndroidApplication,
  Utils,
  Device,
} from "@nativescript/core";
import { mapState, mapActions } from "vuex";

import Action from "./modals/Action.vue";
import CTSettings from "./settings/CTSettings.vue";
import TimePickerHMS from "./modals/TimePickerHMS.vue";
import TimerReminder from "./modals/TimerReminder.vue";
import Timer from "./sub/Timer.vue";
import Toast from "./sub/Toast.vue";
import SnackBar from "./sub/SnackBar.vue";

import * as utils from "~/shared/utils";
import { EventBus } from "~/main";
let undoTimer,
  firingTimers = [];
declare const com: any;

export default {
  components: { Timer, Toast, SnackBar },
  props: ["recipeID"],
  data() {
    return {
      scrollPos: 1,
      appbar: null,
      countdown: 5,
      snackMsg: null,
      showUndo: false,
      undo: false,
      CTSettings: CTSettings,
      toast: null,
    };
  },
  computed: {
    ...mapState([
      "icon",
      "recipes",
      "currentComponent",
      "timerSound",
      "timerVibrate",
      "timerDelay",
      "timerPresets",
      "activeTimers",
    ]),
  },
  methods: {
    ...mapActions([
      "setComponent",
      "addActiveTimer",
      "removeActiveTimer",
      "clearTimerInterval",
      "addTimerPreset",
      "updateActiveTimer",
    ]),
    onPageLoad({ object }) {
      object.bindingContext = new Observable();
      this.setComponent("CookingTimer");
    },
    onAppBarLoad({ object }) {
      this.appbar = object;
    },
    onScroll(args) {
      let scrollUp;
      let y = args.scrollY;
      if (y) {
        scrollUp = y < this.scrollPos;
        this.scrollPos = Math.abs(y);
        let ab = this.appbar.translateY;
        if (!scrollUp && ab == 0) {
          this.appbar.animate({
            translate: { x: 0, y: 64 },
            duration: 250,
            curve: CoreTypes.AnimationCurve.ease,
          });
        } else if (scrollUp && ab == 64) {
          this.appbar.animate({
            translate: { x: 0, y: 0 },
            duration: 250,
            curve: CoreTypes.AnimationCurve.ease,
          });
        }
      }
    },
    // HELPERS
    getRecipeTitle(id) {
      let recipe = this.recipes.filter((e) => e.id === id)[0];
      return recipe ? recipe.title : `[ ${localize("resNF")} ]`;
    },
    formattedTime(time) {
      let hr = localize("hr");
      let min = localize("min");
      let sec = localize("sec");

      let t = time.split(":");

      let h = parseInt(t[0]);
      let m = parseInt(t[1]);
      let s = parseInt(t[2]);

      let hasHrs = h ? `${h} ${hr}` : "";
      let hasMins = m ? `${h ? " " : ""}${m} ${min}` : "";
      let hasSecs = s ? `${h || m ? " " : ""}${s} ${sec}` : "";

      return hasHrs + hasMins + hasSecs;
    },

    // NOTIFICATION HANDLERS
    notifyTimers() {
      let activeCount = this.activeTimers.length;
      let pausedCount = this.activeTimers.filter((e) => e.isPaused).length;
      let ongoingCount = activeCount - pausedCount;
      console.log("notifying");
      utils.TimerNotif.show({
        bID: "bringToFront",
        cID: "cti",
        cName: "Cooking Timer info",
        description: `${ongoingCount} ongoing, ${pausedCount} paused`,
        nID: 777,
        priority: -2,
        sound: null,
        title: localize("timer"),
      });
      if (activeCount <= 0) this.foregroundService(false);
    },
    fireTimer(timer) {
      console.log("firing");
      let description = timer.recipeID
        ? " - " + this.getRecipeTitle(timer.recipeID)
        : "";
      let title = timer.label;
      let time = this.formattedTime(timer.time);
      let bID = "timer" + timer.id;
      utils.TimerNotif.show({
        actions: true,
        bID,
        cID: "cta",
        cName: "Cooking Timer alerts",
        description: time,
        nID: timer.id,
        priority: 1,
        sound: this.timerSound.uri,
        title: title + description,
        vibrate: this.timerVibrate,
      });
      Application.android.registerBroadcastReceiver(bID, (ctx, intent) => {
        let action = intent.getStringExtra("action");
        console.log(action, "firing");
        EventBus.$emit(bID, action);
      });
      firingTimers.push(timer);
      // if (firingTimers.length == 1) {
      //   this.$showModal(TimerReminder, {
      //     fullscreen: true,
      //     props: {
      //       timers: firingTimers,
      //       stop: this.stopFiringTimers,
      //       formattedTime: this.formattedTime,
      //     },
      //   });
      // }
    },
    stopFiringTimers() {
      firingTimers.forEach((e) => utils.TimerNotif.clear(e.id));
      firingTimers = [];
    },
    openReminder() {},
    foregroundService(bool) {
      const ctx = Utils.ad.getApplicationContext();
      const intent = new android.content.Intent(
        ctx,
        com.tns.ForegroundService.class
      );
      if (bool)
        parseInt(Device.sdkVersion) < 26
          ? ctx.startService(intent)
          : ctx.startForegroundService(intent);
      else ctx.stopService(intent);
    },

    // DATA HANDLERS
    addTimer() {
      this.foregroundService(true);
      this.$showModal(TimePickerHMS, {
        props: {
          title: "ntmr",
          label: `${localize("tmr", this.activeTimers.length + 1)}`,
          action: "strtBtn",
          showPreset: this.timerPresets.length,
        },
      }).then((res) => {
        if (res) {
          if (res == "presets") {
            let list = this.timerPresets.map(
              (e) => `${e.label} - ${this.formattedTime(e.time)}`
            );
            this.$showModal(Action, {
              props: {
                title: "tmrPrsts",
                list,
              },
            }).then((preset) => {
              if (preset) {
                let timer = JSON.parse(
                  JSON.stringify(this.timerPresets[list.indexOf(preset)])
                );
                timer.id = this.getRandomID();
                this.addActiveTimer({
                  timer,
                  index: this.activeTimers.length,
                });
                this.notifyTimers();
              }
            });
          } else {
            if (res.time != "00:00:00") {
              this.addActiveTimer({
                timer: {
                  id: this.getRandomID(),
                  label: res.label,
                  recipeID: this.recipeID,
                  time: res.time,
                  timerInterval: null,
                  isPaused: false,
                  preset: 0,
                },
                index: this.activeTimers.length,
              });
              this.notifyTimers();
            }
          }
        }
      });
    },
    removeTimer(id, index, noUndo) {
      let temp = this.activeTimers[index];
      this.removeActiveTimer(index);
      utils.TimerNotif.clear(id);
      if (!noUndo) {
        this.showUndoBar("tmrClr")
          .then(() => {
            this.foregroundService(true);
            this.addActiveTimer({
              timer: temp,
              index,
            });
            this.notifyTimers();
          })
          .catch(() => {
            ApplicationSettings.remove(`${temp.id}progress`);
          });
      }
      this.notifyTimers();
    },
    addToPreset(timer) {
      timer = JSON.parse(JSON.stringify(timer));
      timer.recipeID = timer.timerInterval = null;
      timer.preset = 1;
      this.addTimerPreset(timer);
      this.showToast("aTPrst");
    },
    togglePause(timer, bool) {
      if (typeof bool === "boolean") timer.isPaused = bool;
      else timer.isPaused = !timer.isPaused;
      this.updateActiveTimer(timer);
      this.notifyTimers();
    },
    showToast(data) {
      this.toast = localize(data);
      utils.timer(5, (val) => {
        if (!val) this.toast = val;
      });
    },
    showUndoBar(message) {
      return new Promise((resolve, reject) => {
        clearTimeout(undoTimer);
        this.showUndo = true;
        this.snackMsg = message;
        this.countdown = 5;
        let a = 5;
        undoTimer = setInterval(() => {
          if (this.undo) {
            this.showUndo = this.undo = false;
            clearTimeout(undoTimer);
            resolve(true);
          }
          this.countdown = Math.round((a -= 0.1));
          if (this.countdown < 1) {
            this.showUndo = false;
            clearTimeout(undoTimer);
            reject(true);
          }
        }, 100);
      });
    },
    hideBar({ object }) {
      this.appbar.translateY = 64;
      object
        .animate({
          opacity: 0,
          translate: { x: 0, y: 64 },
          duration: 250,
          curve: CoreTypes.AnimationCurve.ease,
        })
        .then(() => {
          this.showUndo = false;
          this.toast = null;
          this.appbar.animate({
            translate: { x: 0, y: 0 },
            duration: 250,
            curve: CoreTypes.AnimationCurve.ease,
          });
          object.opacity = 1;
          object.translateY = 0;
          clearTimeout(undoTimer);
        });
    },
    undoDel() {
      this.undo = true;
    },

    // HELPERS
    getRandomID() {
      return Math.floor(Math.random() * 9000000000) + 1000000000;
    },
  },
  created() {
    this.clearTimerInterval();
  },
};
</script>
