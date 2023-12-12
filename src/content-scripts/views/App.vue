<script setup lang="ts">
import "~/styles"

import { useToggle } from '@vueuse/core'


const [show, toggle] = useToggle(false)
</script>

<template>
  <div class="fixed right-0 bottom-0 m-5 z-100 flex items-end font-sans select-none leading-1em">
    <div
      class="bg-white text-gray-800 rounded-lg shadow w-max h-min px-4 py-2 my-auto mr-2 transition-opacity duration-300"
      :class="show ? 'opacity-100' : 'opacity-0'">
      <h1 class="text-lg">
        Vitesse WebExt
      </h1>
    </div>
    <div class="flex w-10 h-10 rounded-full shadow cursor-pointer bg-teal-600 hover:bg-teal-700" @click="toggle()">
      <pixelarticons-power class="block m-auto text-white text-lg" />
    </div>
  </div>
</template>
