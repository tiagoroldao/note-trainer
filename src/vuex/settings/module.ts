import { Module } from 'vuex';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { RootState } from '../rootState';
import { SettingsState, state } from './state';

export const profile: Module<SettingsState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
