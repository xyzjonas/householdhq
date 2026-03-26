<template>
  <div class="component-selector flex flex-col gap-2">
    <label class="selector-label">{{ $t("vehicle_service_components") }}</label>

    <!-- Selected chips -->
    <div v-if="selectedComponents.length" class="flex flex-wrap gap-2">
      <button
        v-for="comp in selectedComponents"
        :key="comp.id"
        type="button"
        class="component-chip selected"
        :style="chipStyle(comp)"
        @click="toggle(comp.id)"
      >
        <i v-if="comp.icon" :class="comp.icon" class="text-xs" />
        <span>{{ comp.name }}</span>
        <i class="i-ic-baseline-close text-xs opacity-70" />
      </button>
    </div>

    <!-- Available components (not yet selected) -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="comp in unselectedComponents"
        :key="comp.id"
        type="button"
        class="component-chip"
        @click="toggle(comp.id)"
      >
        <i v-if="comp.icon" :class="comp.icon" class="text-xs" />
        <span>{{ comp.name }}</span>
      </button>

      <!-- Create-on-the-fly trigger -->
      <button
        v-if="!showCreateForm"
        type="button"
        class="component-chip create-trigger"
        @click="showCreateForm = true"
      >
        <i class="i-ic-baseline-add text-xs" />
        <span>{{ $t("vehicle_component_create_new") }}</span>
      </button>
    </div>

    <!-- Inline create form -->
    <div v-if="showCreateForm" class="create-form">
      <div class="flex gap-2 items-end flex-wrap">
        <div class="flex flex-col gap-1 flex-1 min-w-36">
          <label class="text-xs text-[var(--text-200)]">{{
            $t("vehicle_component_name")
          }}</label>
          <input
            ref="nameInput"
            v-model="newName"
            class="field-input"
            :placeholder="$t('vehicle_component_name_placeholder')"
            @keydown.enter.prevent="submitCreate"
            @keydown.escape.prevent="cancelCreate"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[var(--text-200)]">{{
            $t("vehicle_component_color")
          }}</label>
          <input
            type="color"
            v-model="newColor"
            class="color-input"
            title="Component color"
          />
        </div>
        <div class="flex gap-1">
          <ui-button
            color="primary"
            :loading="creating"
            :disabled="!newName.trim()"
            @click="submitCreate"
          >
            {{ $t("t_send") }}
          </ui-button>
          <ui-button outlined @click="cancelCreate">
            {{ $t("cancel") }}
          </ui-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VehicleComponent } from "~/types";
import { shouldInvert } from "~/utils/color";

const tokenStore = useTokenStore();

const modelValue = defineModel<number[]>({ default: () => [] });

// Fetch all components
const { data: componentsData, refresh: refreshComponents } = useFetch<{
  data: VehicleComponent[];
}>("/api/vehicle-components");

const components = computed(() => componentsData.value?.data ?? []);

const selectedComponents = computed(() =>
  components.value.filter((c) => modelValue.value.includes(c.id)),
);

const unselectedComponents = computed(() =>
  components.value.filter((c) => !modelValue.value.includes(c.id)),
);

function toggle(id: number) {
  if (modelValue.value.includes(id)) {
    modelValue.value = modelValue.value.filter((v) => v !== id);
  } else {
    modelValue.value = [...modelValue.value, id];
  }
}

function chipStyle(comp: VehicleComponent) {
  if (!comp.color) return {};
  const textColor = shouldInvert(comp.color) ? "#000000" : "#ffffff";
  return {
    backgroundColor: comp.color,
    color: textColor,
    borderColor: comp.color,
  };
}

// Create-on-the-fly
const showCreateForm = ref(false);
const newName = ref("");
const newColor = ref("#6b7280");
const creating = ref(false);
const nameInput = ref<HTMLInputElement | null>(null);

watch(showCreateForm, (val) => {
  if (val) {
    nextTick(() => nameInput.value?.focus());
  }
});

async function submitCreate() {
  if (!newName.value.trim()) return;

  creating.value = true;

  try {
    const created = (await tokenStore.post("/api/vehicle-components", {
      name: newName.value.trim(),
      color: newColor.value,
    })) as VehicleComponent;

    await refreshComponents();

    // Auto-select the newly created component
    modelValue.value = [...modelValue.value, created.id];

    cancelCreate();
  } finally {
    creating.value = false;
  }
}

function cancelCreate() {
  showCreateForm.value = false;
  newName.value = "";
  newColor.value = "#6b7280";
}
</script>

<style scoped lang="scss">
.selector-label {
  font-size: 0.85rem;
  color: var(--text-200);
}

.component-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  border: 1px solid var(--border-100);
  background: var(--bg-200);
  color: var(--text-100);
  font-size: 0.8rem;
  cursor: pointer;
  transition:
    filter 0.15s ease,
    background 0.15s ease;

  &:hover {
    filter: brightness(0.92);
  }

  &.selected {
    background: var(--primary-100);
    border-color: var(--primary-100);
    color: white;
  }

  &.create-trigger {
    border-style: dashed;
    background: transparent;
    color: var(--text-200);

    &:hover {
      background: var(--bg-300);
      filter: none;
    }
  }
}

.create-form {
  background: var(--bg-200);
  border: 1px solid var(--border-100);
  border-radius: var(--border-radius);
  padding: 0.75rem;
}

.field-input {
  border-radius: 0.375rem;
  border: 1px solid var(--bg-400);
  background: var(--bg-100);
  color: var(--text-100);
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  width: 100%;

  &:focus {
    outline: 2px solid var(--primary-100);
    outline-offset: -1px;
  }
}

.color-input {
  width: 2.5rem;
  height: 2.25rem;
  border: 1px solid var(--bg-400);
  border-radius: 0.375rem;
  padding: 0.1rem;
  cursor: pointer;
  background: transparent;
}
</style>
