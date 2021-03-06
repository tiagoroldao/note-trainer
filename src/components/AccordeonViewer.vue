<template>
  <v-container>
    <v-row wrap align-center justify="center">
      <v-col cols="12">
        <h1 class="view-title">Teacher</h1>
      </v-col>
    </v-row>
    <v-row wrap align-center justify="center">
      <v-col cols="10" md="5" offset-md="1">
        <v-btn
          block
          :disabled="!$vxm.settings.selectedInput"
          :color="$vxm.audio.state == 'running' ? 'error' : 'success'"
          @click="toggleTeacher"
        >
          <span v-if="!$vxm.settings.selectedInput">Please select an input device in Settings</span>
          <span v-else-if="$vxm.audio.state == 'running'">Stop</span>
          <span v-else>Start</span>
        </v-btn>
      </v-col>
      <v-col cols="12" md="1">
        <Settings>
          <template v-slot:default="slotProps">
            <v-icon class="settings" v-on="slotProps.on">settings</v-icon>
          </template>
        </Settings>
      </v-col>
    </v-row>
    <v-row wrap align-center justify="center">
      <v-col cols="12" md="6" :class="['note-holder', { correct: state === 'success' }]">
        <NoteRenderer :note="[targetNote, note]" />
      </v-col>
    </v-row>
    <v-row wrap align-center justify="center">
      <v-col cols="10" md="4">
        <v-btn :disabled="state == 'off'" color="primary" @click="nextTargetNote">Next Note</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Note } from "tonal";
import { toAbc } from "tonal-abc-notation";
import Settings from "@/components/Settings.vue";
import NoteRenderer from "@/components/NoteRenderer.vue";
import Vue from "vue";
import { Component, Prop, Provide, Watch } from "vue-property-decorator";
import VolumeAnalyser from "@/services/VolumeAnalyser";
import { PitchData } from "@/workers/pitchFinder";

type teacherState = "off" | "querying" | "success";
const noteSuccessHoldTime = 2000;

@Component({
  components: {
    NoteRenderer,
    Settings
  }
})
export default class AccordionViewer extends Vue {
  private unsubscribers: (() => void)[] = [];

  @Provide() public devices = [] as MediaDeviceInfo[];

  @Provide() public note = "x";

  @Provide() public targetNote = "x";

  @Provide() public state: teacherState = "off";

  @Watch("audio.state")
  private onAudioStateChange() {
    if (this.$vxm.audio.state !== "running") {
      this.note = "x";
      this.state = "off";
    }
  }

  public toggleTeacher() {
    if (
      this.$vxm.audio.state !== "running" &&
      this.$vxm.settings.selectedInput
    ) {
      this.$audioContext.start(this.$vxm.settings.selectedInput).then(() => {
        this.nextTargetNote();
      });
    } else {
      this.$audioContext.suspend().then(() => {
        this.note = "x";
        this.targetNote = "x";
        this.state = "off";
      });
    }
  }

  public nextTargetNote() {
    this.state = "querying";
    this.note = "x";
    this.targetNote = this.randomNote();
  }

  public nextNote(note: string) {
    if (this.state !== "querying") return;
    this.note = note;
    if (this.note === this.targetNote) {
      this.state = "success";
      setTimeout(() => {
        if (this.state === "success") {
          this.nextTargetNote();
        }
      }, noteSuccessHoldTime);
    }
  }

  private tempNote: string = "";

  private noteStart: number = 0;

  public handleNoteData(pitch: PitchData) {
    if (this.state !== "querying") return;
    if (pitch.freq > 0) {
      const identified: string =
        toAbc(Note.enharmonic(Note.fromMidi(Note.freqToMidi(pitch.freq)))) ||
        "";
      if (identified.length && identified !== this.tempNote) {
        this.tempNote = identified;
        this.noteStart = Date.now();
      } else if (
        Date.now() >
        this.noteStart + this.$vxm.settings.teacher.noteRegisterTime
      ) {
        this.nextNote(identified);
        this.tempNote = "";
      }
    } else {
      this.tempNote = "";
    }
  }

  public mounted() {
    this.unsubscribers = this.unsubscribers.concat([
      this.$audioContext.pitchAnalyser.on("pitchData", pitch =>
        this.handleNoteData(pitch)
      )
    ]);
  }

  public randomNote() {
    const min = this.$vxm.settings.teacher.noteRange[0];
    const max = this.$vxm.settings.teacher.noteRange[1] + 1;
    let note: number = 0;
    do {
      note = Math.floor(Math.random() * (max - min) + min);
    } while (
      this.$vxm.settings.teacher.notes.indexOf(
        Note.pc(Note.fromMidi(note, true) as string) as string
      ) === -1
    );
    return toAbc(Note.fromMidi(note, true));
  }

  public beforeDestroy() {
    this.unsubscribers.forEach(u => u());
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

.note-holder {
  position: relative;

  &:not(.correct) {
    /deep/ .abcjs-note.abcjs-n1 {
      fill: red;
    }
  }

  &.correct {
    /deep/ svg * {
      fill: green;
    }
  }
}

/deep/ .abcjs-note_selected {
  fill: #000;
}
</style>
