<template>
  <v-dialog
    v-model="dialog"
    scrollable
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition">
    <template v-slot:activator="{ on }">
      <slot :on="on">
        <v-btn
          color="primary"
          dark
          v-on="on">
          Settings
        </v-btn>
      </slot>
    </template>
    <v-card>
      <v-toolbar
        dark
        color="primary"
        class="flex-grow-0">
        <v-btn
          icon
          dark
          @click="dialog = false">
          <v-icon>
            close
          </v-icon>
        </v-btn>
        <v-toolbar-title>
          Settings
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            dark
            text
            @click="dialog = false">
            Close
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-row
          wrap
          align-center
          justify="center">
          <v-col
            cols="10"
            sm="6">
            <settings multiple />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'vue-property-decorator';
import Settings from './Settings.vue';

@Component({
  components: { Settings },
})
export default class SettingsModal extends Vue {
  @Provide() public dialog = false;
}
</script>

<style lang="scss" scoped>
</style>
