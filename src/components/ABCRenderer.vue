<template>
    <div class="abcWrapper">
        <div
            ref="abcOutput"
            class="abcOutput"
            v-on="$listeners" />
    </div>
</template>

<script lang="ts">
import {
    Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import abcjs from 'abcjs';

    @Component
export default class ABCRenderer extends Vue {
        @Prop(String) public readonly abc!: string;

        @Prop({
            type: Object,
            default: () => ({
                responsive: 'resize',
                staffwidth: 150,
                add_classes: true,
            }),
        }) public readonly abcOptions!: any;

        public mounted() {
            this.renderAbc();
        }

        @Watch('abc')
        private renderAbc() {
            abcjs.renderAbc(
                this.$refs.abcOutput,
                this.abc,
                this.abcOptions,
            );
        }
}
</script>

<style lang="scss" scoped>
    .abcWrapper {
        width: 100%;
        height: 400px;
        display: inline-block;
    }

    .abcOutput {
        height: 400px;
    }
</style>
