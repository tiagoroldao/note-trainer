import {
    VuexModule, mutation, action, getter, Module,
} from 'vuex-class-component';
import services from '@/services/services';
import { AudioContextProviderState } from '@/services/AudioContext';

@Module({ namespacedPath: 'audio/' })
export class AudioModule extends VuexModule {
    @getter state: AudioContextProviderState = 'stopped';

    @mutation setState(state: AudioContextProviderState) {
        this.state = state;
    }

    @action async onSetup() {
        this.setState(services.$audioContext.State);
        services.$audioContext.on('state-change', (state) => {
            this.setState(state);
        });
    }
}
