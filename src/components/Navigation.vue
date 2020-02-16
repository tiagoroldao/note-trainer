<template>
  <v-list dense>
    <div
      class="close-button"
      @click="$emit('close')">
      <v-icon>
        close
      </v-icon>
    </div>
    <v-list-item two-line>
      <v-list-item-content>
        <v-list-item-subtitle>
          Helper tools for diatonic accordion players
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-divider />

    <v-list-item-group>
      <v-list-item
        v-for="(item, i) in links"
        :key="i"
        :to="item.to"
        link>
        <v-list-item-content>
          <v-list-item-title v-text="item.text" />
        </v-list-item-content>
      </v-list-item>
    </v-list-item-group>
    <v-divider class="py-1" />
    <slot />
  </v-list>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Settings from './Settings.vue';

@Component({
  components: {
    Settings,
  },
})
export default class Home extends Vue {
  links = [
    { to: '/', text: 'Pitch Finder' },
    { to: '/teacher', text: 'Teacher' },
    { to: '/accordion', text: 'Accordion [Work in progress!]' },
    { to: '/about', text: 'About' },
  ];
}
</script>

<style lang="scss" scoped>
.settings-holder /deep/ {
    > div {
    padding: 0;
  }
}
/deep/ .v-navigation-drawer__border {
  z-index: 1;
}

.close-button {
  position: absolute;
  z-index: 1;
  background: white;
  right: 0;
  top: 0;
  padding: 0.5em;
  border-left: 2px solid #ccc;
  border-bottom: 2px solid #ccc;
  border-bottom-left-radius: 1.5em;
  cursor: pointer;
}
</style>
