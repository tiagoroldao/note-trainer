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
        <v-list
          three-line
          subheader>
          <v-subheader>
            Audio Recording
          </v-subheader>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>
                Note detection volume
              </v-list-tile-title>
              <v-list-tile-sub-title>
                Minimum volume at which notes are registered
              </v-list-tile-sub-title>
              <v-list-tile-action-text class="volume-action-wrapper">
                <v-layout
                  wrap
                  align-center
                  justify-center>
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
              </v-list-tile-action-text>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider />
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'vue-property-decorator';
import { State, Mutation } from 'vuex-class';
import { SettingsState } from '@/vuex/settings/state';
import VolumeAnalyser from '@/services/VolumeAnalyser';

@Component({})
export default class Settings extends Vue {
    public audioStream!: MediaStream;

    private volAnalyser!: VolumeAnalyser;

    @Provide() public dialog = false;

    @Provide() public volume = 0;

    @State('settings') public settings!: SettingsState;

    @Mutation('setMinVol', { namespace: 'settings' }) setMinVol: any;

    onChangeVol(minVol: number) {
        this.setMinVol({ minVol });
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
</style>
