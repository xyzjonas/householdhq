<template>
  <div class="plate">
    <span class="band flex flex-col items-center justify-center">
      <i class="i-simple-icons-europeanunion text-white translate-y-[3px]"></i>
      <span class="text-[0.4rem] text-white line-height-snug">CZ</span>
    </span>
    <span class="px-3">
      <span class="value uppercase text-black">{{ value }}</span>
    </span>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  value: string;
}>();
</script>

<style scoped lang="scss">
.plate {
  display: inline-flex;
  align-items: center;
  background-color: white;
  border: 2px solid gray;
  border-radius: 5px;
  overflow: hidden;
}

.band {
  width: 24px;
  height: 100%;
  background-color: #2a54a1;
  padding-block: 3px;
}

i {
  height: 10px;
  color: yellow;
  margin-bottom: 3px;
}
</style>
