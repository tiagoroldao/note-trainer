/* eslint-disable import/extensions */
// eslint-disable-next-line import/no-unresolved
import { Vue } from 'vue/types/vue';
import AudioContextProvider from './services/AudioContext';
import { vxm } from './store';

declare module 'vue/types/vue' {
  interface Vue {
    $audioContext: AudioContextProvider;
    $vxm: typeof vxm;
  }
}
