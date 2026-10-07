import { createRouter, createWebHistory } from 'vue-router'
import {
  isFlagEnabled,
  loadFlags,
  pathToFlagKey,
} from '../services/flags.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/tab-2',
      component: () => import('../views/Tab2View.vue'),
    },
    {
      path: '/tab-3',
      component: () => import('../views/Tab3View.vue'),
    },
    {
      path: '/tab-4',
      component: () => import('../views/Tab4View.vue'),
    },
    {
      path: '/flags',
      component: () => import('../views/FFAdminView.vue'),
    },
    {
      path: '/disabled',
      name: 'tab-disabled',
      component: () => import('../views/TabDisabled.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.name === 'tab-disabled') {
    return true
  }

  const flagKey = pathToFlagKey[to.path]
  if (!flagKey) {
    return true
  }

  await loadFlags()
  if (isFlagEnabled(flagKey)) {
    return true
  }

  return { name: 'tab-disabled' }
})

export default router
