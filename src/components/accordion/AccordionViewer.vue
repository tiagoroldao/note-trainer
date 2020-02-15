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
        <div
          v-for="(row, rowIndex) in accordion.rightHand"
          :key="`rightHand-${rowIndex}-row`"
          class="row-holder"
          :style="{
            right: (buttonSpace * (rowIndex + 0.5)) + 'px',
            top: getRowStart(row) + 'px',
          }">
          <template v-if="showEditControls">
            <AccordionAddButton
              :key="`rightHand-${rowIndex}-bottom-add`"
              class="button"
              :size="buttonSpace"
              :style="{
                top: getButtonY(row, -1) + 'px',
              }" />
            <AccordionAddButton
              :key="`rightHand-${rowIndex}-top-add`"
              class="button"
              :size="buttonSpace"
              :style="{
                top: getButtonY(row, row.buttons.length) + 'px',
              }" />
            <RowMenu
              :key="`rightHand-${rowIndex}-top-menu`"
              :row="row"
              class="button"
              :size="buttonSpace"
              :style="{
                top: getButtonY(row, row.buttons.length + 0.6) + 'px',
              }"
              @set-row-offset="setRowOffset(true, rowIndex, $event)" />
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
              }"
              @noteChange="onNoteChange(true, rowIndex, index, $event)" />
          </template>
        </div>
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
        <div
          v-for="(row, rowIndex) in accordion.leftHand"
          :key="`leftHand-${rowIndex}-row`"
          class="row-holder"
          :style="{
            left: (buttonSpace * (rowIndex + 0.5)) + 'px',
            top: getRowStart(row) + 'px',
          }">
          <template v-if="showEditControls">
            <AccordionAddButton
              :key="`leftHand-${rowIndex}-bottom`"
              class="button"
              :size="buttonSpace"
              :style="{
                top: getButtonY(row, -1) + 'px',
              }" />
            <AccordionAddButton
              :key="`leftHand-${rowIndex}-top`"
              class="button"
              :size="buttonSpace"
              :style="{
                top: getButtonY(row, row.buttons.length) + 'px',
              }" />
            <RowMenu
              :key="`leftHand-${rowIndex}-top-menu`"
              :row="row"
              class="button"
              :size="buttonSpace"
              :style="{
                top: getButtonY(row, row.buttons.length + 0.6) + 'px',
              }"
              @set-row-offset="setRowOffset(false, rowIndex, $event)" />
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
              }"
              @noteChange="onNoteChange(false, rowIndex, index, $event)" />
          </template>
        </div>
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

  setRowOffset(
    isRightHand: boolean,
    rowIndex: number,
    offset: number,
  ) {
    const row: RowDefinition[] = _.cloneDeep(
      isRightHand ? this.accordion.rightHand : this.accordion.leftHand,
    );

    row[rowIndex].offset = offset;

    this.$vxm.settings.accordion.updateLayout({
      [isRightHand ? 'rightHand' : 'leftHand']: row,
    });
  }

  getRowStart(row: RowDefinition) {
    const offset = this.mirrorView ? (row.offset || 0) : -(row.offset || 0);
    return this.buttonSpace * (
      (this.buttonLength - row.buttons.length - offset)
      / 2
    );
  }

  getButtonY(row: RowDefinition, index: number) {
    const buttonY = this.buttonSpace * (index + 0.5);
    if (this.mirrorView) {
      return buttonY;
    }
    return (row.buttons.length * this.buttonSpace) - buttonY;
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

  get mirrorView() {
    return this.$vxm.settings.accordion.mirrorView;
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

  .row-holder {
    position: absolute;
    top: 0;
    bottom: 0;
  }
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
