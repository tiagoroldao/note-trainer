<template>
  <div>
    <SettingsSection title="Display Options">
      <v-radio-group
        v-model="$vxm.settings.accordion.viewStyle"
        class="inline-block"
        row>
        <v-radio
          label="Closing"
          value="closing" />
        <v-radio
          label="Both"
          value="both" />
        <v-radio
          label="Opening"
          value="opening" />
      </v-radio-group>
    </SettingsSection>
    <SettingsSection
      description="Accordion layout can be viewed mirrored or traditionally (as in note sheets)">
      <v-switch
        v-model="$vxm.settings.accordion.mirrorView"
        class="inline-block"
        label="Mirror View?" />
    </SettingsSection>
    <v-switch
      v-model="$vxm.settings.accordion.showEditControls"
      class="inline-block"
      label="Show Edit Controls?" />
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import {
  Component,
} from 'vue-property-decorator';
import SettingsSection from '@/components/SettingsSection.vue';

@Component({
  components: {
    SettingsSection,
  },
})
export default class AccordionViewSettings extends Vue {
}
</script>
<style lang="scss" scoped>
.inline-block {
  display: inline-block;
}
</style>
