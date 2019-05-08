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
    @Provide() public devices = [] as MediaDeviceInfo[];

    @Provide() public pitch: number = 0;

    @Provide() public note = 'x';

    @Provide() public volume = 0;

    @Provide() public state: 'stopped' | 'running' | 'paused' = 'stopped';

    @State('settings') public settings!: SettingsState;

    @Mutation('setSelectedInput', { namespace: 'settings' }) setSelectedInput: any;

    public audioStream!: MediaStream;

    private pitchAnalyser!: PitchAnalyser;

    private volAnalyser!: VolumeAnalyser;

    @Watch('settings.setSelectedInput')
    private onSelectedInputChange() {
        if (this.state === 'running' && this.settings.selectedInput) {
            this.startAudioStream();
        }
    }

    public toggleStream() {
        if (this.state !== 'running' && this.settings.selectedInput) {
            this.startContext().then(this.startAudioStream);
        } else {
            this.suspendContext().then(() => {
                this.state = 'stopped';
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
    }

    public beforeDestroy() {
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
        this.stopAnalyser();
        this.stopAudioStream();
    }

    private startAudioStream(): Promise<void> {
        if (!this.settings.selectedInput) {
            return Promise.resolve();
        }
        this.stopAudioStream();
        return navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: { exact: this.settings.selectedInput },
            },
        })
            .then((stream) => {
                if (this.$audioContext.Context) {
                    this.audioStream = stream;
                    const source = this.$audioContext.Context.createMediaStreamSource(stream);
                    this.pitchAnalyser.connectToSource(source);
                    this.volAnalyser.connectToSource(source);
                    this.state = 'running';
                }
            });
    }

    private stopAudioStream() {
        if (this.audioStream) {
            this.audioStream.getAudioTracks().forEach((track) => {
                track.stop();
            });
            delete this.audioStream;
        }
    }

    private onVisibilityChange() {
        if (document.visibilityState === 'visible') {
            if (this.state === 'paused') {
                this.resumeContext();
            }
        } else if (this.state === 'running') {
            this.suspendContext();
        }
    }

    private startContext(): Promise<void> {
        return this.$audioContext.startContext().then(this.startAnalyser);
    }

    private suspendContext(): Promise<void> {
        this.stopAudioStream();
        this.state = 'paused';
        return this.$audioContext.suspendContext();
    }

    private resumeContext(): Promise<void> {
        return this.$audioContext.startContext().then(this.startAudioStream);
    }

    private startAnalyser() {
        this.stopAnalyser();
        if (this.$audioContext.Context) {
            this.volAnalyser = new VolumeAnalyser(this.$audioContext.Context);
            this.pitchAnalyser = new PitchAnalyser(
                this.$audioContext.Context,
                this.settings.minVol / 100,
            );
            this.pitchAnalyser.onData((pitch) => {
                if (pitch.freq > 0) {
                    this.pitch = pitch.freq;
                    this.note = toAbc(Note.fromMidi(Note.freqToMidi(this.pitch)));
                }
            });
            this.volAnalyser.onData((v) => {
                this.volume = v * 100;
            });
        }
    }

    private stopAnalyser() {
        if (this.pitchAnalyser) {
            this.pitchAnalyser.stop();
            delete this.pitchAnalyser;
        }
        if (this.volAnalyser) {
            this.volAnalyser.stop();
            delete this.volAnalyser;
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
