import Pitchfinder from 'pitchfinder';
import AudioAnalyser from './AudioAnalyser';

export default class PitchAnalyser extends AudioAnalyser<number> {
    private pitch!: {freq: number, probability: number};

    private detectPitch!: (input: Float32Array) => {
        freq: number;
        probability: number;
    }

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
        this.detectPitch = Pitchfinder.Macleod({ bufferSize: this.script.bufferSize });
        this.script.onaudioprocess = (event) => {
            if (this.sampleRate !== event.inputBuffer.sampleRate) {
                this.sampleRate = event.inputBuffer.sampleRate;
                this.detectPitch = Pitchfinder.Macleod({
                    bufferSize: this.script.bufferSize,
                    sampleRate: this.sampleRate,
                });
            }
            const input = event.inputBuffer.getChannelData(0);
            const vol = PitchAnalyser.getVol(input);
            if (vol > this.minVol) {
                this.pitch = this.detectPitch(input);
                this.trigger(this.pitch.freq);
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
