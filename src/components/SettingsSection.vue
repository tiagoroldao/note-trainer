<template>
  <div class="form-input-box">
    <div>
      <h3 v-if="title.length">
        {{ title }}
      </h3>
      <p v-if="description.length">
        {{ description }}
      </p>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({})
export default class SettingsSection extends Vue {
  @Prop({ type: String, default: '' }) public title!: string;

  @Prop({ type: String, default: '' }) public description!: string;
}
</script>

<style lang="scss" scoped>
.form-input-box {
  margin: 20px 0px;
}
</style>
