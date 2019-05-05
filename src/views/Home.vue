<template>
  <v-container fluid grid-list-xl class="home">
    <PitchFinder/>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import PitchFinder from '@/components/PitchFinder.vue';

@Component({
  components: {
    PitchFinder,
  },
})
export default class Home extends Vue {}
</script>
