<script setup lang="ts">
import { storageDemo } from '~/logic/storage'
import * as browser from "webextension-polyfill"
// import Logo from "~/components/Logo.vue"
// import SharedSubtitle from "~/components/SharedSubtitle.vue"

function openOptionsPage() {
  browser.runtime.openOptionsPage()
}
</script>

<template>
  <main class="w-[300px] px-4 py-5 text-center text-gray-700">
    <!-- <Logo /> -->
    <div>Popup</div>
    <!-- <SharedSubtitle /> -->

    <button class="btn mt-2" @click="openOptionsPage">
      Open Options
    </button>
    <div class="mt-2">
      <span class="opacity-50">Storage:</span> {{ storageDemo }}
    </div>
  </main>
</template>
