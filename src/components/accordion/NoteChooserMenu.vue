<template>
  <v-menu
    v-model="showingMenu"
    absolute
    offset-y
    :position-x="x"
    :position-y="y"
    :close-on-content-click="false"
    style="max-width: 600px">
    <v-card>
      <v-card-text class="pa-2">
        <v-autocomplete
          ref="noteChoice"
          :value="value"
          hide-details
          autofocus
          class="pa-0 ma-0"
          menu-props="eager"
          placeholder="Choose Note..."
          :items="notes"
          @change="$emit('change', $event)" />
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import {
  Component, Vue,
} from 'vue-property-decorator';
import _ from 'lodash';
import { Note } from 'tonal';
import { toRomance } from '@/helpers/noteHelpers';

@Component
export default class NoteChooserMenu extends Vue {
  $refs!: {
    noteChoice: any;
  }

  private notes = _.range(128).map((n) => ({ value: n, text: this.toHumanNote(n) }));

  private value: number | null = null;

  showingMenu = false;

  x = 0;

  y = 0;

  show(x = 0, y = 0, value?: number) {
    this.x = x;
    this.y = y;
    this.value = value || null;
    this.showingMenu = true;
  }

  hide() {
    this.showingMenu = false;
  }

  onChosenNote($event: any) {
    this.$emit('change', $event);
    this.showingMenu = false;
  }

  toHumanNote(_note: number | string) {
    let note = _note;
    if (typeof note === 'number') {
      note = Note.fromMidi(note, true);
    }

    return this.$vxm.settings.useRomanceNotes ? toRomance(note) : note;
  }
}
</script>
<style lang="scss" scoped>
.some-class {
  color: red;
}
</style>
