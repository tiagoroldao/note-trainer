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
                        Audio Recording
                    </h5>
                    <div class="form-input-box">
                        <v-layout
                            wrap
                            align-center
                            justify-center>
                            <v-flex
                                xs10
                                sm6
                                d-flex>
                                <div>
                                    <h3>
                                        Recording device
                                    </h3>
                                    <p>
                                        Recording device used for pitch detection.<br>
                                        Will be reset if selected device is no longer available.
                                    </p>
                                    <v-select
                                        :value="settings.selectedInput"
                                        :items="devices"
                                        attach
                                        :item-text="(item, index) => item.label || `microphone ${index + 1}`"
                                        item-value="deviceId"
                                        label="Please select an input device"
                                        @change="(val) => settings.setSelectedInput(val)" />
                                </div>
                            </v-flex>
                        </v-layout>
                    </div>
                    <div class="form-input-box">
                        <h3>
                            Note detection volume
                        </h3>
                        <p>
                            Minimum volume at which notes are registered
                        </p>
                        <v-layout
                            wrap
                            align-center
                            justify-center>
                            <v-flex
                                xs10
                                sm6
                                d-flex
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
                        </v-layout>
                    </div>
                    <v-divider />
                </div>
                <h5 class="subheading">
                    Teacher Settings
                </h5>
                <div class="form-input-box">
                    <v-layout
                        wrap
                        align-center
                        justify-center>
                        <v-flex
                            xs10
                            sm6
                            d-flex>
                            <div>
                                <h3>
                                    Note hold time
                                </h3>
                                <p>
                                    Time a note needs to be held for registering in ms.<br>
                                    Shorter times are more responsive, longer times produce less false results.
                                </p>
                                <v-text-field
                                    :value="settings.teacher.noteRegisterTime"
                                    class="mt-0"
                                    hide-details
                                    single-line
                                    type="number"
                                    @change="(val) => settings.teacher.setNoteRegisterTime(val)" />
                            </div>
                        </v-flex>
                    </v-layout>
                </div>
                <div class="form-input-box">
                    <v-layout
                        wrap
                        align-center
                        justify-center>
                        <v-flex
                            xs10
                            sm6
                            d-flex>
                            <div>
                                <h3>
                                    Possible Notes
                                </h3>
                                <p>
                                    Notes the teacher may choose from<br>
                                    (for diatonic instruments)
                                </p>
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
                                            :label="note"
                                            :value="note"
                                            @change="onChangeNotes" />
                                    </v-flex>
                                </v-layout>
                            </div>
                        </v-flex>
                    </v-layout>
                </div>
                <div class="form-input-box">
                    <v-layout
                        wrap
                        align-center
                        justify-center>
                        <v-flex
                            xs10
                            sm6
                            d-flex>
                            <div>
                                <h3>
                                    Possible Notes
                                </h3>
                                <p>
                                    Notes the teacher may choose from<br>
                                    (for diatonic instruments)
                                </p>
                                <v-layout
                                    wrap
                                    align-center
                                    justify-center>
                                    <v-flex

                                        shrink
                                        style="width: 60px">
                                        <v-text-field
                                            :value="settings.teacher.noteRange[0]"
                                            class="mt-0"
                                            hide-details
                                            single-line
                                            type="number"
                                            @input="val => setNoteRange([val, settings.teacher.noteRange[1]])" />
                                    </v-flex>
                                    <v-flex>
                                        <v-range-slider
                                            :value="settings.teacher.noteRange"
                                            :max="127"
                                            :min="0"
                                            @change="setNoteRange" />
                                    </v-flex>
                                    <v-flex
                                        shrink
                                        style="width: 60px">
                                        <v-text-field
                                            :value="settings.teacher.noteRange[1]"
                                            class="mt-0"
                                            hide-details
                                            single-line
                                            type="number"
                                            @input="val => setNoteRange([settings.teacher.noteRange[0], val])" />
                                    </v-flex>
                                </v-layout>
                            </div>
                        </v-flex>
                    </v-layout>
                </div>
                <v-divider />
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { Note } from 'tonal';
import { Component, Vue, Provide } from 'vue-property-decorator';
import { SettingsModule } from '../vuex/settingsModule';

@Component({})
export default class Settings extends Vue {
    private unsubscribers: (() => void)[] = [];

    private settings = SettingsModule.CreateProxy(this.$store, SettingsModule);

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

    setNoteRange(val: number[]) {
        this.settings.teacher.setNoteRange(val);
    }

    public mounted() {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            this.devices = devices.filter(d => d.kind === 'audioinput');
        });

        this.unsubscribers = this.unsubscribers.concat([
            this.$audioContext.volumeAnalyser.onData((v) => {
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

  .form-input-box {
      margin: 20px 0px;
  }

  .switch-note {
    padding: 10px;
  }
</style>
