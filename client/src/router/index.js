import { createRouter, createWebHistory } from 'vue-router'
import KnowledgeBase from '../views/KnowledgeBase.vue'
import Methodology from '../views/Methodology.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 