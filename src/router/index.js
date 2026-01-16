import {createRouter, createWebHistory} from 'vue-router'
import BoardView from '../views/BoardView.vue'
import GameView from "@/views/GameView.vue";
import StartView from "@/views/StartView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: StartView,
        },
        {
            path: '/game',
            name: 'game',
            component: GameView,
        },
        {
            path: '/board',
            name: 'board',
            component: BoardView,
        },
    ],
})

export default router
