<template>
    <ABCRenderer
        :abc="abc"
        v-on="$listeners" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import ABCRenderer from '@/components/ABCRenderer.vue';

    @Component({
        components: {
            ABCRenderer,
        },
    })
export default class NoteRenderer extends Vue {
        @Prop({ default: 'x', type: String }) private note!: string;

        private get abc() {
            return `X: 1
L: 1/8
%%stretchlast
[|${this.note}8|]`;
        }
}
</script>

<style scoped>

</style>
