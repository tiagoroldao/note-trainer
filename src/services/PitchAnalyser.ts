import Pitchfinder from 'pitchfinder';
import AudioAnalyser from './AudioAnalyser';

const detectPitch = Pitchfinder.Macleod();

export default class PitchAnalyser extends AudioAnalyser<{freq: number, probability: number}> {
    private pitch!: {freq: number, probability: number};

    private minVol: number = 0;

    public get MinVol(): number {
        return this.minVol;
    }

    public set MinVol(value: number) {
        this.minVol = Math.max(Math.min(1, value), 0);
    }

    constructor(minVol = 0) {
        super();
        this.MinVol = minVol;
    }

    public setup(context: AudioContext) {
        super.setup(context);
        this.script.onaudioprocess = (event) => {
            const input = event.inputBuffer.getChannelData(0);
            const vol = PitchAnalyser.getVol(input);
            if (vol > this.minVol) {
                this.pitch = detectPitch(input);
                this.trigger(this.pitch);
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
