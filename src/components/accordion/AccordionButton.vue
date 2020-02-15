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
      <div :class="['note-texts', `show-${display}`]">
        <div
          class="note-text opening"
          @click="onButtonClick($event, 'opening')">
          {{ openingNote }}
        </div>
        <div
          class="note-text closing"
          @click="onButtonClick($event, 'closing')">
          {{ closingNote }}
        </div>
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
    <NoteChooserMenu
      ref="noteChooserMenu"
      @change="onNoteChosen" />
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import { Component, Prop } from 'vue-property-decorator';
import { Note } from 'tonal';
import { toRomance } from '@/helpers/noteHelpers';
import { ButtonDefinition } from './AccordionDef';
import NoteChooserMenu from './editing/NoteChooserMenu.vue';
import OptionsMenu from './editing/OptionsMenu.vue';

@Component({
  components: {
    NoteChooserMenu,
    OptionsMenu,
  },
})
export default class extends Vue {
  @Prop({ default: false }) editable!: boolean;

  @Prop({ required: true }) size!: number;

  @Prop({ required: true }) button!: ButtonDefinition;

  @Prop({ default: 'both' }) display!: 'opening' | 'closing' | 'both';

  private editing: null | 'opening' | 'closing' = null;

  $refs!: {
    noteChooserMenu: NoteChooserMenu;
  }

  onButtonAction(actionEvent: any) {
    console.log(actionEvent);
  }

  onButtonClick(
    event: MouseEvent,
    row: 'opening' | 'closing',
  ) {
    if (!this.editable) { return; }
    this.editing = row;
    this.$refs.noteChooserMenu.show(
      event.clientX,
      event.clientY,
      this.button[row],
    );
  }

  onNoteChosen(note: any) {
    this.$refs.noteChooserMenu.hide();
    const button = _.cloneDeep(this.button);
    button[this.editing || 'opening'] = note;
    this.$emit('noteChange', button);
    this.editing = null;
  }

  get buttonSize() {
    return Math.floor(this.size * 0.85);
  }

  get borderSize() {
    return Math.floor(this.buttonSize / 15);
  }

  get fontSize() {
    return Math.floor(this.buttonSize / 3.5);
  }

  get closingNote() {
    return this.toHumanNote(this.button.closing);
  }

  get openingNote() {
    return this.toHumanNote(this.button.opening);
  }

  toHumanNote(_note: number | string) {
    let note = _note;
    if (typeof note === 'number') {
      note = Note.fromMidi(note, true);
    }
    const token = Note.tokenize(note);
    note = token[0] + token[1];
    return this.$vxm.settings.useRomanceNotes ? toRomance(note) : note;
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
      outline: blue;
      // background: rgb(174, 255, 221);
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
  }

  &.show-both {
    transform: rotate(-90deg);

    .note-text {
      &.opening {
        top: 50%;
        border-top: 0.1em solid #ccc;
      }

      &.closing {
        bottom: 50%;
        border-bottom: 0.1em solid #ccc;
        margin-top: 0.2em;
      }
    }
  }

  &.show-opening {
    .note-text.closing {
      display: none;
    }
    .note-text.opening {
      top: 0;
      padding-top: 1.5em;
      line-height: 0;
    }
  }

  &.show-closing {
    .note-text.opening {
      display: none;
    }
    .note-text.closing {
      top: 0;
      padding-top: 1.5em;
      line-height: 0;
    }
  }
}
</style>
