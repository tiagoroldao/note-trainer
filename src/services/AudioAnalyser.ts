
import EventEmmiter from './EventEmmiter';

export default class AudioAnalyser<P> extends EventEmmiter<P> {
    // protected script!: ScriptProcessorNode;

    protected source!: MediaStreamAudioSourceNode;

    protected context!: AudioContext;

    protected bufferSize: number = 1024;

    protected inputChannels: number | undefined;

    protected outputChannels: number | undefined;

    protected analyserNode!: AnalyserNode;

    protected timeData!: Float32Array;

    constructor(opts: any = {}) {
        super();
        if (opts.bufferSize) {
            this.bufferSize = opts.bufferSize;
        }
    }

    public setup(context: AudioContext) {
        this.context = context;
        this.stop();
        this.analyserNode = this.context.createAnalyser();
        this.analyserNode.fftSize = this.bufferSize;
        this.timeData = new Float32Array(this.analyserNode.fftSize);
    }

    public connectToSource(source: MediaStreamAudioSourceNode, callback?: () => void) {
        if (this.source) {
            this.source.disconnect(this.analyserNode);
            delete this.source;
        }
        this.source = source;
        source.connect(this.analyserNode);
        if (typeof callback !== 'undefined') {
            callback();
        }
    }

    public stop() {
        if (this.source) {
            try {
                this.source.disconnect(this.analyserNode);
            } catch (e) {
                // do nothing;
            }
            delete this.source;
        }
        if (this.analyserNode) {
            try {
                this.analyserNode.disconnect();
            } catch (e) {
                // do nothing;
            }
            delete this.analyserNode;
        }
    }
}
