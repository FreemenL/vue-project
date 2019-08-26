import Vue from 'vue';
import router from './router';
import ElementUI from 'element-ui';
import App from './App';
import 'element-ui/lib/theme-chalk/index.css';

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
