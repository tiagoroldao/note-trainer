<template>
  <div class="accordion-add-button-holder">
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
      class="accordion-add-button"
      color="green lighten-4">
      <v-icon>
        add_circle_outline
      </v-icon>
    </v-btn>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class extends Vue {
  @Prop({ required: true }) size!: number;

  get buttonSize() {
    return Math.floor(this.size * 0.65);
  }

  get fontSize() {
    return Math.floor(this.buttonSize);
  }
}
</script>
<style lang="scss" scoped>
.accordion-add-button-holder{
  display: block;
  height: 0;
  width: 0;

  .accordion-add-button {
    display: block;
  }

  .v-icon {
    font-size: 1em;
    height: 100%;
  }
}
</style>
