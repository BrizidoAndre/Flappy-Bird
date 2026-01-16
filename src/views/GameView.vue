<script setup>
import {computed, onActivated, onDeactivated, onMounted, ref, useTemplateRef, watch} from "vue";
import manual from '../assets/icons/keybord.png';
import mic from '../assets/icons/microphone.png';
import {useRoute, useRouter} from "vue-router";
import {Entity, useBird} from "@/global.js";
import audioPoint from '../assets/sounds/point.wav';
import audioHit from '../assets/sounds/hit.wav';
import audioFlap from '../assets/sounds/flappy_whoosh-43099.mp3';
import pipe from '../assets/icons/pipe-green.png';
import pipe_reversed from '../assets/icons/pipe-green-reversed.png';
import {getRandomInt} from "@/utils.js";

const route = useRoute();
const router = useRouter();
const hitSound = useTemplateRef('hitAudioRef');
const pointSound = useTemplateRef('pointsAudioRef');
const flapSound = useTemplateRef('flapAudioRef');
// canvas info
const canvasRef = useTemplateRef('canvasRef');
let ctx;
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
let micInterval;
let mediaStream = null;
let audioContext = null;
let audioAvg = window.innerHeight / 2;
const points = ref(0);
const modeImage = computed(() => {
  return route.query.mode === 'microphone' ? mic : manual;
})
const {currentBird, generateNewBird} = useBird();
const gameConfig = {
  JUMP_INTENSITY: 10,
  VELOCITY: 1,
  GRAVITY_SOUND: 10,
  MAX_NUMBER_OF_PIPES: 50,
}
let pipeImageTag = new Image();
pipeImageTag.src = pipe;
let pipeImageTagReversed = new Image();
pipeImageTagReversed.src = pipe_reversed;
/**
 *
 * @type {[{rotated: boolean, width: number, height: number, y: number, x: number, readonly topHitbox: number, readonly bottomHitbox: *, readonly leftHitBox: number, readonly rightHitBox: *},{rotated: boolean, width: number, height: number, y: number, x: number, readonly topHitbox: number, readonly bottomHitbox: *, readonly leftHitBox: number, readonly rightHitBox: *}]}
 */
const pipeEntities = [];
const maxNumberOfPipes = 10;
let birdImageTag = new Image();
const birdEntity = new Entity(50, 40, 20, 250, {gravity: 1.5})
let gameOn = false;

function pressKey(ev) {
  if (ev.key.toLowerCase() === 'w' || ev.key.toLowerCase() === ' ' || ev.key === 'ArrowUp') {
    birdUp()
  }
}

async function getAudio() {
  const constraints = {audio: true};
  mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
  audioContext = new window.AudioContext();
  const mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);

  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  mediaStreamSource.connect(analyser);

  micInterval = setInterval(() => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    let soma = 0;
    for (let i = 0; i < dataArray.length; i++) {
      soma += dataArray[i];
    }
    const media = soma / bufferLength;
    audioAvg = Math.max((audioAvg + gameConfig.GRAVITY_SOUND) - (media / 3), 0);
  }, 20)
}

function renderControls() {
  if (route.query.mode === 'microphone') {
    getAudio();
  } else {
    window.addEventListener('click', birdUp)
    window.addEventListener('keydown', pressKey);
  }
}

function derenderControls() {
  clearInterval(micInterval);
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  window.removeEventListener('click', birdUp);
  window.removeEventListener('keydown', pressKey);
}

function jump(jumpValue) {
  requestAnimationFrame(() => {
    birdEntity.y -= jumpValue;
    if (jumpValue > 0) {
      jump(jumpValue - .25);
    }
  })
}

/**
 * Making the bird jump on the screen
 */
function birdUp() {
  jump(gameConfig.JUMP_INTENSITY)
  // Clone the audio so multiple jumps can play at once
  const soundClone = flapSound.value.cloneNode();
  soundClone.volume = 0.5; // Optional: lower volume for repetitive sounds
  soundClone.play();
}

function startCanvas() {
  if (!canvasRef.value) return;
  ctx = canvasRef.value.getContext('2d')
  canvasRef.value.width = innerWidth;
  canvasRef.value.height = innerHeight;
}

function renderImages() {
  birdImageTag.src = currentBird.value;
  birdImageTag.onload = () => drawBird();
}

function updateBirdTag(imagePath) {
  birdImageTag.src = imagePath;
}

function drawBird() {
  ctx.drawImage(birdImageTag, birdEntity.x, birdEntity.y, birdEntity.width, birdEntity.height);
}

function createPipes() {
  pipeEntities.splice(0, pipeEntities.length);
  for (let i = 0; i < gameConfig.MAX_NUMBER_OF_PIPES; i++) {
    createNewColumnOfPipes(i);
  }
}

function drawPipes() {
  pipeEntities.forEach(entity => {
    if (entity.rotated) {
      ctx.drawImage(pipeImageTagReversed, entity.x, entity.y, entity.width, entity.height);
    } else {
      ctx.drawImage(pipeImageTag, entity.x, entity.y, entity.width, entity.height);
    }
  })
}

function createNewColumnOfPipes(multiplier) {
  let newPipeEntity = new Entity(80, 850, getRandomInt(255, 590), 850 + (multiplier * 400), {rotated: false,});
  pipeEntities.push(newPipeEntity.clone())
  newPipeEntity.rotated = true
  newPipeEntity.y -= 1100;
  pipeEntities.push(newPipeEntity.clone());
}

function movePipes() {
  for (let i = 0; i < pipeEntities.length; i++) {
    pipeEntities[i].x -= 2;
  }
  if (pipeEntities[0].rightHitBox < 0) {
    pipeEntities.shift();
    pipeEntities.shift();
    points.value++;
    createNewColumnOfPipes(gameConfig.MAX_NUMBER_OF_PIPES);
  }
}

function moveBird(value) {
  if (route.query.mode === 'microphone') {
    birdEntity.y = audioAvg;
  } else {
    birdEntity.y = Math.max(0, birdEntity.y - value);
  }
}

function checkIfWasHit() {
  if (birdEntity.bottomHitbox >= innerHeight) {
    gameOver();
    return null;
  }
  pipeEntities.forEach(entity => {
    if (
        entity.leftHitBox < birdEntity.rightHitBox &&
        entity.rightHitBox > birdEntity.leftHitBox &&
        entity.topHitbox < birdEntity.bottomHitbox &&
        entity.bottomHitbox > birdEntity.topHitbox
    ) {
      gameOver();
    }
  })
}

watch(currentBird, value => {
  updateBirdTag(value);
})

function gameOver() {
  if (hitSound.value) {
    hitSound.value.currentTime = 0;
    hitSound.value.play();
  }
  gameOn = false;

  setTimeout(() => {
    generateNewBird();
    router.push({name: 'board', query: {points: points.value}});
  }, 500)
}

function nextTick() {
  requestAnimationFrame(() => {
    ctx.clearRect(0, 0, windowWidth, windowHeight);
    moveBird(-birdEntity.gravity);
    drawBird();
    movePipes()
    drawPipes();
    checkIfWasHit();
    if (gameOn) {
      nextTick();
    }
  })
}

function gameStart() {
  points.value = 0;
  gameOn = true;
  birdEntity.y = 0;
  audioAvg = windowHeight / 2;
  createPipes();
  nextTick();
}

onActivated(() => {
  gameStart();
  renderControls();
});
onDeactivated(() => {
  derenderControls();
})

onMounted(() => {
  startCanvas();
  renderImages();
})
</script>
<template>
  <audio :src="audioFlap" ref="flapAudioRef"></audio>
  <audio :src="audioPoint" ref="pointsAudioRef"></audio>
  <audio :src="audioHit" ref="hitAudioRef"></audio>
  <p class="points">{{ points }}</p>
  <canvas ref="canvasRef">

  </canvas>
  <img :src="modeImage" alt="The current game mode" class="mode">
</template>

<style>
.points {
  position: absolute;
  top: 10%;
  left: 5%;
  font-size: 2rem;
}

.mode {
  width: 100px;
  position: absolute;
  bottom: 10%;
  left: 5%;
}

canvas {
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 9;
}
</style>