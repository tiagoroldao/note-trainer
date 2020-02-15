<template>
  <div class="accordion-area">
    <div
      ref="holder"
      class="accordion-area-inner">
      <div
        class="accordion-wrap"
        :style="{
          width: squareSize + 'px',
          height: squareSize + 'px',
        }">
        <template v-if="showEditControls">
          <AccordionAddButton
            :key="`rightHand-first-row-add`"
            class="button"
            :size="buttonSpace"
            :style="{
              top: centerY + 'px',
              right: (buttonSpace * (accordion.rightHand.length + 0.5)) + 'px',
            }" />
          <AccordionAddButton
            :key="`rightHand-last-row-add`"
            class="button"
            :size="buttonSpace"
            :style="{
              top: centerY + 'px',
              right: (buttonSpace * (-0.5)) + 'px',
            }" />
        </template>
        <template v-for="(row, rowIndex) in accordion.rightHand">
          <template v-if="showEditControls">
            <AccordionAddButton
              :key="`rightHand-${rowIndex}-bottom-add`"
              class="button"
              :size="buttonSpace"
              :style="{
                top: getButtonY(row, -1) + 'px',
                right: (buttonSpace * (rowIndex + 0.5)) + 'px',
              }" />
            <AccordionAddButton
              :key="`rightHand-${rowIndex}-top-add`"
              class="button"
              :size="buttonSpace"
              :style="{
                top: getButtonY(row, row.buttons.length) + 'px',
                right: (buttonSpace * (rowIndex + 0.5)) + 'px',
              }" />
          </template>
          <template v-for="(button, index) in row.buttons">
            <AccordionButton
              :key="`rightHand-${rowIndex}-${index}`"
              :editable="showEditControls"
              class="button"
              :size="buttonSpace"
              :button="button"
              :display="$vxm.settings.accordion.viewStyle"
              :style="{
                top: getButtonY(row, index) + 'px',
                right: (buttonSpace * (rowIndex + 0.5)) + 'px',
              }"
              @noteChange="onNoteChange(true, rowIndex, index, $event)" />
          </template>
        </template>
        <template v-if="showEditControls">
          <AccordionAddButton
            :key="`leftHand-first-row-add`"
            class="button"
            :size="buttonSpace"
            :style="{
              top: centerY + 'px',
              left: (buttonSpace * (accordion.leftHand.length + 0.5)) + 'px',
            }" />
          <AccordionAddButton
            :key="`leftHand-last-row-add`"
            class="button"
            :size="buttonSpace"
            :style="{
              top: centerY + 'px',
              left: (buttonSpace * (-0.5)) + 'px',
            }" />
        </template>
        <template v-for="(row, rowIndex) in accordion.leftHand">
          <template v-if="showEditControls">
            <AccordionAddButton
              :key="`leftHand-${rowIndex}-bottom`"
              class="button"
              :size="buttonSpace"
              :style="{
                top: getButtonY(row, -1) + 'px',
                left: (buttonSpace * (rowIndex + 0.5)) + 'px',
              }" />
            <AccordionAddButton
              :key="`leftHand-${rowIndex}-top`"
              class="button"
              :size="buttonSpace"
              :style="{
                top: getButtonY(row, row.buttons.length) + 'px',
                left: (buttonSpace * (rowIndex + 0.5)) + 'px',
              }" />
          </template>
          <template v-for="(button, index) in row.buttons">
            <AccordionButton
              :key="`leftHand-${rowIndex}-${index}`"
              :editable="showEditControls"
              class="button"
              :size="buttonSpace"
              :display="$vxm.settings.accordion.viewStyle"
              :button="button"
              :style="{
                top: getButtonY(row, index) + 'px',
                left: (buttonSpace * (rowIndex + 0.5)) + 'px',
              }"
              @noteChange="onNoteChange(false, rowIndex, index, $event)" />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import {
  Component, Watch,
} from 'vue-property-decorator';
import AccordionButton from './AccordionButton.vue';
import AccordionAddButton from './AccordionAddButton.vue';
import { RowDefinition, ButtonDefinition } from './AccordionDef';

@Component({
  components: {
    AccordionButton,
    AccordionAddButton,
  },
})
export default class AccordionViewer extends Vue {
  buttonSpace = 0;

  centerX = 0;

  centerY = 0;

  squareSize = 0;

  centerRowWidth = 3;

  private onWindowResizeListener = () => this.calculateButtons();

  $refs!: {
    holder: Element;
  }

  mounted() {
    window.addEventListener('resize', this.onWindowResizeListener);
    setTimeout(() => this.calculateButtons());
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResizeListener);
  }

  @Watch('accordion', { deep: true })
  @Watch('showEditControls')
  calculateButtons() {
    const rect = this.$refs.holder.getBoundingClientRect();
    const buttonsSpaceY = rect.height / this.buttonLength;
    const buttonsSpaceX = rect.width / this.rowsLength;

    this.squareSize = Math.min(rect.height, rect.width);
    this.centerX = this.squareSize / 2;
    this.centerY = this.squareSize / 2;
    this.buttonSpace = Math.floor(Math.min(buttonsSpaceX, buttonsSpaceY));
  }

  onNoteChange(
    isRightHand: boolean,
    rowIndex: number,
    buttonIndex: number,
    button: ButtonDefinition,
  ) {
    const row: RowDefinition[] = _.cloneDeep(
      isRightHand ? this.accordion.rightHand : this.accordion.leftHand,
    );

    row[rowIndex].buttons[buttonIndex] = button;

    this.$vxm.settings.accordion.updateLayout({
      [isRightHand ? 'rightHand' : 'leftHand']: row,
    });
  }

  getRowStart(row: RowDefinition) {
    return (
      (this.buttonLength - row.buttons.length - (row.offset || 0))
      / 2
    );
  }

  getButtonY(row: RowDefinition, index: number) {
    const buttonY = this.buttonSpace * (index + 0.5 + this.getRowStart(row));
    if (this.$vxm.settings.accordion.mirrorView) {
      return buttonY;
    }
    return (this.buttonLength * this.buttonSpace) - buttonY;
  }

  get buttonLength() {
    const editOffset = this.showEditControls ? 2 : 0;

    return Math.max(
      ...this.accordion.rightHand.map((r) => r.buttons.length + (r.offset || 0) + editOffset),
      ...this.accordion.leftHand.map((r) => r.buttons.length + (r.offset || 0) + editOffset),
    );
  }

  get showEditControls() {
    return this.$vxm.settings.accordion.showEditControls;
  }

  get horizontalOffset() {
    return (this.accordion.rightHand.length - this.accordion.leftHand.length) / 2;
  }

  get rowsLength() {
    const editOffset = this.showEditControls ? 4 : 0;

    return this.accordion.rightHand.length + this.accordion.leftHand.length + this.centerRowWidth + editOffset;
  }

  get accordion() {
    return this.$vxm.settings.accordion.accordionLayout;
  }
}
</script>

<style lang="scss" scoped>
.accordion-area, .accordion-area-inner {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.accordion-wrap {
  margin: auto;
  position: relative;
}

.accordion-area {
  padding: 10px;
}

.button {
  position: absolute;
}
</style>
