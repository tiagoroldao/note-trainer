<template>
  <div>
    <SettingsSection title="Scale Display">
      <v-switch
        v-model="$vxm.noteHighlighter.showHighlights"
        class="inline-block"
        label="Show Scale?" />
      <v-autocomplete
        v-model="$vxm.noteHighlighter.highlightedScaleName"
        placeholder="Choose Scale..."
        :items="possibleScales" />
      <v-autocomplete
        v-model="$vxm.noteHighlighter.highlightedScaleKey"
        placeholder="Choose Key..."
        :items="possibleKeys" />
    </SettingsSection>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { ScaleDictionary, Range } from '@tonaljs/modules';
import {
  Component,
} from 'vue-property-decorator';
import SettingsSection from '@/components/SettingsSection.vue';
import { toHumanNote } from '../../../helpers/noteHelpers';

@Component({
  components: {
    SettingsSection,
  },
})
export default class AccordionScaleSettings extends Vue {
  get possibleScales() {
    return ScaleDictionary.entries().map((e) => e.name).sort();
  }

  get possibleKeys() {
    return Range.chromatic(['C1', 'B1'], { sharps: true, pitchClass: true })
      .map((k) => ({
        value: k,
        text: toHumanNote(k, this.$vxm.settings.useRomanceNotes),
      }));
  }
}
</script>
<style lang="scss" scoped>
.inline-block {
  display: inline-block;
}
</style>
