import { Note, Midi } from '@tonaljs/modules';

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

export function toHumanNote(_note: number | string, useRomanceNotes = false, hideOctave = true) {
  if (_note === undefined || _note === '') {
    return '';
  }
  let note = _note;
  if (typeof note === 'number') {
    note = Midi.midiToNoteName(note, { sharps: true });
  }
  if (hideOctave) {
    const token = Note.tokenize(note);
    note = token[0] + token[1];
  }
  return (useRomanceNotes ? toRomance(note) : note);
}
