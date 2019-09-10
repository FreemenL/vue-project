import Vue from 'vue';
import VueRouter from 'vue-router';
import loadChildRoutes from '@page/load-child-routes.js'

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    ...loadChildRoutes
  ],
});
