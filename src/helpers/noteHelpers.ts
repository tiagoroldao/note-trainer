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
