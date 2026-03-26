<template>
  <div class="settings-page flex flex-col gap-3">
    <section class="settings-hero row title justify-between gap-4 flex-wrap">
      <div class="flex items-start gap-4 min-w-0">
        <div class="settings-hero__icon">
          <i class="i-ic-baseline-settings"></i>
        </div>

        <div class="min-w-0 flex flex-col gap-1">
          <h1 class="uppercase text-3xl">{{ $t("settings_title") }}</h1>
          <p class="settings-hero__subtitle">
            {{ $t("settings_subtitle") }}
          </p>
        </div>
      </div>
    </section>

    <section v-if="settings" class="settings-grid">
      <div class="card row settings-card">
        <div class="row-label">
          <p>{{ $t("settings_currency") }}</p>
          <p class="desc">{{ $t("settings_currency_desc") }}</p>
          <small>{{ $t("settings_currency_hint") }}</small>
        </div>

        <form-editable-field
          :value="settings.currency"
          keyName="currency"
          @send="updateCurrency"
        />
      </div>

      <div class="card preview-card">
        <div class="row-label mb-3">
          <p>{{ $t("settings_preview") }}</p>
          <p class="desc">{{ $t("settings_preview_desc") }}</p>
        </div>

        <div class="preview-card__value">
          <ui-price
            :amount="12500"
            size="2rem"
            :currency-in="settings.currency"
          />
        </div>

        <div class="flex flex-wrap gap-2 mt-3">
          <ui-pin text="Default display" size="small" />
          <ui-pin :text="settings.currency" size="small" />
        </div>
      </div>

    </section>

    <section v-else class="card min-h-sm flex items-center justify-center">
      <spinner v-if="isLoading" />
      <error-banner
        v-else-if="error"
        status="500"
        :message="error"
        :is-login="false"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
const {
  settings,
  isLoading,
  error,
  fetchSettings,
  setCurrency,
} = useAppSettings();

await fetchSettings();

const updateCurrency = async (data: { currency?: string }) => {
  const currency = data.currency?.trim().toUpperCase();

  if (!currency) {
    return;
  }

  try {
    await setCurrency(currency);
    useNotifications().addNotification({
      level: "success",
      text: $t("settings_saved"),
    });
  } catch {
    useNotifications().addNotification({
      level: "error",
      text: $t("settings_save_error"),
    });
  }
};

definePageMeta({
  layout: "default",
});
</script>

<style scoped lang="scss">
.settings-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(0, 1.5fr) minmax(18rem, 1fr);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.settings-hero {
  align-items: center;
}

.settings-hero__icon {
  width: 4.25rem;
  height: 4.25rem;
  border-radius: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--primary-100) 20%, transparent),
      transparent
    ),
    var(--bg-200);
  border: 1px solid
    color-mix(in srgb, var(--primary-100) 22%, var(--border-100));
  color: var(--primary-100);
  font-size: 2rem;
  box-shadow: inset 0 1px 0 color-mix(in srgb, white 30%, transparent);
}

.settings-hero__subtitle {
  margin: 0;
  color: var(--text-200);
  max-width: 42rem;
}

.settings-card,
.preview-card {
  min-height: 10rem;
}

.settings-card {
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.row-label {
  filter: contrast(0.82);

  p {
    margin: 0;
  }

  p:first-child {
    text-transform: capitalize;
  }

  .desc {
    margin-top: 0.35rem;
    font-size: 0.95rem;
    color: var(--text-200);
  }

  small {
    display: inline-block;
    margin-top: 0.5rem;
    color: var(--text-200);
  }
}

.preview-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.preview-card__value {
  display: flex;
  align-items: center;
  min-height: 3.5rem;
}
</style>
