import AudioAnalyser from './AudioAnalyser';
import { PitchFinder } from '@/workers/pitchFinder';

export default class PitchAnalyser extends AudioAnalyser<{ freq: number, probability: number}> {
    private pitch!: {freq: number, probability: number};

    private pitchFinder: PitchFinder = new PitchFinder();

    private minVol: number = 0;

    public duration: number = 0;

    public get MinVol(): number {
        return this.minVol;
    }

    public set MinVol(value: number) {
        this.minVol = Math.max(Math.min(1, value), 0);
    }

    constructor(opts: any = {}) {
        super(opts);
        this.MinVol = opts.minVol || 0;
    }

    public setup(context: AudioContext) {
        super.setup(context);
        this.script.onaudioprocess = (event) => {
            const start = performance.now();
            this.analyserNode.getFloatTimeDomainData(this.timeData);

            const vol = PitchAnalyser.getVol(this.timeData);
            if (vol > this.minVol) {
                if (this.pitchFinder.sampleRate !== event.inputBuffer.sampleRate) {
                    this.pitchFinder.sampleRate = event.inputBuffer.sampleRate;
                }
                this.pitch = this.pitchFinder.findPitch(this.timeData);
                this.trigger(this.pitch);
                this.duration = performance.now() - start;
            }
        };
    }

    public static getVol(input: Float32Array): number {
        let sum = 0.0;
        for (let i = 0; i < input.length; i += 1) {
            sum += input[i] * input[i];
        }

        return Math.sqrt(sum / input.length);
    }
}
