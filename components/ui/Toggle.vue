<template>
  <div class="row-simple">
      <div class="slideOne" @click="modelValue = !modelValue">
          <input disabled v-model="modelValue" type="checkbox" id="slideOne" name="check"/>
          <label disabled for="slideOne"></label>
      </div>
  </div>
</template>
<script setup lang="ts">
const modelValue = defineModel<boolean>();
</script>
<style lang="scss" scoped>
button {
  margin-left: 3px;
}
</style>