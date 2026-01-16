<script setup>
import {onMounted, ref} from "vue";
import play from '../assets/icons/start-button.png'
import {useRouter} from "vue-router";
import {gameInfo} from "@/global.js";
import Modal from "@/components/Modal.vue";

const router = useRouter();
const modes = [
  'manual',
  'microphone'
];
const modeIndex = ref(0);
const errorMessage = ref('');

function handleSubmit() {
  errorMessage.value = '';
  if (gameInfo.username.length < 6) {
    errorMessage.value = 'Usuário deve ter mais de 6 caracteres';
    return null;
  }
  router.push({name: 'game', query: {mode: modes[modeIndex.value]}})
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <modal>
      <h2>Insira o seu username para continuar</h2>
      <div>
        <input type="text" v-model.trim="gameInfo.username" required minlength="6">
        <p class="error-message">{{ errorMessage }}</p>
      </div>
    </modal>
    <div class="center container-play">
      <button class="btn-play">
        <img :src="play" alt="press to play">
      </button>
    </div>
  </form>
  <div class="center">
    <p class="options-message">Selecione a configuração de jogo</p>
  </div>
  <div class="center">
    <button class="btn-options" :class="[modeIndex === 0 && 'btn-selected']" @click="modeIndex = 0">
      <img src="../assets/icons/keybord.png" alt="Press to toggle to keyboard commands">
    </button>
    <button class="btn-options" :class="[modeIndex === 1 && 'btn-selected']" @click="modeIndex = 1">
      <img src="../assets/icons/microphone.png" alt="Press to toggle to microphone commands">
    </button>
  </div>
</template>

<style scoped>
form {
  padding-top: 3rem;
}

input {
  width: 100%;
  border: 2px dashed black;
  padding: 1rem .5rem;
}

.container-play {
  margin: .5rem auto;
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

.btn-options {
  width: 50px;
  aspect-ratio: 1;
}

.btn-selected {
  border: 2px dotted white;
}

.btn-options img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.options-message {
  margin: 1rem auto;
}

.error-message {
  color: red;
}
</style>