import { Note, Midi } from '@tonaljs/modules';
import { NoteDefinition } from '@/components/accordion/AccordionDef';

const romanceNotes: {[key: string] : string} = {
  A: 'La',
  B: 'Si',
  C: 'Do',
  D: 'Re',
  E: 'Mi',
  F: 'Fa',
  G: 'Sol',
  H: 'Si',
};

export function toRomance(note: string) {
  return romanceNotes[note[0]] + note.substr(1);
}

export interface NoteRenderOptions {
  useRomanceNotes?: boolean;
  hideOctave?: boolean;
  isChord?: boolean;
}

export function toHumanNote(_note: number | string | NoteDefinition, _options?: NoteRenderOptions) {
  const options: NoteRenderOptions = {
    hideOctave: true,
    useRomanceNotes: false,
    ..._options,
  };

  if (_note === undefined || _note === '') {
    return '';
  }
  let note = typeof _note === 'object' ? _note.note : _note;
  const isChord = options.isChord !== undefined ? options.isChord : (_note as NoteDefinition).isChord;

  if (typeof note === 'number') {
    note = Midi.midiToNoteName(note, { sharps: true });
  }
  const token = Note.tokenize(note);
  if (options.hideOctave) {
    token[2] = '';
  }
  if (options.useRomanceNotes) {
    token[0] = romanceNotes[token[0]];
  }
  if (isChord) {
    token[0] = options.useRomanceNotes ? token[0].toUpperCase() : token[0].toLowerCase();
  }
  return token.join('');
}
