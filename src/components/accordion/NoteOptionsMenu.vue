<template>
  <v-menu
    v-model="showingMenu"
    absolute
    offset-y
    :position-x="x"
    :position-y="y"
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
  Component, Vue,
} from 'vue-property-decorator';

@Component
export default class NoteChooserMenu extends Vue {
  private items = [
    { title: 'do a' },
    { title: 'do b' },
    { title: 'do c' },
    { title: 'do d' },
  ];

  showingMenu = false;

  x = 0;

  y = 0;

  show(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.showingMenu = true;
  }

  hide() {
    this.showingMenu = false;
  }

  onItemClick($event: any) {
    this.$emit('action', $event);
    this.showingMenu = false;
  }
}
</script>
