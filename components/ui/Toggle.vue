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
// {
//   props: ['value', 'keyName', 'disabled'],

//   data() {
//       return {
//           valueCopy: undefined,
//       }
//   },

//   created() {
//       this.valueCopy = this.value;
//   },

//   methods: {
//       send() {
//         if (this.disabled) {
//             return
//         }
//         this.valueCopy = !this.valueCopy;
//         const data = {};
//         data[this.keyName] = this.valueCopy;
//         this.$emit('send', data);
//         this.editting = false;
//       }
//   },
  
// }
</script>
<style lang="scss" scoped>
button {
  margin-left: 3px;
}
</style>