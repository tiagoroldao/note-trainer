<template>
  <div>
    <v-autocomplete
      ref="layoutChoice"
      placeholder="Choose Layout..."
      :items="$vxm.settings.accordion.accordionLayouts"
      return-object
      item-text="name"
      @change="onLayoutChoice">
      <template v-slot:item="data">
        <span
          v-if="data.item.custom"
          class="custom-marker">(Custom)</span>
        <span>{{ data.item.name }}</span>
      </template>
    </v-autocomplete>
    <SettingsSection title="Layout Options">
      <v-text-field
        :value="currentLayout.name"
        required
        :rules="[ v => !!v || 'A Name is required' ]"
        label="Name"
        @input="setLayoutName" />
      <div class="text-right">
        <template v-if="currentLayout.custom">
          <v-btn
            class="ma-1"
            small
            color="error"
            @click="deleteLayout">
            Delete
          </v-btn>
          <v-btn
            v-if="currentLayout.edited"
            small
            color="warning"
            :disabled="!currentLayout.edited"
            class="ma-1"
            @click="resetLayout">
            Reset
          </v-btn>
          <v-btn
            small
            color="success"
            :disabled="!currentLayout.edited"
            class="ma-1"
            @click="saveLayout">
            Save
          </v-btn>
        </template>
        <template v-else-if="!currentLayout.edited">
          <v-btn
            small
            color="primary"
            class="ma-1"
            @click="makeLayoutCopy(false)">
            Duplicate
          </v-btn>
        </template>
        <template v-else>
          <v-btn
            v-if="currentLayout.edited"
            small
            color="warning"
            :disabled="!currentLayout.edited"
            class="ma-1"
            @click="resetLayout">
            Reset
          </v-btn>
          <v-btn
            small
            color="primary"
            class="ma-1"
            @click="makeLayoutCopy(true)">
            Save as new
          </v-btn>
        </template>
      </div>
    </SettingsSection>
    <ConfirmModal
      ref="deleteLayoutModal"
      title="Delete Layout?"
      text="Deleting a layout is not reversible" />
    <ConfirmModal
      ref="changeLayoutModal"
      title="Change Layout?"
      text="The current layout has unsaved changes, which will be lost." />
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import {
  Component,
} from 'vue-property-decorator';
import SettingsSection from '@/components/SettingsSection.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import { accordions } from '@/data/accordions';
import { AccordionDefinition } from '../AccordionDef';

@Component({
  components: {
    SettingsSection,
    ConfirmModal,
  },
})
export default class AccordionLayoutSettings extends Vue {
  $refs!: {
    layoutChoice: any;
    deleteLayoutModal: ConfirmModal,
    changeLayoutModal: ConfirmModal,
  };

  deleteDialog = false;

  get keyLayouts() {
    return accordions;
  }

  get currentLayout() {
    return this.$vxm.settings.accordion.accordionLayout;
  }

  onLayoutChoice(choice: AccordionDefinition) {
    if (this.currentLayout.edited) {
      this.$refs.changeLayoutModal.popup().then((result) => {
        if (result === 'ok') {
          this.$vxm.settings.accordion.accordionLayout = choice;
          this.$refs.layoutChoice.reset();
        }
      });
    } else {
      this.$vxm.settings.accordion.accordionLayout = choice;
      this.$refs.layoutChoice.reset();
    }
  }

  setLayoutName(name: string) {
    this.$vxm.settings.accordion.updateLayout({ name });
  }

  resetLayout() {
    this.$vxm.settings.accordion.resetLayout();
  }

  makeLayoutCopy(skipNameChange = false) {
    this.$vxm.settings.accordion.makeCopy(
      this.$vxm.settings.accordion.accordionLayout,
      skipNameChange,
    );
  }

  deleteLayout() {
    this.$refs.deleteLayoutModal.popup().then((result) => {
      if (result === 'ok') {
        this.$vxm.settings.accordion.deleteLayout(
          this.$vxm.settings.accordion.accordionLayout,
        );
      }
    });
  }

  saveLayout() {
    this.$vxm.settings.accordion.saveLayout();
  }
}
</script>
<style lang="scss" scoped>
.inline-block {
  display: inline-block;
}

.custom-marker {
  font-size: 0.8em;
  vertical-align: middle;
  font-weight: bold;
  color: #888;
  margin-right: 0.2em;
}
</style>
