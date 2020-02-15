import {
  createModule, mutation, action, createSubModule,
} from 'vuex-class-component';
import services from '@/services/services';
import { TeacherSettingsModule } from './teacherSettingsModule';
import { AccordionSettingsModule } from './accordionSettingsModule';

const VuexModule = createModule({
  strict: false,
  namespaced: 'settings',
  enableLocalWatchers: true,
});

export class SettingsModule extends VuexModule {
    public minVol = 0;

    teacher = createSubModule(TeacherSettingsModule);

    accordion = createSubModule(AccordionSettingsModule);

    public selectedInput = '';

    public useRomanceNotes = true;

    @mutation setUseRomanceNotes(useRomanceNotes: boolean) {
      this.useRomanceNotes = useRomanceNotes;
    }

    @mutation setMinVol(minVol: number) {
      this.minVol = minVol;
      services.$audioContext.pitchAnalyser.MinVol = this.minVol / 100;
    }

    @mutation setSelectedInput(selectedInput: string) {
      this.selectedInput = selectedInput;
      if (services.$audioContext.State === 'running' && this.selectedInput) {
        services.$audioContext.start(this.selectedInput);
      }
    }

    @action async onSetup() {
      navigator.mediaDevices.enumerateDevices().then((dev) => {
        const devices = dev.filter((d) => d.kind === 'audioinput');
        if (!devices.find((d) => d.deviceId === this.selectedInput)) {
          this.setSelectedInput(devices[0].deviceId);
        }
      });
      this.setMinVol(this.minVol);
    }
}
