<template>
    <v-container>
        <v-layout
            wrap
            align-center
            justify-center>
            <v-flex xs12>
                <h1 class="view-title">
                    Pitch Finder
                </h1>
            </v-flex>
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
                    :color="state == 'on' ? 'error' : 'success'"
                    @click="toggleStream">
                    <span v-if="!settings.selectedInput">
                        Please select an input device in Settings
                    </span>
                    <span v-else-if="state == 'on'">Stop</span>
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
                d-flex>
                <NoteRenderer :note="[note]" />
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
                <!-- <span class="note-string">
                    {{ noteString || '' }}
                </span> -->
                <span class="note-string">
                    {{ duration ? duration.toFixed(3) : '' }}
                </span>
                <span class="note-string">
                    {{ prob ? prob.toFixed(3) : '' }}
                </span>
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
import VolumeAnalyser from '@/services/VolumeAnalyser';
import { SettingsModule } from '@/vuex/settingsModule';
import { AudioModule } from '../vuex/audioModule';

type pitchState = 'off' | 'on';

@Component({
    components: {
        NoteRenderer,
        Settings,
    },
})
export default class PitchDetector extends Vue {
    private unsubscribers: (() => void)[] = [];

    private settings = SettingsModule.CreateProxy(this.$store, SettingsModule);

    private audio = AudioModule.CreateProxy(this.$store, AudioModule);

    @Provide() public devices = [] as MediaDeviceInfo[];

    @Provide() public pitch: number = 0;

    @Provide() public note: string = 'x';

    @Provide() public noteString: string = '';

    @Provide() public state: pitchState = 'off';

    @Provide() public duration: number = 0;

    @Provide() public prob: number = 0;

    @Watch('audio.state')
    private onAudioStateChange() {
        if (this.audio.state !== 'running') {
            this.note = 'x';
            this.noteString = '';
            this.state = 'off';
        }
    }

    public toggleStream() {
        if (this.state === 'on') {
            this.$audioContext.suspend().then(() => {
                this.state = 'off';
                this.note = 'x';
                this.noteString = '';
            });
        } else if (this.settings.selectedInput) {
            this.$audioContext.start(this.settings.selectedInput).then(() => {
                this.state = 'on';
            });
        }
    }

    public mounted() {
        this.unsubscribers = this.unsubscribers.concat([
            this.$audioContext.pitchAnalyser.on('pitchData', (pitch) => {
                if (this.state === 'on' && pitch.freq > 0) {
                    this.noteString = Note.enharmonic(Note.fromMidi(Note.freqToMidi(pitch.freq))) as string;
                    this.note = toAbc(this.noteString);
                    this.duration = this.$audioContext.pitchAnalyser.duration;
                    this.prob = pitch.probability;
                }
            }),
        ]);
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
