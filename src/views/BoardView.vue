<script setup>
import {gameInfo} from "@/global.js";
import play from "@/assets/icons/restart-button.png";
import {onActivated, onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {storage} from "@/utils.js";
import Modal from "@/components/Modal.vue";

const points = ref([]);
const route = useRoute();

function getPoints() {
  const lastPoints = route.query.points;
  let storagePoints = storage.get(storage.points, '[]');
  let index = storagePoints.findIndex(point => point.username === gameInfo.username);
  if ((!(index + 1))) {
    storagePoints.push({
      username: gameInfo.username,
      max: lastPoints,
      last: lastPoints
    })
  } else {
    storagePoints[index].last = lastPoints;
    storagePoints[index].max = Math.max(lastPoints, storagePoints[index].max);
  }
  storagePoints = storagePoints.filter(storage => storage.username !== '');
  storagePoints.sort((a, b) => b.max - a.max);
  storage.set(storage.points, storagePoints)
  console.table(storagePoints);
  points.value = storagePoints;
}

onActivated(() => {
  getPoints()
})
</script>

<template>
  <div class="pt"></div>
  <modal class="max-modal">
    <h2>Tabela de pontuação</h2>
    <table>
      <thead>
      <tr>
        <th>Username</th>
        <th>Melhor pontuação</th>
        <th>Última pontuação</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="point in points">
        <td>{{ point.username }}</td>
        <td>{{ point.max }}</td>
        <td>{{ point.last }}</td>
      </tr>
      </tbody>
    </table>
  </modal>
  <div class="center container-play">
    <router-link to="/" class="btn-play">
      <img :src="play" alt="press to play">
    </router-link>
  </div>
</template>

<style scoped>
.pt{
  padding-top: 2rem;
}
.max-modal {
  height: 60vh;
  justify-content: flex-start;
  margin-bottom: 2rem;
}

button {
  background: transparent;
  border: none;
  cursor: pointer;
}

.btn-play {
  width: 150px;
  height: 80px;
}

.btn-play img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.center {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.btn-options img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>