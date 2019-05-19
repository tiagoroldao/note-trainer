import AudioAnalyser from './AudioAnalyser';
import { PitchFinder } from '@/workers/pitchFinder';

export type PitchAnalyserEvent = 'pitchData';
export default class PitchAnalyser extends AudioAnalyser<PitchAnalyserEvent> {
    private pitch!: {freq: number, probability: number};

    private pitchFinder: PitchFinder = new PitchFinder();

    private minVol: number = 0;

    public duration: number = 0;

    public get MinVol(): number {
        return this.minVol;
    }

    public set MinVol(value: number) {
        this.minVol = Math.max(Math.min(255, value), 0);
    }

    constructor(opts: any = {}) {
        super(opts);
        this.MinVol = opts.minVol || 0;
    }

    private onFrame() {
        if (!this.source) return;
        const start = performance.now();
        this.analyserNode.getByteFrequencyData(this.freqData);

        const vol = PitchAnalyser.getVol(this.freqData);
        if (vol > this.minVol) {
            this.analyserNode.getFloatTimeDomainData(this.timeData);
            this.pitch = this.pitchFinder.findPitch(this.timeData);
            this.trigger('pitchData', this.pitch);
            this.duration = performance.now() - start;
        }
        window.requestAnimationFrame(() => this.onFrame());
    }

    public connectToSource(source: MediaStreamAudioSourceNode, callback?: () => void) {
        super.connectToSource(source, callback);
        this.onFrame();
    }

    public setup(context: AudioContext) {
        super.setup(context);
        this.pitchFinder.sampleRate = context.sampleRate;
    }

    public static getVol(input: Uint8Array): number {
        let sum = 0.0;
        for (let i = 0; i < input.length; i += 1) {
            sum += input[i];
        }

        return sum / input.length;
    }
}
