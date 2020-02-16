import {
  createModule,
} from 'vuex-class-component';
import { Scale } from '@tonaljs/modules';

const VuexModule = createModule({
  strict: false,
  namespaced: 'noteHighlighter',
  enableLocalWatchers: true,
});

export class NoteHighlighterModule extends VuexModule {
  showHighlights: boolean = false;

  showHighlightsAsScale: boolean = true;

  highlightedScaleName: string = 'major';

  highlightedScaleKey: string = 'C';

  get highlightedScaleNotes() {
    const scale = Scale.scale(`${this.highlightedScaleKey} ${this.highlightedScaleName}`);
    return scale ? scale.notes : [];
  }
}
