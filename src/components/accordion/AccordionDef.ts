export interface NoteDefinition {
  isChord?: boolean;
  note: string;
}

export interface ButtonDefinition {
  opening: NoteDefinition;
  closing: NoteDefinition;
}

export interface RowDefinition {
  buttons: ButtonDefinition[];
  offset?: number;
}

/**
 * - Row definitions are written from outside in
 * - Button definitions are written low to high notes,
 *   with same (physical) direction on bases
 */
export interface AccordionDefinition {
  id: string;
  name: string;
  custom?: boolean;
  edited?: boolean;
  rightHand: RowDefinition[];
  leftHand: RowDefinition[];
}
