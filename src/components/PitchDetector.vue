<template>
  <v-container>
    <v-row
      wrap
      align-center
      justify="center">
      <v-col cols="12">
        <h1 class="view-title">
          Pitch Finder
        </h1>
      </v-col>
    </v-row>
    <v-row
      wrap
      align-center
      justify="center">
      <v-col
        cols="10"
        md="5">
        <v-btn
          block
          :disabled="!$vxm.settings.selectedInput"
          :color="$vxm.audio.state == 'running' ? 'error' : 'success'"
          @click="toggleStream">
          <span v-if="!$vxm.settings.selectedInput">Please select an input device in Settings</span>
          <span v-else-if="$vxm.audio.state == 'running'">Stop</span>
          <span v-else>Start</span>
        </v-btn>
      </v-col>
    </v-row>
    <v-row
      wrap
      align-center
      justify="center">
      <v-col
        cols="12"
        md="6"
        :class="['note-holder', { correct: state === 'success' }]">
        <NoteRenderer :note="[note]" />
      </v-col>
    </v-row>
    <v-row
      wrap
      align-center
      justify="center">
      <v-col
        cols="10"
        md="4">
        <span class="note-string">
          {{ noteString || '' }}
        </span>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Midi } from '@tonaljs/modules';
import { toAbc } from 'tonal-abc-notation';
import NoteRenderer from '@/components/NoteRenderer.vue';
import Vue from 'vue';
import {
  Component, Provide, Watch,
} from 'vue-property-decorator';
import { toHumanNote } from '@/helpers/noteHelpers';

type pitchState = 'off' | 'on';

@Component({
  components: {
    NoteRenderer,
  },
})
export default class PitchDetector extends Vue {
    private unsubscribers: (() => void)[] = [];

    @Provide() public devices = [] as MediaDeviceInfo[];

    @Provide() public pitch: number = 0;

    @Provide() public note: string = 'x';

    @Provide() public noteString: string = '';

    @Provide() public state: pitchState = 'off';

    @Provide() public duration: number = 0;

    @Provide() public prob: number = 0;

    @Watch('audio.state')
    private onAudioStateChange() {
      if (this.$vxm.audio.state !== 'running') {
        this.note = 'x';
        this.noteString = '';
        this.state = 'off';
      }
    }

    toHumanNote(_note: number | string) {
      return toHumanNote(_note, { useRomanceNotes: this.$vxm.settings.useRomanceNotes, hideOctave: false });
    }

    public toggleStream() {
      if (this.state === 'on') {
        this.$audioContext.suspend().then(() => {
          this.state = 'off';
          this.note = 'x';
          this.noteString = '';
        });
      } else if (this.$vxm.settings.selectedInput) {
        this.$audioContext.start(this.$vxm.settings.selectedInput).then(() => {
          this.state = 'on';
        });
      }
    }

    public mounted() {
      this.unsubscribers = this.unsubscribers.concat([
        this.$audioContext.pitchAnalyser.on('pitchData', (pitch) => {
          if (this.state === 'on' && pitch.freq > 0) {
            const noteString = Midi.midiToNoteName(Midi.freqToMidi(pitch.freq), { sharps: true }) as string;
            this.note = toAbc(noteString);
            this.noteString = this.toHumanNote(noteString);
            this.duration = this.$audioContext.pitchAnalyser.duration;
            this.prob = pitch.probability;
          }
        }),
      ]);
    }

    public beforeDestroy() {
      this.unsubscribers.forEach((u) => u());
      this.$audioContext.suspend();
    }
}
</script>

<style lang="scss" scoped>
  .settings {
    margin-top: 0.3em;
    color: #ddd;

    &:hover {
      color: #999;
    }
  }

  /deep/ .abcjs-note_selected {
      fill: #000;
  }

  .note-string {
    font-size: 5em;
    font-weight: 900;
    color: #bbb;
    word-break: break-word;
  }
</style>
