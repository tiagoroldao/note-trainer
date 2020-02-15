<template>
  <div
    class="accordion-row-menu-holder">
    <v-menu
      v-model="showingMenu"
      absolute
      offset-y
      v-bind="$props"
      :close-on-content-click="false">
      <template v-slot:activator="{ on }">
        <v-btn
          text
          icon
          :style="{
            height: buttonSize + 'px',
            width: buttonSize + 'px',
            'margin-left': '-' + (buttonSize / 2) + 'px',
            'margin-top': '-' + (buttonSize / 2) + 'px',
            'font-size': fontSize + 'px',
          }"
          class="accordion-row-menu"
          color="amber lighten-4"
          v-on="on">
          <v-icon>
            arrow_drop_down_circle
          </v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-subheader>
          Row offset
        </v-subheader>
        <v-card-text class="pa-2">
          <v-slider
            :value="row.offset"
            always-dirty
            thumb-label="always"
            :max="6"
            :min="-6"
            :step="0.5"
            class="offset-slider"
            @input="onChangeOffset" />
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { RowDefinition } from '../AccordionDef';

@Component
export default class extends Vue {
  @Prop({ required: true }) size!: number;

  @Prop({ required: true }) row!: RowDefinition;

  showingMenu = false;

  get buttonSize() {
    return Math.floor(this.size * 0.4);
  }

  get fontSize() {
    return Math.floor(this.buttonSize);
  }

  onChangeOffset($event: number) {
    this.$emit('set-row-offset', $event);
  }
}
</script>
<style lang="scss" scoped>
.accordion-row-menu-holder{
  display: block;
  height: 0;
  width: 0;

  .accordion-row-menu {
    display: block;
  }

  .v-icon {
    font-size: 1em;
    height: 100%;
  }
}

.offset-slider {
  margin-top: 0.5em;
  width: 200px;
}
</style>
