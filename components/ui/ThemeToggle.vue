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

const color = computed(() => modelValue.value ? 'black' : 'white')
const bgcolor = computed(() => modelValue.value ? 'white' : 'black')
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

.slideOne label {
  background-color: v-bind('color') !important;
  // transform: translateY(-8px) translateX(2px);
}

.slideOne {
  cursor: pointer;
  background-color: v-bind('bgcolor');
  border-color: transparent;
}
</style>