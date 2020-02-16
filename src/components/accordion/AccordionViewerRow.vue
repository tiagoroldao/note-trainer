<template>
  <div class="row-holder">
    <template v-if="showEditControls">
      <AccordionAddButton
        class="button"
        :size="buttonSpace"
        :style="{
          top: getButtonY(row, -1) + 'px',
        }"
        @add-button="$emit('add-button', 0)" />
      <AccordionAddButton
        class="button"
        :size="buttonSpace"
        :style="{
          top: getButtonY(row, row.buttons.length) + 'px',
        }"
        @add-button="$emit('add-button', row.buttons.length)" />
      <RowMenu
        :row="row"
        class="button"
        :size="buttonSpace"
        :style="{
          top: getButtonY(row, row.buttons.length + 0.6, false) + 'px',
        }"
        @set-row-offset="setRowOffset($event)"
        @remove-row="$emit('remove-row')" />
    </template>
    <template v-for="(button, index) in row.buttons">
      <AccordionButton
        :key="`button-${index}`"
        :editable="showEditControls"
        class="button"
        :size="buttonSpace"
        :button="button"
        :highlights="highlights"
        :display="display"
        :style="{
          top: getButtonY(row, index) + 'px',
        }"
        @add-button-above="$emit('add-button', index + (mirrorView ? 0 : 1))"
        @add-button-below="$emit('add-button', index + (mirrorView ? 1 : 0))"
        @remove-button="$emit('remove-button', index)"
        @note-change="onNoteChange(index, $event)" />
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  Component, Prop,
} from 'vue-property-decorator';
import AccordionButton from './AccordionButton.vue';
import AccordionAddButton from './editing/AccordionAddButton.vue';
import RowMenu from './editing/RowMenu.vue';
import { RowDefinition, ButtonDefinition } from './AccordionDef';

@Component({
  components: {
    AccordionButton,
    AccordionAddButton,
    RowMenu,
  },
})
export default class AccordionViewerRow extends Vue {
  @Prop({ default: false }) mirrorView!: boolean;

  @Prop({ default: false }) showEditControls!: boolean;

  @Prop({ default: 'both' }) display!: string;

  @Prop({ default: () => [] }) highlights!: string[];

  @Prop({ required: true }) row!: RowDefinition;

  @Prop({ default: 0 }) buttonSpace!: number;

  onNoteChange(
    buttonIndex: number,
    newButton: ButtonDefinition,
  ) {
    this.$emit('note-change', buttonIndex, newButton);
  }

  setRowOffset(
    offset: number,
  ) {
    this.$emit('set-row-offset', offset);
  }

  getButtonY(row: RowDefinition, index: number, mirrorView = this.mirrorView) {
    const buttonY = this.buttonSpace * (index + 0.5);
    if (mirrorView) {
      return buttonY;
    }
    return (row.buttons.length * this.buttonSpace) - buttonY;
  }
}
</script>

<style lang="scss" scoped>
.button {
  position: absolute;
}
</style>
