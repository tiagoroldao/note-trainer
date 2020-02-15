<template>
  <v-dialog
    v-model="dialog"
    persistent
    v-bind="dialogProps">
    <v-card>
      <v-card-title
        v-if="title"
        class="headline">
        {{ title }}
      </v-card-title>
      <v-card-text>
        {{ text }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          v-for="action in actions"
          :key="action.name"
          :color="action.color"
          @click="doAction(action.name)">
          {{ action.text || action.name }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  Component, Vue, Prop,
} from 'vue-property-decorator';

@Component
export default class SomeComponent extends Vue {
  private promise: Promise<string> | null = null;

  private resolve: Function | null = null;

  dialog = false;

  @Prop({ default: '' }) title!: string;

  @Prop({ default: '' }) text!: string;

  @Prop({ default: () => ({ 'max-width': '290' }) }) dialogProps!: any;

  @Prop({
    default: () => [
      { name: 'cancel', color: 'error' },
      { name: 'ok', text: 'Confirm', color: 'success' },
    ],
  }) actions!: any[];

  doAction(action: string) {
    if (this.resolve) {
      this.resolve(action);
    }
  }

  public popup() {
    if (!this.promise) {
      this.promise = new Promise<string>((resolve) => {
        this.resolve = resolve;
      }).then((result) => {
        this.promise = null;
        this.resolve = null;
        this.dialog = false;

        return result;
      });
    }
    this.dialog = true;

    return this.promise;
  }
}
</script>
