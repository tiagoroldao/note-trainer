import PitchAnalyser from './PitchAnalyser';
import VolumeAnalyser from './VolumeAnalyser';
import EventEmmiter from './EventEmmiter';

const Context = (window as any).AudioContext || (window as any).webkitAudioContext;

export type AudioContextProviderEvent = 'state-change';

export default class AudioContextProvider extends EventEmmiter<AudioContextProviderEvent> {
    private context!: AudioContext | undefined;

    public readonly pitchAnalyser: PitchAnalyser = new PitchAnalyser();

    public readonly volumeAnalyser: VolumeAnalyser = new VolumeAnalyser();

    public audioStream!: MediaStream;

    private state: 'stopped' | 'running' | 'paused' = 'stopped';

    public get Context(): AudioContext | undefined {
        return this.context;
    }

    public get State(): 'stopped' | 'running' | 'paused' {
        return this.state;
    }

    private setState(state: 'stopped' | 'running' | 'paused') {
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

    public suspend(): Promise<void> {
        if (this.context) {
            this.stopAudioStream();
            return this.context.suspend().then(() => {
                this.setState('paused');
            });
        }
        return Promise.resolve();
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
        return navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: { exact: input },
            },
        })
            .then((stream) => {
                if (this.context) {
                    this.audioStream = stream;
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
