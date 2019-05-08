import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import VuexPersistence from 'vuex-persist';
import { RootState } from './vuex/rootState';

const vuexLocal = new VuexPersistence({
    storage: window.localStorage,
});

Vue.use(Vuex);

const options: StoreOptions<RootState> = {
    state: {},
    plugins: [vuexLocal.plugin],
};

export default new Vuex.Store(options);
