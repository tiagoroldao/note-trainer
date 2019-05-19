import PitchAnalyser from './PitchAnalyser';
import VolumeAnalyser from './VolumeAnalyser';
import EventEmmiter from './EventEmmiter';

const Context = (window as any).AudioContext || (window as any).webkitAudioContext;

export type AudioContextProviderEvent = 'state-change';
export type AudioContextProviderState = 'stopped' | 'running' | 'paused' | 'hold';

export default class AudioContextProvider extends EventEmmiter<AudioContextProviderEvent> {
    private context!: AudioContext | undefined;

    public readonly pitchAnalyser: PitchAnalyser = new PitchAnalyser();

    public readonly volumeAnalyser: VolumeAnalyser = new VolumeAnalyser();

    public audioStream!: MediaStream;

    private state: AudioContextProviderState = 'stopped';

    private currentInput: string = '';

    private _useRawAudio: boolean = false;

    public get useRawAudio(): boolean {
        return this._useRawAudio;
    }

    public set useRawAudio(value: boolean) {
        this._useRawAudio = value;
        if (this.state === 'running') {
            this.startAudioStream(this.currentInput);
        }
    }

    constructor() {
        super();
        document.addEventListener('visibilitychange', () => this.onVisibilityChange());
    }

    public get Context(): AudioContext | undefined {
        return this.context;
    }

    public get State(): AudioContextProviderState {
        return this.state;
    }

    private setState(state: AudioContextProviderState) {
        this.state = state;
        this.trigger('state-change', state);
    }

    public start(input?: string): Promise<void> {
        let startContext = Promise.resolve();
        if (!this.context || this.context.state === 'closed') {
            this.context = new Context();
        } if (this.context && this.context.state === 'suspended') {
            startContext = this.context.resume();
        }
        if (input) {
            startContext = startContext.then(() => this.startAudioStream(input));
        }
        return startContext;
    }

    public suspend(hold = false): Promise<void> {
        if (this.context) {
            this.stopAudioStream();
            return this.context.suspend().then(() => {
                this.setState(hold ? 'hold' : 'paused');
            });
        }
        return Promise.resolve();
    }

    private onVisibilityChange() {
        if (document.visibilityState === 'visible') {
            if (this.state === 'hold') {
                this.start(this.currentInput);
            }
        } else if (this.state === 'running') {
            this.suspend(true);
        }
    }

    public stop(): Promise<void> {
        if (this.context) {
            this.stopAudioStream();
            return this.context.close().then(() => {
                delete this.context;
                this.setState('stopped');
            });
        }
        return Promise.resolve();
    }

    private startAudioStream(input: string): Promise<void> {
        this.stopAudioStream();
        const audio: any = { deviceId: { exact: input } };
        if (this.useRawAudio) {
            audio.echoCancellation = false;
            audio.noiseSuppression = false;
            audio.autoGainControl = false;
        }
        return navigator.mediaDevices.getUserMedia({ audio })
            .then((stream) => {
                if (this.context) {
                    this.audioStream = stream;
                    this.currentInput = input;
                    this.startAnalyser();
                    this.setState('running');
                }
            });
    }

    private stopAudioStream() {
        if (this.audioStream) {
            this.stopAnalyser();
            this.audioStream.getAudioTracks().forEach((track) => {
                track.stop();
            });
            delete this.audioStream;
        }
    }

    private startAnalyser() {
        if (this.context) {
            this.volumeAnalyser.setup(this.context);
            this.pitchAnalyser.setup(this.context);
            const source = this.context.createMediaStreamSource(this.audioStream);
            this.pitchAnalyser.connectToSource(source);
            this.volumeAnalyser.connectToSource(source);
        }
    }

    private stopAnalyser() {
        this.pitchAnalyser.stop();
        this.volumeAnalyser.stop();
    }
}
