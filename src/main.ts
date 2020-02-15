import 'vuetify/dist/vuetify.min.css';
import Vue from 'vue';
import Vuetify from 'vuetify';
import App from './App.vue';
import router from './router';
import { store, vxm } from './store';
import services from './services/services';

Vue.use(Vuetify);

Vue.config.productionTip = false;

Vue.prototype.$audioContext = services.$audioContext;
Vue.prototype.$vxm = vxm;

new Vue({
  router,
  store,
  vuetify: new Vuetify({}),
  render: (h) => h(App),
}).$mount('#app');
