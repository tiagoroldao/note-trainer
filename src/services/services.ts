import AudioContextProvider from './AudioContext';

// TODO better dependency injection?

export default {
  $audioContext: new AudioContextProvider(),
};
