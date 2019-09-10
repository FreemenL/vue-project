import Vue from 'vue';
import router from './router';
import ElementUI from 'element-ui';
import App from './App';
import 'element-ui/lib/theme-chalk/index.css';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

Raven
  .config('https://e0b06eb8289b4405a282d660fb78e44a@sentry.io/1722672')
  .addPlugin(RavenVue, Vue)
  .install()

if(process.env.NODE_ENV !== 'development' ){
  Vue.config.errorHandler = function(err, vm, info) {
      Raven.captureException(err)
  }
}
Vue.use(ElementUI);

const app = {
  run(router) {
    new Vue({
      el: '#root',
      router,
      template: '<App/>',
      components: { App },
    });
  },
};

app.run(router);
