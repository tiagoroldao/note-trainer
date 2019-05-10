import 'vuetify/dist/vuetify.min.css';
import Vue from 'vue';
import Vuetify from 'vuetify';
import App from './App.vue';
import router from './router';
import store from './store';
import services from './services/services';

Vue.use(Vuetify);

Vue.config.productionTip = false;

Vue.prototype.$audioContext = services.$audioContext;

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
