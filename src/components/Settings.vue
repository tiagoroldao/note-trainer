<template>
  <v-expansion-panels
    accordion
    :multiple="multiple"
    focusable
    :flat="flat"
    tile>
    <v-expansion-panel>
      <v-expansion-panel-header>
        General Settings
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <SettingsSection>
          <v-switch
            class="switch-romanceNotation"
            label="Use Romance Notation?"
            :input-value="$vxm.settings.useRomanceNotes"
            @change="onChangeUseRomanceNotes" />
        </SettingsSection>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-expansion-panel>
      <v-expansion-panel-header>
        Audio Recording
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <SettingsSection
          title="Recording device"
          description="Recording device used for pitch detection.
                            Will be reset if selected device is no longer available.">
          <v-select
            :value="$vxm.settings.selectedInput"
            :items="devices"
            attach
            :item-text="(item, index) => item.label || `microphone ${index + 1}`"
            item-value="deviceId"
            label="Please select an input device"
            @change="(val) => $vxm.settings.setSelectedInput(val)" />
        </SettingsSection>
        <SettingsSection
          title="Note detection volume"
          description="Minimum volume at which notes are registered">
          <v-row
            wrap
            align-center
            justify="center">
            <v-col class="min-vol-slider-wrap">
              <v-progress-linear
                v-model="volume"
                height="14" />
              <v-slider
                :value="$vxm.settings.minVol"
                always-dirty
                thumb-label
                color="rgba(0,0,0,0)"
                thumb-color="primary"
                track-color="rgba(0,0,0,0)"
                class="min-vol-slider"
                @change="onChangeVol" />
            </v-col>
            <v-col
              shrink
              style="width: 60px">
              <v-btn
                :color="$vxm.audio.state == 'running' ? 'error' : 'success'"
                @click="toggleStream">
                <span v-if="$vxm.audio.state == 'running'">Stop</span>
                <span v-else>Start</span>
              </v-btn>
            </v-col>
          </v-row>
        </SettingsSection>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-expansion-panel>
      <v-expansion-panel-header>
        Teacher Settings
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <SettingsSection
          title="Note hold time"
          description="Time a note needs to be held for registering in ms.
                        Shorter times are more responsive, longer times produce less false results.">
          <v-text-field
            :value="$vxm.settings.teacher.noteRegisterTime"
            class="mt-0"
            hide-details
            single-line
            type="number"
            @change="(val) => $vxm.settings.teacher.setNoteRegisterTime(val)" />
        </SettingsSection>
        <SettingsSection
          title="Possible Notes"
          description="Notes the teacher may choose from
                        (for diatonic instruments)">
          <v-row
            wrap
            align-center
            no-gutters
            justify="center">
            <v-col
              v-for="(note, index) in possibleNotes"
              :key="index"
              shrink>
              <v-switch
                class="switch-note"
                :input-value="$vxm.settings.teacher.notes"
                :label="toHumanNote(note)"
                :value="note"
                @change="onChangeNotes" />
            </v-col>
          </v-row>
        </SettingsSection>
        <SettingsSection
          title="Note range"
          description="Highest and lowest possible notes">
          <v-row
            wrap
            align-center
            justify="center">
            <v-col
              cols="10"
              sm="2">
              {{ toHumanNote($vxm.settings.teacher.noteRange[0]) }}
            </v-col>
            <v-col
              cols="10"
              sm="8">
              <v-range-slider
                :value="$vxm.settings.teacher.noteRange"
                :max="127"
                :min="0"
                @input="setNoteRange" />
            </v-col>
            <v-col
              cols="10"
              sm="2">
              {{ toHumanNote($vxm.settings.teacher.noteRange[1]) }}
            </v-col>
          </v-row>
        </SettingsSection>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { Range } from '@tonaljs/modules';
import {
  Component, Vue, Provide, Prop,
} from 'vue-property-decorator';
import SettingsSection from './SettingsSection.vue';
import { toHumanNote } from '../helpers/noteHelpers';

@Component({
  components: { SettingsSection },
})
export default class Settings extends Vue {
  private unsubscribers: (() => void)[] = [];

  @Prop({ default: false }) multiple!: boolean;

  @Prop({ default: false }) flat!: boolean;

  @Provide() public volume = 0;

  @Provide() public devices = [] as MediaDeviceInfo[];

  @Provide() public possibleNotes = Range.chromatic(['C1', 'B1'], { sharps: true, pitchClass: true });

  onChangeVol(minVol: number) {
    this.$vxm.settings.setMinVol(minVol);
  }

  onChangeNotes(val: any) {
    this.$vxm.settings.teacher.setNotes(val);
  }

  onChangeUseRomanceNotes(val: any) {
    this.$vxm.settings.setUseRomanceNotes(val);
  }

  setNoteRange(val: number[]) {
    this.$vxm.settings.teacher.setNoteRange(val);
  }

  toHumanNote(_note: number | string) {
    return toHumanNote(_note, { useRomanceNotes: this.$vxm.settings.useRomanceNotes, hideOctave: false });
  }

  public toggleStream() {
    if (
      this.$vxm.audio.state !== 'running'
      && this.$vxm.settings.selectedInput
    ) {
      this.$audioContext.start(this.$vxm.settings.selectedInput);
    } else {
      this.$audioContext.suspend();
    }
  }

  public mounted() {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      this.devices = devices.filter((d) => d.kind === 'audioinput');
    });

    this.unsubscribers = this.unsubscribers.concat([
      this.$audioContext.volumeAnalyser.on('volumeData', (v) => {
        this.volume = v * 100;
      }),
    ]);
  }

  public beforeDestroy() {
    this.unsubscribers.forEach((u) => u());
  }
}
</script>

<style lang="scss" scoped>
.min-vol-slider-wrap {
  position: relative;

  .min-vol-slider {
    position: absolute;
    right: 0;
    left: 0;
    top: 5px;
    margin: 0;
    z-index: 1;
  }
}

.volume-action-wrapper {
  width: 100%;
  overflow: visible;
  padding: 0 2em;
}

/deep/ .v-progress-linear__bar__determinate {
  transition: none;
}

.subheading {
  margin-bottom: 20px;
  margin-top: 10px;
}

.form-section {
  margin-top: 10px;
  margin-bottom: 20px;
}

.switch-note {
  padding: 0px;
  margin-top: 0;
}

.switch-romanceNotation {
  display: inline-block;
}
</style>
