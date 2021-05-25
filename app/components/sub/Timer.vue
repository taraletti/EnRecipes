<template>
  <GridLayout
    rows="auto, auto"
    columns="auto, *, auto, auto, auto"
    class="singleTimer"
  >
    <Button
      class="ico"
      :class="{ blink: done }"
      :text="done ? icon.ring : timer.isPaused ? icon.start : icon.pause"
      @tap="!done && toggleProgress()"
    />
    <StackLayout col="1" class="info" :colSpan="timer.isPaused ? 1 : 2">
      <Label :text="timer.label" class="tb title tw" />
      <Label
        @touch="!timer.recipeID && touch($event)"
        :text="getRecipeTitle"
        class="recipeTitle"
        :class="timer.recipeID ? 'sub' : 'clickable'"
      />
      <Label :text="formattedTime(timer.time)" />
    </StackLayout>
    <Button
      col="2"
      class="ico"
      :hidden="(!timer.isPaused || progress == 0) && !done"
      :text="icon.reset"
      @tap="resetTimer"
    />
    <Button
      col="3"
      class="ico"
      :hidden="timer.preset && !done"
      @tap="done ? delay() : addPreset()"
      :text="done ? icon.delay : icon.addTo"
    />
    <Button
      col="4"
      class="ico x"
      :text="icon.x"
      @tap="removeTimerItem(timerIndex, false)"
    />
    <Progress row="1" colSpan="5" :value="progress" />
  </GridLayout>
</template>

<script>
import { ApplicationSettings, Application } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { mapState, mapActions } from "vuex";
import ActionWithSearch from "../modals/ActionWithSearch";
import * as utils from "~/shared/utils";
import { EventBus } from "~/main";

export default {
  props: [
    "timer",
    "timerIndex",
    "formattedTime",
    "removeTimer",
    "addToPreset",
    "togglePause",
    "fireTimer",
  ],
  data() {
    return {
      progress: 0,
      timerInt: this.timer.timerInterval,
    };
  },
  computed: {
    ...mapState(["icon", "recipes", "timerDelay"]),
    getRecipeTitle() {
      let { recipeID } = this.timer;
      if (recipeID) {
        let recipe = this.recipes.filter(
          (e) => e.id === this.timer.recipeID
        )[0];
        return recipe
          ? recipe.title
          : `[ ${this.$options.filters.L("resNF")} ]`;
      } else return localize("fwr");
    },
    done() {
      return this.progress >= 100;
    },
    getTimeInSec() {
      let t = this.timer.time.split(":");
      return +t[0] * 60 * 60 + +t[1] * 60 + +t[2];
    },
  },
  methods: {
    ...mapActions(["removeActiveTimer", "updateActiveTimer", "addTimerPreset"]),
    attachRecipe() {
      this.$showModal(ActionWithSearch, {
        props: {
          title: "selRec",
          recipes: this.recipes,
        },
      }).then((recipeID) => {
        let timer = this.timer;
        timer.recipeID = recipeID;
        this.updateActiveTimer(timer);
      });
    },
    setProgress(progress, delay) {
      this.progress = progress;
      let timer = this.timer;
      if (progress <= 100 && !timer.timerInterval) {
        timer.timerInterval = setInterval(() => {
          if (!this.timer.isPaused) {
            this.progress += 100 / (delay + this.getTimeInSec);
            ApplicationSettings.setNumber(
              `${this.timer.id}progress`,
              this.progress
            );
          }
          if (this.progress >= 100) {
            if (progress < 100) this.fireTimer(timer);
            clearInterval(timer.timerInterval);
            ApplicationSettings.remove(`${this.timer.id}delay`);
          }
        }, 1000);
        this.updateActiveTimer(timer);
      }
    },
    resetInterval() {
      let timer = this.timer;
      clearInterval(this.timer.timerInterval);
      timer.timerInterval = null;
      this.updateActiveTimer(timer);
    },
    resetTimer() {
      this.resetInterval();
      this.togglePause(this.timer, true);
      ApplicationSettings.remove(`${this.timer.id}delay`);
      this.setProgress(0, 0);
      ApplicationSettings.setNumber(`${this.timer.id}progress`, 0);
      this.clearNotification();
    },
    clearNotification() {
      Application.android.unregisterBroadcastReceiver("timer" + this.timer.id);
      utils.TimerNotif.clear(this.timer.id);
    },
    toggleProgress(bool) {
      this.togglePause(this.timer, bool);
      this.timer.isPaused
        ? this.resetInterval()
        : this.setProgress(
            ApplicationSettings.getNumber(`${this.timer.id}progress`, 0),
            ApplicationSettings.getNumber(`${this.timer.id}delay`, 0)
          );
    },
    removeTimerItem(index, noUndo) {
      this.resetInterval();
      this.removeTimer(this.timer.id, index, noUndo);
    },
    addPreset() {
      this.timer.preset = 1;
      this.addToPreset(this.timer);
    },
    delay() {
      let delayInS = this.timerDelay.split(" ")[0] * 60;
      ApplicationSettings.setNumber(`${this.timer.id}delay`, delayInS);
      let progress = (100 / delayInS) * this.getTimeInSec;
      this.resetInterval();
      this.setProgress(progress, delayInS);
      this.clearNotification();
    },

    // HELPERS
    touch({ object, action }) {
      object.className = action.match(/down|move/)
        ? "recipeTitle clickable fade"
        : "recipeTitle clickable";
      if (action == "up") this.attachRecipe();
    },
  },
  mounted() {
    this.setProgress(
      ApplicationSettings.getNumber(`${this.timer.id}progress`, 0),
      ApplicationSettings.getNumber(`${this.timer.id}delay`, 0)
    );
    EventBus.$on("timer" + this.timer.id, (e) => {
      switch (e) {
        case "stop":
          this.resetTimer();
          break;
        case "delay":
          this.delay();
          break;
      }
    });
  },
};
</script>
