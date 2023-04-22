import { createRouter, createWebHashHistory } from "vue-router";
import DayViewVue from './pages/DayView.vue'
import KidsVue from "./pages/Kids.vue";
import ExportVue from "./pages/Export.vue";
const routes = [

	{ path: '/', component: DayViewVue },
	{ path: '/enfants', component: KidsVue },
	{ path: '/export', component: ExportVue },
]
const router = createRouter({
	history: createWebHashHistory(),
	routes
})
export default router