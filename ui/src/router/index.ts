import { createRouter, createWebHistory } from 'vue-router'
import Lobby from '../components/Lobby.vue'
import VideoChat from '../components/VideoChat.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Lobby',
      component: Lobby
    },
    {
      path: '/room/:roomName',
      name: 'video-chat',
      component: VideoChat
    }
  ]
})

export default router
