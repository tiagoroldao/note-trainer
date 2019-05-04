<template>
    <div>
        <h1>Pitch Finder</h1>
        <select v-model="selectedDevice">
            <option disabled value="">Please select an input device</option>
            <option v-for="(option, index) in devices" :value="option.deviceId" :key="option.deviceId">
                {{ option.label ||  `microphone ${index + 1}`}}
            </option>
        </select>
        <div class="note">
            <NoteRenderer :note="note"/>
        </div>
    </div>
</template>

<script lang="ts">
import PitchAnalyser from '../tools/PitchAnalyser';
import { Note } from 'tonal';
import { toAbc } from 'tonal-abc-notation';
import NoteRenderer from '@/components/NoteRenderer.vue';
import { Component, Prop, Vue, Provide, Watch } from 'vue-property-decorator';

@Component({
  components: {
    NoteRenderer,
  },
})
export default class PitchFinder extends Vue {
    @Provide() public devices = [] as MediaDeviceInfo[];
    @Provide() public selectedDevice = '' as unknown as string;
    @Provide() public audioStream = null as any;
    @Provide() public pitch = null;
    @Provide() public note = 'x';

    private analyser!: PitchAnalyser;
    private audioContext!: AudioContext;

    @Watch('selectedDevice')
    public onSelectedDeviceChange() {
        if (this.selectedDevice) {
            if (!this.analyser) {
                this.startAnalyser();
            }
            this.startAudioStream();
        } else {
            this.analyser.stop();
        }
    }

    public mounted() {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            this.devices = devices.filter((d) => d.kind === 'audioinput');
        });
    }

    public beforeDestroy() {
        if (this.analyser) {
            this.analyser.stop();
            delete this.analyser;
        }
    }

    public startAudioStream() {
        navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: {exact: this.selectedDevice},
            },
        })
        .then((stream) => {
            this.analyser.connectToSource(this.audioContext.createMediaStreamSource(stream));
        });
    }

    private startAnalyser() {
        this.audioContext = new AudioContext();
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
    .note {
        width: 50%;
        margin-left: 25%;
        @media screen and (max-width: 750px) {
            width: 100%;
            margin-left: 0;
        }
    }
</style>
