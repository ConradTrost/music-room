<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { getAlbumArtwork } from '@/stores/music'
import { usePlayerStore } from '@/stores/player'
import { faBackward, faForward, faPlay, faStop } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref } from 'vue'

const playbackRate = ref(1)

const playerStore = usePlayerStore()

const speedUp = () => {
  const audioEl = document.getElementById('apple-music-player') as any
  audioEl.playbackRate = playbackRate.value
}
</script>
<template>
  <div id="music-pill">
    <div class="image-wrap">
      <img :src="getAlbumArtwork(playerStore.getNowPlaying.artwork, 120)" />
    </div>
    <div class="info">
      <h4>{{ playerStore.getNowPlaying.name }}</h4>
      <b class="small">{{ playerStore.getNowPlaying.artist }}</b>
      <p>
        {{
          playerStore.isSeeking
            ? playerStore.getCurrentSeekTimeString
            : playerStore.getCurrentTimeString
        }}
        / {{ playerStore.getDurationString }}
      </p>
      <input hidden type="number" v-model="playbackRate" v-on:change="speedUp" />
      <div class="controls">
        <FontAwesomeIcon
          class="fa-icon"
          v-on:click="playerStore.prev"
          :icon="faBackward"
          style="color: #ebebeba3"
        />
        <FontAwesomeIcon
          class="fa-icon fa-icon-center"
          v-if="playerStore.isPlaying"
          v-on:click="playerStore.pause"
          :icon="faStop"
          style="color: #ebebeba3"
        />
        <FontAwesomeIcon
          class="fa-icon fa-icon-center"
          v-if="!playerStore.isPlaying"
          v-on:click="playerStore.play"
          :icon="faPlay"
          style="color: #ebebeba3"
        />
        <FontAwesomeIcon
          class="fa-icon"
          v-on:click="playerStore.next"
          :icon="faForward"
          style="color: #ebebeba3"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* .image-wrap {
  padding: 0.4rem;
} */
/* h4 {
  font-weight: bold;
} */
.image-wrap img {
  max-height: 100%;
}
.info {
  padding-left: 1rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(235, 235, 235, 0.64);
}
button {
  padding: 0;
  margin: 0;
  border: none;
  height: 1rem;
  width: 1rem;
}
.small {
  font-size: 0.8rem;
}
.controls {
  padding-top: 0.4rem;
  width: 50%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.fa-icon {
  height: 1.2rem;
  width: 1.2rem;
}
.fa-icon-center {
  height: 1.5rem;
  width: 1.5rem;
}
.fa-icon:hover {
  cursor: pointer;
  transform: scale(1.08);
  transition: linear 0.1s;
}
#music-pill {
  position: fixed;
  /* display: block; */
  height: 8rem;
  width: 24rem;
  left: 50%;
  transform: translate(-50%, -50%);
  bottom: 0;
  background-color: var(--color-background);
  border: 2px solid rgb(226, 184, 47);
  padding: 0.5rem;
  display: flex;
  justify-content: start;
  border-radius: 7px;
  padding-right: 1.5rem;
}
</style>
