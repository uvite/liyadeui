<template>
<!--   <i-frame v-model:src="url"></i-frame>-->
  <div></div>
</template>

<script setup>
import iFrame from '@/components/iFrame'

//const url = ref(import.meta.env.VITE_APP_BASE_API + "/swagger-ui/index.html")
const url = ref(import.meta.env.VITE_APP_BASE_API + "/doc.html")

window.open(url.value);
</script>
