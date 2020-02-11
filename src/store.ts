import Vue from 'vue';
import Vuex, { StoreOptions, Store } from 'vuex';
import VuexPersistence from 'vuex-persist';
import { extractVuexModule, createProxy } from "vuex-class-component";
import { SettingsModule } from './vuex/settingsModule';
import { AudioModule } from './vuex/audioModule';

Vue.use(Vuex);

const vuexPersist = new VuexPersistence({
    strictMode: true,
    storage: window.localStorage,
});

const vuexPersistEmitter = () => (store: Store<any>) => {
    store.subscribe((mutation) => {
        if (mutation.type === 'RESTORE_MUTATION') {
            // eslint-disable-next-line no-underscore-dangle
            const setupActions = Object.keys((store as any)._actions)
                .filter(k => k.endsWith('/onSetup'));
            for (let i = 0; i < setupActions.length; i += 1) {
                store.dispatch(setupActions[i]);
            }
        }
    });
};

const options: StoreOptions<any> = {
    modules: {
        ...extractVuexModule(SettingsModule),
        ...extractVuexModule(AudioModule),
    },
    mutations: {
        RESTORE_MUTATION: vuexPersist.RESTORE_MUTATION,
    },
    plugins: [vuexPersistEmitter(), vuexPersist.plugin],
};

export const store = new Vuex.Store(options)

export const vxm = {
  settings: createProxy( store, SettingsModule ),
  audio: createProxy( store, AudioModule ),
}
