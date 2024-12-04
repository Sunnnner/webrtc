<template>
  <div id="videos">
    <video 
      ref="localVideo"
      class="video-player" 
      id="user-1" 
      autoplay
    />
    <video 
      ref="remoteVideo"
      class="video-player" 
      id="user-2" 
      autoplay
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useWebRTC } from '../composables/rtc'

const localVideo = ref<HTMLVideoElement | null>(null)
const remoteVideo = ref<HTMLVideoElement | null>(null)

const { state, init } = useWebRTC()

watch(() => state.localStream, (stream) => {
  if (localVideo.value && stream) {
    localVideo.value.srcObject = stream
  }
})

watch(() => state.remoteStream, (stream) => {
  if (remoteVideo.value && stream) {
    remoteVideo.value.srcObject = stream
  }
})

onMounted(async () => {
  await init()
})
</script>

<style scoped>
.video-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#videos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2em;
  padding: 1em;
}
</style>