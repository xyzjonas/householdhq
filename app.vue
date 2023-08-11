<template>
<NuxtLayout>
    <NuxtPage />
</NuxtLayout>
</template>
<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s;
}
.slide-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

body {
    background-image: url('@/assets/blurry-gradient-haikei.svg');
    backdrop-filter: blur(7px);
    background-repeat: repeat;
    background-position: center;
    background-position-x: center;
    overflow: scroll;
}

</style>
