import Vue from 'vue';
import Vuetify from 'vuetify';
import App from './App.vue';
import router from './router';
import store from './store';
import AudioContextProvider from './services/AudioContext';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

Vue.config.productionTip = false;

Vue.prototype.$audioContext = new AudioContextProvider();

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
