<template>
    <v-container>
        <v-layout wrap align-center justify-center>
            <v-flex xs12>
                <h1>Pitch Finder</h1>
            </v-flex>
        </v-layout>
        <v-layout wrap align-center justify-center>
            <v-flex xs12 sm6 d-flex>
                <v-select
                    v-model="selectedDevice"
                    :items="devices"
                    attach
                    :item-text="(item) => item.label ||  `microphone ${index + 1}`"
                    item-value="deviceId"
                    label="Please select an input device"
                ></v-select>
            </v-flex>
        </v-layout>
        <v-layout wrap align-center justify-center>
            <v-flex xs12 sm6 d-flex>
                <NoteRenderer :note="note"/>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
import PitchAnalyser from '../tools/PitchAnalyser';
import { Note } from 'tonal';
import { toAbc } from 'tonal-abc-notation';
import NoteRenderer from '@/components/NoteRenderer.vue';
import { Component, Prop, Vue, Provide, Watch } from 'vue-property-decorator';

const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;

@Component({
  components: {
    NoteRenderer,
  },
})
export default class PitchFinder extends Vue {
    @Provide() public devices = [] as MediaDeviceInfo[];
    @Provide() public selectedDevice = '' as unknown as string;
    @Provide() public pitch = null;
    @Provide() public note = 'x';

    public audioStream!: MediaStream;
    private analyser!: PitchAnalyser;
    private audioContext!: AudioContext;

    @Watch('selectedDevice')
    public onSelectedDeviceChange() {
        if (this.selectedDevice) {
            this.startContext().then(this.startAudioStream);
        } else {
            this.suspendContext();
        }
    }

    public mounted() {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            this.devices = devices.filter((d) => d.kind === 'audioinput');
        });

        document.addEventListener('visibilitychange', this.onVisibilityChange);
    }

    public beforeDestroy() {
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
        return this.stopContext();
    }

    private startAudioStream(): Promise<void> {
        if (!this.selectedDevice) {
            return Promise.resolve();
        }
        this.stopAudioStream();
        return navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: {exact: this.selectedDevice},
            },
        })
        .then((stream) => {
            this.audioStream = stream;
            this.analyser.connectToSource(this.audioContext.createMediaStreamSource(stream));
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
            this.resumeContext();
        } else {
            this.suspendContext();
        }
    }

    private startContext(): Promise<void> {
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
            this.startAnalyser();
            return Promise.resolve();
        }
        return this.audioContext.resume();
    }

    private suspendContext(): Promise<void> {
        this.stopAudioStream();
        if (this.audioContext) {
            return this.audioContext.suspend();
        }
        return Promise.resolve();
    }

    private resumeContext(): Promise<void> {
        return this.startContext().then(this.startAudioStream);
    }

    private stopContext(): Promise<void> {
        if (this.analyser) {
            this.analyser.stop();
            delete this.analyser;
        }
        this.stopAudioStream();
        if (this.audioContext) {
            return this.audioContext.close().then(() => {
                delete this.audioContext;
            });
        }
        return Promise.resolve();
    }

    private startAnalyser() {
        this.analyser = new PitchAnalyser(this.audioContext);
        this.analyser.on('pitch-change', (pitch) => {
            if (pitch) {
                this.pitch = pitch;
                this.note = toAbc(Note.fromMidi(Note.freqToMidi(pitch)));
            }
        });
    }
}
</script>

<style lang="scss">
</style>
