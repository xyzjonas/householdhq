<template>
  <div class="row-simple">
    <div v-if="editting" class="flex gap-2">
      <ui-button @click="send" color="success">{{
        $t("ok").toUpperCase()
      }}</ui-button>
      <ui-button @click="editting = false" outlined>{{
        $t("cancel")
      }}</ui-button>
      <ui-input
        v-model="valueCopy"
        cols="20"
        :rows="rowCount"
        :placeholder="$t('undefined')"
        :type="type ?? 'text'"
        :inputmode="inputmode"
      />
    </div>
    <p v-else @click="editting = true" style="text-align: end">
      {{ value || $t("undefined") }}
    </p>
  </div>
</template>
<script lang="ts" setup>
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  value: any;
  keyName: string;
  type?: "text" | "number" | "email";
  inputmode?: HTMLAttributes["inputmode"];
}>();

const editting = ref(false);
const columns = ref(15);

const valueCopy = ref<string>();
valueCopy.value = props.value;

const rowCount = computed(() => {
  if (valueCopy.value) {
    return Math.round(valueCopy.value.length / columns.value) || 1;
  }
  return 1;
});

const emit = defineEmits(["send"]);

function send() {
  const data: { [key: string]: any } = {};
  data[props.keyName] = valueCopy.value;
  emit("send", data);
  editting.value = false;
}
</script>
<style lang="scss" scoped>
button {
  margin-left: 3px;
}
</style>
