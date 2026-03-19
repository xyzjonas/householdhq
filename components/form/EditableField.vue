<template>
  <div class="row-simple">
    <button class="edit-trigger" type="button" @click="openEditor">
      <span class="edit-trigger__value">{{ value || $t("undefined") }}</span>
      <span class="edit-trigger__icon i-ic-baseline-edit" aria-hidden="true" />
    </button>

    <client-only>
      <teleport to="body">
        <ui-modal v-model="editting">
          <div class="edit-modal card w-sm">
            <h3 class="edit-modal__title">{{ keyName }}</h3>
            <ui-input
              v-model="valueCopy"
              cols="20"
              :rows="rowCount"
              :placeholder="$t('undefined')"
              :type="type ?? 'text'"
              :inputmode="inputmode"
              @keydown.enter="send"
            />
            <div class="edit-modal__actions">
              <ui-button @click="send" color="success">
                {{ $t("ok").toUpperCase() }}
              </ui-button>
              <ui-button @click="cancel" outlined>
                {{ $t("cancel") }}
              </ui-button>
            </div>
          </div>
        </ui-modal>
      </teleport>
    </client-only>
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

watch(
  () => props.value,
  (nextValue) => {
    if (!editting.value) {
      valueCopy.value = nextValue;
    }
  },
);

const rowCount = computed(() => {
  if (valueCopy.value) {
    return Math.round(valueCopy.value.length / columns.value) || 1;
  }
  return 1;
});

const emit = defineEmits(["send"]);

function openEditor() {
  valueCopy.value = props.value;
  editting.value = true;
}

function cancel() {
  valueCopy.value = props.value;
  editting.value = false;
}

function send() {
  const data: { [key: string]: any } = {};
  data[props.keyName] = valueCopy.value;
  emit("send", data);
  editting.value = false;
}
</script>

<style scoped lang="scss">
.edit-trigger {
  border: none;
  background: transparent;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.35rem;
  cursor: pointer;
  border-radius: 6px;
  padding: 6px 14px;
  color: inherit;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;

  &:hover,
  &:focus-visible {
    background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
    color: var(--color-primary);
  }

  &:active {
    transform: translateY(1px);
  }
}

.edit-trigger__icon {
  font-size: 1rem;
  opacity: 0.72;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.edit-trigger:hover .edit-trigger__icon,
.edit-trigger:focus-visible .edit-trigger__icon {
  opacity: 1;
  transform: translateX(1px);
}

.edit-trigger__value {
  text-align: end;
}

.edit-modal {
  width: min(92vw, 32rem);
  padding: 1rem;
}

.edit-modal__title {
  margin: 0 0 0.8rem;
  text-transform: capitalize;
}

.edit-modal__actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.75rem;
}
</style>
