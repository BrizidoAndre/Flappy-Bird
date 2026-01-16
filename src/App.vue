<script setup>
import {RouterView} from 'vue-router'
import {onMounted} from "vue";
</script>

<template>
  <main>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component"/>
      </keep-alive>
    </router-view>
  </main>
</template>
<style scoped>
</style>