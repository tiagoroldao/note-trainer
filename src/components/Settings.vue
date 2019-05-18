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
                color="primary">
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
                        flat
                        @click="dialog = false">
                        Close
                    </v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <v-card-text>
                <div class="form-section">
                    <h5 class="subheading">
                        General Settings
                    </h5>
                    <SettingsSection>
                        <v-switch
                            class="switch-romanceNotation"
                            label="Use Romance Notation?"
                            :input-value="settings.useRomanceNotes"
                            @change="onChangeUseRomanceNotes" />
                    </SettingsSection>
                    <v-divider />
                </div>
                <div class="form-section">
                    <h5 class="subheading">
                        Audio Recording
                    </h5>
                    <SettingsSection
                        title="Recording device"
                        description="Recording device used for pitch detection.
                            Will be reset if selected device is no longer available.">
                        <v-select
                            :value="settings.selectedInput"
                            :items="devices"
                            attach
                            :item-text="(item, index) => item.label || `microphone ${index + 1}`"
                            item-value="deviceId"
                            label="Please select an input device"
                            @change="(val) => settings.setSelectedInput(val)" />
                    </SettingsSection>
                    <SettingsSection
                        title="Note detection volume"
                        description="Minimum volume at which notes are registered">
                        <v-layout
                            wrap
                            align-center
                            justify-center>
                            <v-flex
                                class="min-vol-slider-wrap">
                                <v-progress-linear
                                    v-model="volume"
                                    height="14" />
                                <v-slider
                                    :value="settings.minVol"
                                    always-dirty
                                    thumb-label
                                    color="rgba(0,0,0,0)"
                                    thumb-color="primary"
                                    track-color="rgba(0,0,0,0)"
                                    class="min-vol-slider"
                                    @change="onChangeVol" />
                            </v-flex>
                            <v-flex
                                shrink
                                style="width: 60px">
                                <v-btn
                                    :color="audio.state == 'running' ? 'error' : 'success'"
                                    @click="toggleStream">
                                    <span v-if="audio.state == 'running'">Stop</span>
                                    <span v-else>Start</span>
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </SettingsSection>
                    <v-divider />
                </div>
                <h5 class="subheading">
                    Teacher Settings
                </h5>
                <SettingsSection
                    title="Note hold time"
                    description="Time a note needs to be held for registering in ms.
                        Shorter times are more responsive, longer times produce less false results.">
                    <v-text-field
                        :value="settings.teacher.noteRegisterTime"
                        class="mt-0"
                        hide-details
                        single-line
                        type="number"
                        @change="(val) => settings.teacher.setNoteRegisterTime(val)" />
                </SettingsSection>
                <SettingsSection
                    title="Possible Notes"
                    description="Notes the teacher may choose from
                        (for diatonic instruments)">
                    <v-layout
                        wrap
                        align-center
                        justify-center>
                        <v-flex
                            v-for="(note, index) in possibleNotes"
                            :key="index"
                            shrink
                            d-flex>
                            <v-switch
                                class="switch-note"
                                :input-value="settings.teacher.notes"
                                :label="toHumanNote(note)"
                                :value="note"
                                @change="onChangeNotes" />
                        </v-flex>
                    </v-layout>
                </SettingsSection>
                <SettingsSection
                    title="Note range"
                    description="Highest and lowest possible notes">
                    <v-layout
                        wrap
                        align-center
                        justify-center>
                        <v-flex
                            xs12
                            sm2>
                            {{ toHumanNote(settings.teacher.noteRange[0]) }}
                        </v-flex>
                        <v-flex
                            xs12
                            sm8>
                            <v-range-slider
                                :value="settings.teacher.noteRange"
                                :max="127"
                                :min="0"
                                @input="setNoteRange" />
                        </v-flex>
                        <v-flex
                            xs12
                            sm2>
                            {{ toHumanNote(settings.teacher.noteRange[1]) }}
                        </v-flex>
                    </v-layout>
                </SettingsSection>
                <v-divider />
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { Note } from 'tonal';
import { Component, Vue, Provide } from 'vue-property-decorator';
import { SettingsModule } from '../vuex/settingsModule';
import { AudioModule } from '@/vuex/audioModule';
import SettingsSection from './SettingsSection.vue';
import { toRomance } from '../helpers/noteHelpers';

@Component({
    components: { SettingsSection },
})
export default class Settings extends Vue {
    private unsubscribers: (() => void)[] = [];

    private settings = SettingsModule.CreateProxy(this.$store, SettingsModule);

    private audio = AudioModule.CreateProxy(this.$store, AudioModule);

    @Provide() public dialog = false;

    @Provide() public volume = 0;

    @Provide() public devices = [] as MediaDeviceInfo[];

    @Provide() public possibleNotes = Note.names(' #');

    onChangeVol(minVol: number) {
        this.settings.setMinVol(minVol);
    }

    onChangeNotes(val: any) {
        this.settings.teacher.setNotes(val);
    }

    onChangeUseRomanceNotes(val: any) {
        this.settings.setUseRomanceNotes(val);
    }

    setNoteRange(val: number[]) {
        this.settings.teacher.setNoteRange(val);
    }

    toHumanNote(_note: number | string) {
        let note = _note;
        if (typeof note === 'number') {
            note = Note.fromMidi(note, true);
        }
        return this.settings.useRomanceNotes ? toRomance(note) : note;
    }

    public toggleStream() {
        if (this.audio.state !== 'running' && this.settings.selectedInput) {
            this.$audioContext.start(this.settings.selectedInput);
        } else {
            this.$audioContext.suspend();
        }
    }

    public mounted() {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            this.devices = devices.filter(d => d.kind === 'audioinput');
        });

        this.unsubscribers = this.unsubscribers.concat([
            this.$audioContext.volumeAnalyser.on('volumeData', (v) => {
                this.volume = v * 100;
            }),
        ]);
    }

    public beforeDestroy() {
        this.unsubscribers.forEach(u => u());
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
    padding: 10px;
  }

  .switch-romanceNotation {
      display: inline-block;
  }
</style>
