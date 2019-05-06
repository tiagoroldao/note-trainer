const Context = (window as any).AudioContext || (window as any).webkitAudioContext;

export default class AudioContextProvider {
    private context!: AudioContext | undefined;

    public get Context(): AudioContext | undefined {
        return this.context;
    }

    public startContext(): Promise<void> {
        if (!this.context || this.context.state === 'closed') {
            this.context = new Context();
            return Promise.resolve();
        } else if (this.context.state === 'suspended') {
            return this.context.resume();
        }
        return Promise.resolve();
    }

    public suspendContext(): Promise<void> {
        if (this.context) {
            return this.context.suspend();
        }
        return Promise.resolve();
    }

    public stopContext(): Promise<void> {
        if (this.context) {
            return this.context.close().then(() => {
                this.context = undefined;
            });
        }
        return Promise.resolve();
    }
}
