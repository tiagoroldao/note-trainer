import {
  createModule, mutation, getter,
} from 'vuex-class-component';
import { Scale } from 'tonal';

const VuexModule = createModule({
  strict: false,
  namespaced: 'teacher',
  enableLocalWatchers: true,
});

export class TeacherSettingsModule extends VuexModule {
    @getter noteRegisterTime = 350;

    @getter notes: string[] = Scale.notes('C major');

    @getter noteRange: number[] = [10, 100];

    @mutation setNoteRegisterTime(time: number) {
      this.noteRegisterTime = Math.max(0, time);
    }

    @mutation setNotes(notes: string[]) {
      this.notes = notes;
    }

    @mutation setNoteRange(range: number[]) {
      const min = Math.max(0, range[0]);
      const max = Math.max(Math.min(127, range[1]), min);
      this.noteRange = [min, max];
    }
}
