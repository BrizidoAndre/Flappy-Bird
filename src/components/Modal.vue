<template>
  <div class="modal">
    <slot/>
  </div>
</template>

<style scoped>
.modal {
  margin: auto;
  width: min(90%, 720px);
  background: rgba(20, 20, 20, .3);
  border: 3px dashed white;
  border-radius: .5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  gap: 4rem;
}
</style>