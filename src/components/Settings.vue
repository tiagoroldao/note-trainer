<template>
  <v-dialog
    v-model="dialog"
    scrollable
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition">
    <template v-slot:activator="{ on }">
      <slot :on="on">
        <v-btn
          color="primary"
          dark
          v-on="on">
          Settings
        </v-btn>
      </slot>
    </template>
    <v-card>
      <v-toolbar
        dark
        color="primary">
        <v-btn
          icon
          dark
          @click="dialog = false">
          <v-icon>
            close
          </v-icon>
        </v-btn>
        <v-toolbar-title>
          Settings
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            dark
            flat
            @click="dialog = false">
            Close
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <h5 class="subheading">
          Audio Recording
        </h5>
        <h3>
          Note detection volume
        </h3>
        <p>
          Minimum volume at which notes are registered
        </p>
        <v-layout
          wrap
          align-center
          justify-center
          class="volume-action-wrapper">
          <v-flex
            xs12
            d-flex
            class="min-vol-slider-wrap">
            <v-progress-linear
              v-model="volume"
              height="14" />
            <v-slider
              :value="settings.minVol"
              always-dirty
              thumb-label
              color="rgba(0,0,0,0)"
              thumb-color="primary"
              track-color="rgba(0,0,0,0)"
              class="min-vol-slider"
              @change="onChangeVol" />
          </v-flex>
        </v-layout>
        <v-divider />
        <h5 class="subheading">
          Teacher Settings
        </h5>
        <h3>
          Note hold time
        </h3>
        <p>
          Time a note needs to be held for registering in ms.
          Shorter times are more responsive, longer times produce less false results.
        </p>
        <v-layout
          wrap
          align-center
          justify-center>
          <v-flex
            xs12
            d-flex
            class="min-vol-slider-wrap">
            <v-text-field
              :value="settings.teacher.noteRegisterTime"
              class="mt-0"
              hide-details
              single-line
              type="number"
              @change="(val) => settings.teacher.setNoteRegisterTime(val)" />
          </v-flex>
          <v-divider />
        </v-layout>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'vue-property-decorator';
import { SettingsStore } from '../vuex/settingsModule';

@Component({})
export default class Settings extends Vue {
    private unsubscribers: (() => void)[] = [];

    private settings = SettingsStore.CreateProxy(this.$store, SettingsStore);

    @Provide() public dialog = false;

    @Provide() public volume = 0;

    onChangeVol(minVol: number) {
        this.settings.setMinVol(minVol);
    }

    public mounted() {
        this.unsubscribers = this.unsubscribers.concat([
            this.$audioContext.volumeAnalyser.onData((v) => {
                this.volume = v * 100;
            }),
        ]);
    }

    public beforeDestroy() {
        this.unsubscribers.forEach(u => u());
    }
}
</script>

<style lang="scss" scoped>
  .min-vol-slider-wrap {
    position: relative;

    .min-vol-slider {
      position: absolute;
      right: 0;
      left: 0;
      top: 5px;
      margin: 0;
      z-index: 1;
    }
  }

  .volume-action-wrapper {
    width: 100%;
    overflow: visible;
    padding: 0 2em;
  }

  /deep/ .v-progress-linear__bar__determinate {
    transition: none;
  }

  .subheading {
    margin-bottom: 20px;
    margin-top: 10px;
  }
</style>
