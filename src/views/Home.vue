<template>
    <PitchDetector />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import PitchDetector from '@/components/PitchDetector.vue';

@Component({
    components: {
        PitchDetector,
    },
})
export default class Home extends Vue {}
</script>
