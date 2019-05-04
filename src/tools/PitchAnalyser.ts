import Pitchfinder from 'pitchfinder';
const detectPitch = Pitchfinder.AMDF();

export default class PitchAnalyser {
    private pitch = 0;
    private script: ScriptProcessorNode;
    private source: MediaStreamAudioSourceNode | undefined;
    private listeners: {[key: string]: Array<(...args: any[]) => void>} = {};

    constructor(private context: AudioContext) {
        this.script = context.createScriptProcessor(2048, 1, 1);
        this.script.onaudioprocess = (event) => {
            const input = event.inputBuffer.getChannelData(0);
            this.pitch = detectPitch(input);
            this.trigger('pitch-change', this.pitch);
        };
    }

    public on(event: string, callback: (...args: any[]) => void) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }

        this.listeners[event].push(callback);

        return () => this.off(event, callback);
    }

    public off(event: string, callback: (...args: any[]) => void) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter((e) => e !== callback);
        }
    }

    public connectToSource(source: MediaStreamAudioSourceNode, callback?: () => void) {
        if (this.source) {
            this.source.disconnect(this.script);
            this.source = undefined;
        }
        source.connect(this.script);
        this.source = source;
        this.script.connect(this.context.destination);
        if (typeof callback !== 'undefined') {
            callback();
        }
    }

    public stop() {
        if (this.source) {
            this.source.disconnect();
        }
        this.script.disconnect();
    }

    private trigger(event: string, ...args: any[]) {
        if (!this.listeners[event]) {
            return;
        }
        for (const listener of this.listeners[event]) {
            setTimeout(() => listener(...args));
        }
    }
}
