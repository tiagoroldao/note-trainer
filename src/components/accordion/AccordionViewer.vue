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
        <template v-for="side in sides">
          <template v-if="showEditControls">
            <AccordionAddButton
              :key="`${side}-first-row-add`"
              class="button"
              :size="buttonSpace"
              :style="{
                top: centerY + 'px',
                left: getRowX(side === 'rightHand', (accordion[side].length)) + 'px',
              }"
              @add-button="onAddRow(side === 'rightHand', accordion[side].length)" />
            <AccordionAddButton
              :key="`${side}-last-row-add`"
              class="button"
              :size="buttonSpace"
              :style="{
                top: centerY + 'px',
                left: getRowX(side === 'rightHand', -1) + 'px',
              }"
              @add-button="onAddRow(side === 'rightHand', 0)" />
          </template>
          <AccordionViewerRow
            v-for="(row, rowIndex) in accordion[side]"
            :key="`${side}-${rowIndex}-row`"
            :row="row"
            :mirror-view="mirrorView"
            :show-edit-controls="showEditControls"
            :button-space="buttonSpace"
            class="row-holder"
            :style="{
              left: getRowX(side === 'rightHand', rowIndex) + 'px',
              top: getRowY(row) + 'px',
            }"
            @add-button="(index) => onAddButton(side === 'rightHand', rowIndex, index)"
            @remove-button="(index) => onRemoveButton(side === 'rightHand', rowIndex, index)"
            @remove-row="(index) => onRemoveRow(side === 'rightHand', rowIndex)"
            @note-change="(index, note) => onNoteChange(side === 'rightHand', rowIndex, index, note)"
            @set-row-offset="(offset) => setRowOffset(side === 'rightHand', rowIndex, offset)" />
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
import AccordionViewerRow from './AccordionViewerRow.vue';
import AccordionAddButton from './editing/AccordionAddButton.vue';
import RowMenu from './editing/RowMenu.vue';
import { RowDefinition, ButtonDefinition } from './AccordionDef';

@Component({
  components: {
    AccordionButton,
    AccordionAddButton,
    AccordionViewerRow,
    RowMenu,
  },
})
export default class AccordionViewer extends Vue {
  buttonSpace = 0;

  centerX = 0;

  centerY = 0;

  squareSize = 0;

  centerRowWidth = 3;

  sides = ['rightHand', 'leftHand'];

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
    const rows: RowDefinition[] = _.cloneDeep(
      isRightHand ? this.accordion.rightHand : this.accordion.leftHand,
    );

    rows[rowIndex].buttons[buttonIndex] = button;

    this.$vxm.settings.accordion.updateLayout({
      [isRightHand ? 'rightHand' : 'leftHand']: rows,
    });
  }

  setRowOffset(
    isRightHand: boolean,
    rowIndex: number,
    offset: number,
  ) {
    const rows: RowDefinition[] = _.cloneDeep(
      isRightHand ? this.accordion.rightHand : this.accordion.leftHand,
    );

    rows[rowIndex].offset = offset;

    this.$vxm.settings.accordion.updateLayout({
      [isRightHand ? 'rightHand' : 'leftHand']: rows,
    });
  }

  onAddButton(
    isRightHand: boolean,
    rowIndex: number,
    index: number,
  ) {
    const rows: RowDefinition[] = _.cloneDeep(
      isRightHand ? this.accordion.rightHand : this.accordion.leftHand,
    );

    rows[rowIndex].buttons.splice(index, 0, {
      opening: '',
      closing: '',
    });

    this.$vxm.settings.accordion.updateLayout({
      [isRightHand ? 'rightHand' : 'leftHand']: rows,
    });
  }

  onRemoveButton(
    isRightHand: boolean,
    rowIndex: number,
    index: number,
  ) {
    const rows: RowDefinition[] = _.cloneDeep(
      isRightHand ? this.accordion.rightHand : this.accordion.leftHand,
    );

    rows[rowIndex].buttons.splice(index, 1);

    this.$vxm.settings.accordion.updateLayout({
      [isRightHand ? 'rightHand' : 'leftHand']: rows,
    });
  }

  onAddRow(
    isRightHand: boolean,
    rowIndex: number,
  ) {
    const rows: RowDefinition[] = _.cloneDeep(
      isRightHand ? this.accordion.rightHand : this.accordion.leftHand,
    );

    rows.splice(rowIndex, 0, { buttons: [] });

    this.$vxm.settings.accordion.updateLayout({
      [isRightHand ? 'rightHand' : 'leftHand']: rows,
    });
  }

  onRemoveRow(
    isRightHand: boolean,
    rowIndex: number,
  ) {
    const rows: RowDefinition[] = _.cloneDeep(
      isRightHand ? this.accordion.rightHand : this.accordion.leftHand,
    );

    rows.splice(rowIndex, 1);

    this.$vxm.settings.accordion.updateLayout({
      [isRightHand ? 'rightHand' : 'leftHand']: rows,
    });
  }

  getRowY(row: RowDefinition) {
    const offset = this.mirrorView ? (row.offset || 0) : -(row.offset || 0);
    return this.buttonSpace * (
      (this.buttonLength - row.buttons.length - offset)
      / 2
    );
  }

  getRowX(isRightHand: boolean, rowIndex: number) {
    const center = this.centerX;
    const centerOffset = ((this.accordion.rightHand.length - this.accordion.leftHand.length) / 2);
    let rowOffset = (this.centerRowWidth / 2)
    + (isRightHand ? this.accordion.rightHand : this.accordion.leftHand).length
    - rowIndex;

    if (!isRightHand) {
      rowOffset = -rowOffset;
    }

    return center + ((rowOffset - centerOffset) * this.buttonSpace);
  }

  get buttonLength() {
    const editOffset = this.showEditControls ? 3 : 0;

    return Math.max(
      ...this.accordion.rightHand.map((r) => r.buttons.length + Math.abs(r.offset || 0) + editOffset),
      ...this.accordion.leftHand.map((r) => r.buttons.length + Math.abs(r.offset || 0) + editOffset),
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
