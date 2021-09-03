<template>
  <router-view v-slot="{ Component }">
    <transition appear name="slide">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>

</script>

<style lang="scss">
  @import "./assets/style/index.scss";
</style>
