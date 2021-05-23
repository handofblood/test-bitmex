import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'



import config from './config/config.js';
window.env = config;
Vue.prototype.$env = config;
window.config = config;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
