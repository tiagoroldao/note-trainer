<template>
  <div class="accordion-button-holder">
    <div
      :class="['accordion-button', { editable }, `editing-${editing}`]"
      :style="{
        height: buttonSize + 'px',
        width: buttonSize + 'px',
        'margin-left': '-' + (buttonSize / 2) + 'px',
        'margin-top': '-' + (buttonSize / 2) + 'px',
        'border-radius': buttonSize + 'px',
        'border-width': borderSize + 'px',
        'font-size': fontSize + 'px',
      }">
      <div :class="['note-texts', `show-${displayedNote}`]">
        <NoteChooserMenu
          :note="button.opening"
          @change="onNoteChosen($event, true)">
          <template v-slot:activator="{ on }">
            <div
              :class="['note-text opening', {
                chord: button.opening.isChord,
                highlighted: !!openingNoteHighlighted,
              }]"
              :style="openingNoteHighlighted && getHighlightStyle(openingNoteHighlightedIndex, true)"
              v-on="on">
              {{ openingNote }}
            </div>
          </template>
        </NoteChooserMenu>
        <NoteChooserMenu
          :note="button.closing"
          @change="onNoteChosen($event, false)">
          <template v-slot:activator="{ on }">
            <div
              :class="['note-text closing', {
                chord: button.closing.isChord,
                highlighted: !!closingNoteHighlighted,
              }]"
              :style="closingNoteHighlighted && getHighlightStyle(closingNoteHighlightedIndex, false)"
              v-on="on">
              {{ closingNote }}
            </div>
          </template>
        </NoteChooserMenu>
      </div>
    </div>
    <OptionsMenu
      :items="[
        { title: 'Remove button', name: 'remove-button' },
        { title: 'Add button above', name: 'add-button-above' },
        { title: 'Add button below', name: 'add-button-below' },
      ]"
      @action="onButtonAction">
      <template v-slot:activator="{ on }">
        <v-btn
          v-show="editable"
          text
          icon
          class="options-button"
          :style="{
            top: (buttonSize / 2) + 'px',
            left: (buttonSize / 2) + 'px',
            height: (buttonSize / 2) + 'px',
            width: (buttonSize / 2) + 'px',
            'margin-left': '-' + (buttonSize / 4) + 'px',
            'margin-top': '-' + (buttonSize / 4) + 'px',
            'font-size': fontSize + 'px',
          }"
          color="amber lighten-2"
          v-on="on">
          <v-icon>
            arrow_drop_down_circle
          </v-icon>
        </v-btn>
      </template>
    </OptionsMenu>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import { Tonal } from '@tonaljs/modules';
import Color from 'color';
import { Component, Prop } from 'vue-property-decorator';
import { toHumanNote } from '@/helpers/noteHelpers';
import { ButtonDefinition, NoteDefinition } from './AccordionDef';
import NoteChooserMenu from './editing/NoteChooserMenu.vue';
import OptionsMenu from './editing/OptionsMenu.vue';

const closingStartHue = '#17d8ff';
const closingEndHue = '#26ff17';
const openingStartHue = '#ff2617';
const openingEndHue = '#ffe817';

@Component({
  components: {
    NoteChooserMenu,
    OptionsMenu,
  },
})
export default class AccordionButton extends Vue {
  @Prop({ default: false }) editable!: boolean;

  @Prop({ required: true }) size!: number;

  @Prop({ required: true }) button!: ButtonDefinition;

  @Prop({ default: false }) showHighlightsAsScale!: boolean;

  @Prop({ default: () => [] }) highlights!: string[];

  @Prop({ default: 'both' }) display!: 'opening' | 'closing' | 'both';

  private editing: null | 'opening' | 'closing' = null;

  $refs!: {
    noteChooserMenu: NoteChooserMenu;
  }

  get displayedNote() {
    if (this.editable) {
      return this.display;
    }
    if (this.button.closing.note === this.button.opening.note) {
      if (this.openingNoteHighlighted && this.closingNoteHighlighted) {
        return this.display;
      }
      return this.closingNoteHighlighted ? 'closing' : 'opening';
    }

    return this.display;
  }

  getHighlightStyle(index: number, opening: boolean) {
    if (this.highlights.length && this.showHighlightsAsScale) {
      const startHue = Color(opening ? openingStartHue : closingStartHue);
      const endHue = Color(opening ? openingEndHue : closingEndHue);

      return {
        background: startHue.mix(endHue, index / this.highlights.length).string(),
      };
    }

    return {};
  }

  onButtonAction(actionEvent: any) {
    this.$emit(actionEvent);
  }

  onNoteChosen(_note: NoteDefinition, opening = true) {
    const button = _.cloneDeep(this.button);
    button[opening ? 'opening' : 'closing'] = _note;
    this.$emit('note-change', button);
  }

  get buttonSize() {
    return Math.ceil(this.size * 0.85);
  }

  get borderSize() {
    return Math.ceil(this.buttonSize / 40);
  }

  get fontSize() {
    return Math.ceil(this.buttonSize / 3.5);
  }

  get openingNoteHighlightedIndex() {
    return !this.editable
      ? this.highlights.findIndex((n) => Tonal.note(this.button.opening.note).chroma === Tonal.note(n).chroma)
      : -1;
  }

  get openingNoteHighlighted() {
    return this.highlights[this.openingNoteHighlightedIndex];
  }

  get closingNoteHighlightedIndex() {
    return !this.editable
      ? this.highlights.findIndex((n) => Tonal.note(this.button.closing.note).chroma === Tonal.note(n).chroma)
      : -1;
  }

  get closingNoteHighlighted() {
    return this.highlights[this.closingNoteHighlightedIndex];
  }

  get closingNote() {
    return this.toHumanNote(this.closingNoteHighlighted || this.button.closing);
  }

  get openingNote() {
    return this.toHumanNote(this.openingNoteHighlighted || this.button.opening);
  }

  toHumanNote(_note: number | string | NoteDefinition) {
    return toHumanNote(_note, { useRomanceNotes: this.$vxm.settings.useRomanceNotes });
  }
}
</script>
<style lang="scss" scoped>
.accordion-button-holder{
  display: block;
  height: 0;
  width: 0;
}

.options-button {
  position: absolute;
  display: block;
  top: 0;
  left: 0;

  .v-icon {
    font-size: 1em;
    height: 100%;
  }
}

.accordion-button {
  position: relative;
  border: 0.2em solid #ccc;
  box-sizing: border-box;
  overflow: hidden;
  background: white;
  cursor: default;
  z-index: 2;

  &.editable {
    cursor: pointer;

    .note-text:hover {
      font-weight: bold;
      background: rgb(245, 245, 245);
    }
  }
}

.note-texts {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  .note-text {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    &.chord {
      font-weight: bold;
    }

    &.highlighted {
      background: #ff5252;
      color: white;

      &.closing {
        background: #4caf50;
      }
    }
  }

  &.show-both {
    transform: rotate(-90deg);

    .note-text {
      &.opening {
        top: 50%;
        border-top: 0.05em solid #ccc;
      }

      &.closing {
        bottom: 50%;
        border-bottom: 0.05em solid #ccc;
        padding-top: 0.1em;
      }
    }
  }

  &.show-opening {
    .note-text.closing {
      display: none;
    }
    .note-text.opening {
      top: 0;
      padding-top: 1.6em;
      line-height: 0;
    }
  }

  &.show-closing {
    .note-text.opening {
      display: none;
    }
    .note-text.closing {
      top: 0;
      padding-top: 1.6em;
      line-height: 0;
    }
  }
}
</style>
