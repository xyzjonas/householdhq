<template>
  <div>
    <div class="flex">
      <transition name="slide">
        <div v-if="value !== valueCopy" class="flex gap-2 mr-2">
          <ui-button @click="send" color="success">
            {{ $t("ok").toUpperCase() }}
          </ui-button>
          <ui-button @click="valueCopy = value" outlined>
            {{ $t("cancel") }}
          </ui-button>
        </div>
      </transition>
      <label
        id="test_wrapper"
        class="color-circle"
        :style="`background-color: ${valueCopy}`"
      >
        <input
          id="primary_color"
          @change="update"
          type="color"
          v-model="valueCopy"
        />
      </label>
    </div>
  </div>
</template>
<script>
export default {
  props: ["value", "keyName"],

  data() {
    return {
      editting: false,
      valueCopy: null,
    };
  },

  methods: {
    send() {
      const data = {};
      data[this.keyName] = this.valueCopy;
      this.$emit("send", data);
    },
  },

  created() {
    this.valueCopy = this.value;
  },
};
</script>
<style lang="scss" scoped>
.color-circle {
  display: block;
  width: 2.5rem;
  aspect-ratio: 1;
  border-radius: 50%;
  // border: 1px solid;
  // border-color: var(--color-grey-dark-3);
  margin-right: 0;

  input[type="color"] {
    position: fixed;
    max-width: 0;
    visibility: hidden;
  }
}

.btn-group {
  display: flex;
  gap: 0.1rem;

  margin-right: 1rem;
}
</style>
