<template>
  <div class="sidebar-settings-holder">
    <AccordionLayoutSettings />
    <v-divider />
    <AccordionViewSettings />
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import {
  Component,
} from 'vue-property-decorator';
import AccordionLayoutSettings from './AccordionLayoutSettings.vue';
import AccordionViewSettings from './AccordionViewSettings.vue';

@Component({
  components: {
    AccordionLayoutSettings,
    AccordionViewSettings,
  },
})
export default class AccordionViewSettingsSidebar extends Vue {

}
</script>
<style lang="scss" scoped>
.sidebar-settings-holder {
  padding: 0px 1em;
}
</style>
