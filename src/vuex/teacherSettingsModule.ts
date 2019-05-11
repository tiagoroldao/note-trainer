import {
    VuexModule, mutation, getter, Module,
} from 'vuex-class-component';
import { Scale } from 'tonal';

@Module({ namespacedPath: 'teacher/' })
export class TeacherSettingsModule extends VuexModule {
    @getter noteRegisterTime = 350;

    @getter notes: string[] = Scale.notes('C major');;

    @mutation setNoteRegisterTime(time: number) {
        this.noteRegisterTime = Math.max(0, time);
    }

    @mutation setNotes(notes: string[]) {
        this.notes = notes;
    }
}
