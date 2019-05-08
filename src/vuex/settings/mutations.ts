import Vue from 'vue';
import { MutationTree } from 'vuex';
import { SettingsState } from './state';
import services from '@/services/services';

export const mutations: MutationTree<SettingsState> = {
    setMinVol(state, { minVol }) {
        state.minVol = minVol;
        services.$audioContext.pitchAnalyser.MinVol = minVol / 100;
    },
    setSelectedInput(state, { selectedInput }) {
        state.selectedInput = selectedInput;
    },
};
