import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import NoteTeacher from './components/NoteTeacher.vue';
import AccordionViewer from './components/accordion/AccordionViewer.vue';
import AccordionViewerSettingsSidebar from './components/accordion/settings/AccordionViewerSettingsSidebar.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'pitchfinder',
      component: Home,
    },
    {
      path: '/teacher',
      name: 'teacher',
      component: NoteTeacher,
    },
    {
      path: '/accordion',
      name: 'accordion',
      component: AccordionViewer,
      components: {
        default: AccordionViewer,
        sidebar: AccordionViewerSettingsSidebar,
      },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
  ],
});
