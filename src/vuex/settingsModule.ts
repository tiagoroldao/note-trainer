import {
    VuexModule, mutation, action, getter, Module,
} from 'vuex-class-component';
import services from '@/services/services';

@Module({ namespacedPath: 'settings/' })
export class SettingsStore extends VuexModule {
    @getter minVol = 0;

    @getter selectedInput = '';

    @mutation setMinVol(minVol: number) {
        this.minVol = minVol;
        services.$audioContext.pitchAnalyser.MinVol = this.minVol / 100;
    }

    @mutation setSelectedInput(selectedInput: string) {
        this.selectedInput = selectedInput;
    }

    @action async onSetup() {
        services.$audioContext.pitchAnalyser.MinVol = this.minVol / 100;
    }
}
