import AudioAnalyser from './AudioAnalyser';

export default class VolumeAnalyser extends AudioAnalyser<number> {
    public setup(context: AudioContext) {
        super.setup(context);
        this.script.onaudioprocess = (event) => {
            this.trigger(VolumeAnalyser.getVol(event.inputBuffer.getChannelData(0)));
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
