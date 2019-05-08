import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import VuexPersistence from 'vuex-persist';
import { RootState } from './vuex/rootState';
import { settings } from './vuex/settings/module';

const vuexLocal = new VuexPersistence({
    storage: window.localStorage,
});

Vue.use(Vuex);

const options: StoreOptions<RootState> = {
    state: {},
    modules: {
        settings,
    },
    plugins: [vuexLocal.plugin],
};

export default new Vuex.Store(options);
