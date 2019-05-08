import { MutationTree } from 'vuex';
import { SettingsState } from './state';

export const mutations: MutationTree<SettingsState> = {
    setMinVol(state, { minVol }) {
        state.minVol = minVol;
    },
    setSelectedInput(state, { selectedInput }) {
        state.selectedInput = selectedInput;
    },
};
