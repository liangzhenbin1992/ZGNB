import { createRouter, createWebHistory } from 'vue-router'
import KnowledgeBase from '../views/KnowledgeBase.vue'
import Methodology from '../views/Methodology.vue'
import MethodologyDetail from '../views/MethodologyDetail.vue'

const routes = [
  {
    path: '/',
    name: 'KnowledgeBase',
    component: KnowledgeBase
  },
  {
    path: '/methodology',
    name: 'Methodology',
    component: Methodology
  },
  {
    path: '/methodology/detail/:id',
    name: 'MethodologyDetail',
    component: MethodologyDetail,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 