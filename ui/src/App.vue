<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>

  <RouterView />
</template>

<style scoped>
.wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  /* 添加响应式设计 */
  @media (max-width: 768px) {
    padding: 1rem;
  }
}

nav {
  padding: 1rem 0;
  /* 添加底部边框 */
  border-bottom: 1px solid #ddd;
}

nav a {
  margin-right: 1rem;
  text-decoration: none;
  color: #333;
  /* 添加过渡效果 */
  transition: color 0.3s ease;
}

nav a.router-link-active {
  color: #42b983;
  /* 添加字体加粗 */
  font-weight: bold;
}
</style>