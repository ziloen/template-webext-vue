<script setup lang="ts">
import { storageDemo } from '~/logic/storage'
import iconSrc from "~/assets/icon.svg"

</script>

<template>
  <main class="px-4 py-10 text-center text-gray-700 dark:text-gray-200">
    <img :src="iconSrc" class="icon-btn mx-2 text-2xl" alt="extension icon" />
    <div>Options</div>

    <input v-model="storageDemo" class="border border-gray-400 rounded px-2 py-1 mt-2" />

    <div class="mt-4 bg-red text-blue">
      Powered by Vite <pixelarticons-zap class="align-middle inline-block" />
    </div>
  </main>
</template>
