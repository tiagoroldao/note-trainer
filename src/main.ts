import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Vuetify from 'vuetify';
import AudioContextProvider from './services/AudioContext';

Vue.use(Vuetify);
import 'vuetify/dist/vuetify.min.css';

Vue.config.productionTip = false;

Vue.prototype.$audioContext = new AudioContextProvider();

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
