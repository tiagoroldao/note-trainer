import Vue from 'vue';
import AudioContextProvider from './services/AudioContext';

declare module 'vue/types/vue' {
  interface Vue {
    $audioContext: AudioContextProvider;
  }
}
