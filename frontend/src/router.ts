import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from './views/HomeView.vue'
import AboutView from './views/AboutView.vue'
import PrivacyView from './views/PrivacyView.vue'
import TermsView from './views/TermsView.vue'

const routes: RouteRecordRaw[] = [
    { path: '/', name: 'home', component: HomeView, meta: { title: 'Waelio API UI' } },
    { path: '/about', name: 'about', component: AboutView, meta: { title: 'About – Waelio API' } },
    { path: '/privacy', name: 'privacy', component: PrivacyView, meta: { title: 'Privacy – Waelio API' } },
    { path: '/terms', name: 'terms', component: TermsView, meta: { title: 'Terms & Conditions – Waelio API' } },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 }
    },
})

router.afterEach((to) => {
    if (to.meta?.title) {
        document.title = String(to.meta.title)
    }
})

export default router
