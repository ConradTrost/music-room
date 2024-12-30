<script setup lang="ts">
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref } from 'vue'

export type Music = {
  id: string
  title: string
  artist: string
  imageUrl: string
  kind: string
}

const props = defineProps<{ header: string; content: Music[] }>()

type EmitType = {
  id: string
  kind: string
}

const emit = defineEmits<{
  (e: 'play', content: EmitType): void
}>()

const currentScroll = ref(0)
const currentIndex = ref(0)
const itemsToScroll = 5

const getGridItemWidth = (): number => {
  const firstItem = document.querySelector('.grid-item') as HTMLElement
  return firstItem ? firstItem.offsetWidth + 16 : 0
}

const scrollNext = () => {
  const itemWidth = getGridItemWidth()
  currentIndex.value += itemsToScroll
  currentScroll.value += itemsToScroll * itemWidth // Move to the next 5 items
}
const scrollPrev = () => {
  const itemWidth = getGridItemWidth()
  currentIndex.value = Math.max(0, currentIndex.value - itemsToScroll)
  currentScroll.value = Math.max(0, currentScroll.value - itemsToScroll * itemWidth) // Move back 5 items, not below 0
}
</script>

<template>
  <div class="outer-wrapper">
    <h4>{{ props.header }}</h4>
    <div class="scrollable-container">
      <div class="scrollable-grid" :style="{ transform: 'translateX(-' + currentScroll + 'px)' }">
        <div v-for="(music, index) in props.content" :key="index" class="grid-item">
          <img @click="emit('play', { id: music.id, kind: music.kind })" :src="music.imageUrl" />
          <p class="title">{{ music.title }}</p>
          <p class="artist">{{ music.artist || '&nbsp;' }}</p>
        </div>
      </div>
    </div>
    <FontAwesomeIcon
      id="prev"
      @click="scrollPrev()"
      size="2xl"
      class="fa-icon scroller"
      v-show="currentIndex > 0"
      :icon="faChevronLeft"
      style="color: #ebebeba3"
    />
    <FontAwesomeIcon
      id="next"
      @click="scrollNext()"
      size="2xl"
      class="fa-icon scroller"
      v-show="content.length >= currentIndex + 6"
      :icon="faChevronRight"
      style="color: #ebebeba3"
    />
  </div>
</template>

<style scoped>
.outer-wrapper {
  position: relative;
  padding: 0 4rem;
  margin: 2rem 0;
}
.outer-wrapper h4 {
  font-weight: 600;
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}
.scroller {
  position: absolute;
  top: calc(50% - 1rem);
  cursor: pointer;
  display: none;
}
.outer-wrapper:hover .scroller {
  display: block;
}
.scroller:hover {
  transform: scale(1.1);
  transition: linear 0.2s;
}
#prev {
  left: 1rem;
}
#next {
  right: 1rem;
}
.scrollable-container {
  width: 100%;
  overflow-x: hidden;
}
.scrollable-grid {
  display: flex;
  gap: 1rem;
  transition: transform 0.3s ease-in-out;
}
.grid-item {
  width: calc(20% - (1rem * 4 / 5));
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: end;
  aspect-ratio: 1;
  object-fit: contain;
}
.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 0.3125rem;
}
.grid-item img:hover {
  cursor: pointer;
  transform: scale(1.005);
}
.grid-item .title,
.grid-item .artist {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0;
  margin: 0;
}
.grid-item .title {
  padding-top: 0.25rem;
  font-weight: 600;
}
.grid-item .artist {
  color: #ebebeba3;
  line-height: 1;
}
</style>
