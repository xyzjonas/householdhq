<template>
  <div>
    <div class="flex">
      <transition name="slide">
        <div v-if="value !== valueCopy" class="flex gap-1 mr-1">
          <ui-button color="success" @click="send">
            {{ $t("ok").toUpperCase() }}
          </ui-button>
          <ui-button outlined @click="valueCopy = value">
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
          v-model="valueCopy"
          type="color"
          @change="update"
        />
      </label>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    value: { type: String, default: null },
    keyName: { type: String, required: true },
  },
  emits: ["send"],

  data() {
    return {
      editting: false,
      valueCopy: null,
    };
  },

  created() {
    this.valueCopy = this.value;
  },

  methods: {
    send() {
      const data = {};
      data[this.keyName] = this.valueCopy;
      this.$emit("send", data);
    },
  },
};
</script>
<style lang="scss" scoped>
.color-circle {
  display: block;
  width: 2.5rem;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid;
  border-color: #00000050;
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
