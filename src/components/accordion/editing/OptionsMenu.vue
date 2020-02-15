<template>
  <v-menu
    v-model="showingMenu"
    absolute
    offset-y
    v-bind="$props"
    :close-on-content-click="false"
    style="max-width: 600px">
    <template v-slot:activator="{ on }">
      <slot
        name="activator"
        :on="on" />
    </template>
    <v-list>
      <v-list-item
        v-for="(item, i) in items"
        :key="i"
        @click="onItemClick(item)">
        <v-list-item-title>
          {{ item.title }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import {
  Component, Vue, Prop,
} from 'vue-property-decorator';

@Component
export default class NoteChooserMenu extends Vue {
  @Prop({ required: true }) items!: {name: string, title: string}[];

  showingMenu = false;

  onItemClick($event: any, close = true) {
    this.$emit('action', $event.name);
    if (close) {
      this.showingMenu = false;
    }
  }
}
</script>
