<template>
    <v-container>
        <v-layout
            wrap
            align-center
            justify-center>
            <v-flex xs12>
                <h1 class="view-title">
                    Teacher
                </h1>
            </v-flex>
        </v-layout>
        <v-layout
            wrap
            align-center
            justify-center>
            <v-flex
                xs1
                sm1
                d-flex />
            <v-flex
                xs10
                sm4
                d-flex>
                <v-btn
                    :disabled="!settings.selectedInput"
                    :color="audio.state == 'running' ? 'error' : 'success'"
                    @click="toggleTeacher">
                    <span v-if="!settings.selectedInput">
                        Please select an input device in Settings
                    </span>
                    <span v-else-if="audio.state == 'running'">Stop</span>
                    <span v-else>Start</span>
                </v-btn>
            </v-flex>
            <v-flex
                xs1
                sm1
                d-flex>
                <Settings>
                    <template v-slot:default="slotProps">
                        <v-icon
                            class="settings"
                            v-on="slotProps.on">
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
                d-flex
                :class="['note-holder', { correct: note === targetNote }]">
                <NoteRenderer :note="[targetNote, note]" />
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
                    color="success"
                    @click="nextNote">
                    Next Note
                </v-btn>
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
import PitchAnalyser from '@/services/PitchAnalyser';
import VolumeAnalyser from '@/services/VolumeAnalyser';
import { SettingsModule } from '@/vuex/settingsModule';
import { AudioModule } from '@/vuex/audioModule';

@Component({
    components: {
        NoteRenderer,
        Settings,
    },
})
export default class NoteTeacher extends Vue {
    private unsubscribers: (() => void)[] = [];

    private settings = SettingsModule.CreateProxy(this.$store, SettingsModule);

    private audio = AudioModule.CreateProxy(this.$store, AudioModule);

    @Provide() public devices = [] as MediaDeviceInfo[];

    @Provide() public note = 'A';

    @Provide() public targetNote = 'D';

    @Watch('audio.state')
    private onAudioStateChange() {
        if (this.audio.state !== 'running') {
            this.note = 'x';
        }
    }

    public toggleTeacher() {
        if (this.audio.state !== 'running' && this.settings.selectedInput) {
            this.$audioContext.start(this.settings.selectedInput);
        } else {
            this.$audioContext.suspend().then(() => {
                this.note = 'x';
            });
        }
    }

    public nextNote() {
        // this.note = 'x';
        this.targetNote = this.randomNote();
    }

    public mounted() {
        this.unsubscribers = this.unsubscribers.concat([
            this.$audioContext.pitchAnalyser.onData((pitch) => {
                if (pitch > 0) {
                    this.note = toAbc(Note.fromMidi(Note.freqToMidi(pitch)));
                }
            }),
        ]);
    }

    public randomNote() {
        const min = this.settings.teacher.noteRange[0];
        const max = this.settings.teacher.noteRange[1] + 1;
        let note: number = 0;
        do {
            note = Math.floor((Math.random() * (max - min)) + min);
        } while (this.settings.teacher.notes
            .indexOf(Note.pc(Note.enharmonic(Note.fromMidi(note)) as string) as string) === -1);
        return toAbc(Note.enharmonic(Note.fromMidi(note)));
    }

    public beforeDestroy() {
        this.unsubscribers.forEach(u => u());
        this.$audioContext.suspend();
    }
}
</script>

<style lang="scss" scoped>
  .settings {
    color: #ddd;

    &:hover {
      color: #999;
    }
  }

  .note-holder {
        position: relative;

        &:not(.correct) {
            /deep/ .abcjs-note.abcjs-n1{
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
