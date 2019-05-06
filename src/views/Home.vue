<template>
  <PitchFinder />
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
