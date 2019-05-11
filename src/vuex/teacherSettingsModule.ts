import {
    VuexModule, mutation, getter, Module,
} from 'vuex-class-component';

@Module({ namespacedPath: 'teacher/' })
export class TeacherSettingsModule extends VuexModule {
    @getter noteRegisterTime = 350;

    @mutation setNoteRegisterTime(time: number) {
        this.noteRegisterTime = Math.max(0, time);
    }
}
