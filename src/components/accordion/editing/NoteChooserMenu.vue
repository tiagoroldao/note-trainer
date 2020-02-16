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
  Component, Vue,
} from 'vue-property-decorator';
import _ from 'lodash';
import { Midi } from '@tonaljs/modules';
import { toHumanNote } from '@/helpers/noteHelpers';

@Component
export default class NoteChooserMenu extends Vue {
  $refs!: {
    noteChoice: any;
  }

  private notes = _.range(128).map((n) => ({
    value: Midi.midiToNoteName(n, { sharps: true }),
    text: this.toHumanNote(n, false),
  }));

  private value: string = '';

  showingMenu = false;

  x = 0;

  y = 0;

  show(x = 0, y = 0, value?: string) {
    this.x = x;
    this.y = y;
    this.value = value || '';
    this.showingMenu = true;
  }

  hide() {
    this.showingMenu = false;
  }

  onChosenNote($event: any) {
    this.$emit('change', $event || '');
    this.showingMenu = false;
    this.value = '';
  }

  toHumanNote(_note: number | string, hideOctave = true) {
    return toHumanNote(_note, this.$vxm.settings.useRomanceNotes, hideOctave);
  }
}
</script>
<style lang="scss" scoped>
.some-class {
  color: red;
}
</style>
