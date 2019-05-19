import AudioAnalyser from './AudioAnalyser';

export type VolumenAnalyserEvent = 'volumeData';

export default class VolumeAnalyser extends AudioAnalyser<VolumenAnalyserEvent> {
    public setup(context: AudioContext) {
        super.setup(context);
    }

    public connectToSource(source: MediaStreamAudioSourceNode, callback?: () => void) {
        super.connectToSource(source, callback);
        this.onFrame();
    }

    private onFrame() {
        if (!this.source) return;
        this.analyserNode.getByteFrequencyData(this.freqData);
        this.trigger('volumeData', VolumeAnalyser.getVol(this.freqData));
        window.requestAnimationFrame(() => this.onFrame());
    }

    public static getVol(input: Uint8Array): number {
        let sum = 0.0;
        for (let i = 0; i < input.length; i += 1) {
            sum += input[i];
        }

        return sum / input.length;
    }
}
