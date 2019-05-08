<template>
  <v-container>
    <v-layout
      wrap
      align-center
      justify-center>
      <v-flex xs12>
        <h1>
          Pitch Finder
        </h1>
      </v-flex>
    </v-layout>
    <v-layout
      wrap
      align-center
      justify-center>
      <v-flex
        xs12
        sm6
        d-flex>
        <v-select
          :value="settings.selectedInput"
          :items="devices"
          attach
          :item-text="(item) => item.label || `microphone ${index + 1}`"
          item-value="deviceId"
          label="Please select an input device"
          @change="(val) => setSelectedInput({ selectedInput: val })" />
      </v-flex>
    </v-layout>
    <v-layout
      wrap
      align-center
      justify-center>
      <v-flex
        xs10
        sm4
        d-flex>
        <v-btn
          :disabled="!settings.selectedInput"
          :color="state == 'running' ? 'error' : 'success'"
          @click="toggleStream">
          <span v-if="!settings.selectedInput">Please select an input device</span>
          <span v-else-if="state == 'running'">Stop</span>
          <span v-else>Start</span>
        </v-btn>
      </v-flex>
      <v-flex
        xs1
        sm1
        d-flex>
        <Settings>
          <template v-slot:default="slotProps">
            <v-icon v-on="slotProps.on">
              settings
            </v-icon>
          </template>
        </Settings>
      </v-flex>
    </v-layout>
    <v-layout
      wrap
      align-center
      justify-center>
      <v-flex
        xs12
        sm6
        d-flex>
        <NoteRenderer :note="note" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Note } from 'tonal';
import { toAbc } from 'tonal-abc-notation';
import Settings from '@/components/Settings.vue';
import NoteRenderer from '@/components/NoteRenderer.vue';
import Vue from 'vue';
import {
    Component, Prop, Provide, Watch,
} from 'vue-property-decorator';
import { State, Mutation } from 'vuex-class';
import PitchAnalyser from '@/services/PitchAnalyser';
import VolumeAnalyser from '@/services/VolumeAnalyser';
import { SettingsState } from '@/vuex/settings/state';

@Component({
    components: {
        NoteRenderer,
        Settings,
    },
})
export default class PitchFinder extends Vue {
    private unsubscribers: (() => void)[] = [];

    @Provide() public devices = [] as MediaDeviceInfo[];

    @Provide() public pitch: number = 0;

    @Provide() public note = 'x';

    @Provide() public volume = 0;

    @Provide() public state: 'stopped' | 'running' | 'paused' = 'stopped';

    @State('settings') public settings!: SettingsState;

    @Mutation('setSelectedInput', { namespace: 'settings' }) setSelectedInput: any;

    @Watch('settings.selectedInput')
    private onSelectedInputChange() {
        if (this.state === 'running' && this.settings.selectedInput) {
            this.$audioContext.start(this.settings.selectedInput);
        }
    }

    public toggleStream() {
        if (this.state !== 'running' && this.settings.selectedInput) {
            this.$audioContext.start(this.settings.selectedInput);
        } else {
            this.$audioContext.suspend().then(() => {
                this.note = 'x';
            });
        }
    }

    public mounted() {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            this.devices = devices.filter(d => d.kind === 'audioinput');
            if (!devices.find(d => d.deviceId === this.settings.selectedInput)) {
                this.setSelectedInput({ selectedInput: devices[0].deviceId });
            }
        });

        document.addEventListener('visibilitychange', this.onVisibilityChange);

        this.unsubscribers = this.unsubscribers.concat([
            this.$audioContext.pitchAnalyser.onData((pitch) => {
                if (pitch.freq > 0) {
                    this.pitch = pitch.freq;
                    this.note = toAbc(Note.fromMidi(Note.freqToMidi(this.pitch)));
                }
            }),
            this.$audioContext.volumeAnalyser.onData((v) => {
                this.volume = v * 100;
            }),
            this.$audioContext.on('state-change', (state) => {
                this.state = state;
                if (state !== 'running') {
                    this.note = 'x';
                }
            }),
        ]);
    }

    public beforeDestroy() {
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
        this.unsubscribers.forEach(u => u());
        this.$audioContext.suspend();
    }

    private onVisibilityChange() {
        if (document.visibilityState === 'visible') {
            if (this.state === 'paused') {
                this.$audioContext.start(this.settings.selectedInput);
            }
        } else if (this.state === 'running') {
            this.$audioContext.suspend();
        }
    }
}
</script>

<style lang="scss" scoped>
  /deep/ .v-progress-linear__bar__determinate {
    transition: none;
  }

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

</style>
