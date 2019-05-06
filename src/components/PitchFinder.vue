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
            <v-flex xs10 sm4 d-flex>
                <v-btn 
                    @click="toggleStream"
                    :disabled="!selectedDevice" 
                    :color="state == 'running' ? 'error' : 'success'">
                    <span v-if="!selectedDevice">Please select an input device</span>
                    <span v-else-if="state == 'running'">Stop</span>
                    <span v-else>Start</span>
                </v-btn>
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
import PitchAnalyser from '../services/PitchAnalyser';
import { Note } from 'tonal';
import { toAbc } from 'tonal-abc-notation';
import NoteRenderer from '@/components/NoteRenderer.vue';
import Vue from 'vue';
import { Component, Prop, Provide, Watch } from 'vue-property-decorator';

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
    @Provide() public state: 'stopped' | 'running' | 'paused' = 'stopped';

    public audioStream!: MediaStream;
    private analyser!: PitchAnalyser;

    public toggleStream() {
        if (this.state !== 'running' && this.selectedDevice) {
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
            this.devices = devices.filter((d) => d.kind === 'audioinput');
            this.selectedDevice = devices[0].deviceId;
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
            if (this.$audioContext.Context) {
                this.audioStream = stream;
                this.analyser.connectToSource(this.$audioContext.Context.createMediaStreamSource(stream));
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
            if (this.state === 'suspended') {
                this.resumeContext();
            }
        } else {
            if (this.state === 'running') {
                this.suspendContext();
            }
        }
    }

    private startContext(): Promise<void> {
        return this.$audioContext.startContext().then(this.startAnalyser);
    }

    private suspendContext(): Promise<void> {
        this.stopAudioStream();
        this.state = 'suspended';
        return this.$audioContext.suspendContext();
    }

    private resumeContext(): Promise<void> {
        return this.$audioContext.startContext().then(this.startAudioStream);
    }

    private stopContext(): Promise<void> {
        if (this.analyser) {
            this.analyser.stop();
            delete this.analyser;
        }
        this.stopAudioStream();
    }

    private startAnalyser() {
        if (this.analyser) {
            this.analyser.stop();
            delete this.analyser;
        }
        if (this.$audioContext.Context) {
            this.analyser = new PitchAnalyser(this.$audioContext.Context);
            this.analyser.on('pitch-change', (pitch) => {
                if (pitch) {
                    this.pitch = pitch;
                    this.note = toAbc(Note.fromMidi(Note.freqToMidi(pitch)));
                }
            });
        }
    }
}
</script>

<style lang="scss">
</style>
