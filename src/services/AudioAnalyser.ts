export default class AudioAnalyser<P> {
    protected script!: ScriptProcessorNode;

    protected source: MediaStreamAudioSourceNode | undefined;

    protected listeners: Array<(data: P) => void> = [];

    protected context!: AudioContext;

    public setup(context: AudioContext) {
        this.context = context;
        this.stop();
        this.script = this.context.createScriptProcessor(2048, 1, 1);
    }

    public onData(callback: (data: P) => void) {
        this.listeners.push(callback);

        return () => {
            this.listeners = this.listeners.filter(e => e !== callback);
        };
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
            try {
                this.source.disconnect();
            } catch (e) {
                // do nothing;
            }
            delete this.source;
        }
        if (this.script) {
            try {
                this.script.disconnect();
            } catch (e) {
                // do nothing;
            }
            delete this.script;
        }
    }

    protected trigger(data: P) {
        for (let i = 0; i < this.listeners.length; i += 1) {
            setTimeout(() => this.listeners[i](data));
        }
    }
}
