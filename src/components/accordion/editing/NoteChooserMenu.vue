<template>
  <v-menu
    v-model="showingMenu"
    absolute
    offset-y
    :position-x="x"
    :position-y="y"
    :close-on-content-click="false"
    style="max-width: 600px">
    <template v-slot:activator="{ on }">
      <slot
        name="activator"
        :on="on" />
    </template>
    <v-card>
      <v-card-text class="pa-2">
        <v-checkbox
          :input-value="note.isChord"
          class="inline-block"
          label="Is a chord?"
          @change="onChosenChord" />
        <v-autocomplete
          ref="noteChoice"
          :value="note.note"
          hide-details
          :hide-selected="false"
          clearable
          autofocus
          class="pa-0 ma-0"
          menu-props="eager"
          placeholder="Choose Note..."
          :items="notes"
          @change="onChosenNote" />
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import {
  Component, Vue, Prop,
} from 'vue-property-decorator';
import _ from 'lodash';
import { Midi } from '@tonaljs/modules';
import { toHumanNote } from '@/helpers/noteHelpers';
import { NoteDefinition } from '../AccordionDef';

@Component
export default class NoteChooserMenu extends Vue {
  $refs!: {
    noteChoice: any;
  }

  private notes = _.range(128)
    .flatMap((n) => [Midi.midiToNoteName(n, { sharps: true }), Midi.midiToNoteName(n)])
    .filter((value, index, self) => self.indexOf(value) === index)
    .map((n) => ({
      value: n,
      text: this.toHumanNote(n, false),
    }));

  @Prop({ required: true }) note!: NoteDefinition;

  showingMenu = false;

  x = 0;

  y = 0;

  show(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.showingMenu = true;
    setTimeout(() => {
      this.$forceUpdate();
    });
  }

  hide() {
    this.showingMenu = false;
  }

  onChosenNote($event: any) {
    this.setNote({
      note: $event,
      isChord: this.note.isChord,
    });
  }

  onChosenChord($event: any) {
    this.setNote({
      note: this.note.note,
      isChord: $event,
    });
  }

  setNote(note: NoteDefinition) {
    this.$emit('change', note);
  }

  toHumanNote(_note: number | string, hideOctave = true) {
    return toHumanNote(
      _note,
      { useRomanceNotes: this.$vxm.settings.useRomanceNotes, hideOctave },
    );
  }
}
</script>
<style lang="scss" scoped>
.some-class {
  color: red;
}
</style>
