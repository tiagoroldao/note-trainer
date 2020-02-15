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
    this.analyserNode.getFloatTimeDomainData(this.timeData);
    this.trigger('volumeData', VolumeAnalyser.getVol(this.timeData));
    window.requestAnimationFrame(() => this.onFrame());
  }

  public static getVol(input: Float32Array): number {
    let sum = 0.0;
    for (let i = 0; i < input.length; i += 1) {
      sum += input[i] * input[i];
    }

    return Math.sqrt(sum / input.length);
  }
}
