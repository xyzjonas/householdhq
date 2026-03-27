<template>
  <section class="fuel-chart flex flex-col gap-4">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="mode-switcher">
        <button
          v-for="option in modeOptions"
          :key="option.value"
          type="button"
          :class="['mode-btn', mode === option.value ? 'mode-btn--active' : '']"
          @click="mode = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div v-if="!points.length" class="min-h-[320px] flex">
      <ui-empty
        icon="i-ic-baseline-show-chart"
        title="No data"
        subtitle="Fuel chart will appear here"
        class="my-auto"
      />
    </div>

    <div v-else class="chart-shell min-h-[320px]">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <div class="chart-summary">
      <span class="chart-summary__label">{{ centerLabel }}</span>
      <strong class="chart-summary__value">{{ centerValue }}</strong>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Line } from "vue-chartjs";
import { useLocalStorage, useWindowSize } from "@vueuse/core";
import type { VehicleFuelEntry } from "~/types";

type FuelChartMode =
  | "ODOMETER_CHANGE"
  | "UNIT_PRICE_CHANGE"
  | "YEARLY_DISTANCE";

type ChartPoint = {
  label: string;
  value: number;
};

const props = defineProps<{
  entries: VehicleFuelEntry[];
  color?: string | null;
}>();

const { locale } = useI18n();
const theme = useLocalStorage<string>("theme", "light");
const { width } = useWindowSize();

const $q = computed(() => {
  return {
    sm: {
      lte: width.value <= 900,
    },
  };
});

const mode = ref<FuelChartMode>("ODOMETER_CHANGE");

const modeOptions: { value: FuelChartMode; label: string }[] = [
  {
    value: "ODOMETER_CHANGE",
    label: "Distance by date",
  },
  {
    value: "UNIT_PRICE_CHANGE",
    label: "Price by date",
  },
  {
    value: "YEARLY_DISTANCE",
    label: "Distance by year",
  },
];

const sortedEntries = computed(() => {
  return [...props.entries].sort((a, b) => {
    return new Date(a.fueledAt).getTime() - new Date(b.fueledAt).getTime();
  });
});

const monthStart = (value: string | Date) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const formatDate = (value: string | Date) => {
  return new Intl.DateTimeFormat(locale.value, {
    year: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
};

const formatMonth = (value: Date) => {
  return new Intl.DateTimeFormat(locale.value, {
    year: "2-digit",
    month: "short",
  }).format(value);
};

const interpolateOdometerAt = (timestamp: number): number => {
  if (!sortedEntries.value.length) {
    return 0;
  }

  const first = sortedEntries.value[0];
  const last = sortedEntries.value[sortedEntries.value.length - 1];
  if (!first || !last) {
    return 0;
  }

  const firstTs = new Date(first.fueledAt).getTime();
  const lastTs = new Date(last.fueledAt).getTime();

  if (timestamp <= firstTs) {
    return first.odometer;
  }

  if (timestamp >= lastTs) {
    return last.odometer;
  }

  for (let index = 1; index < sortedEntries.value.length; index++) {
    const previous = sortedEntries.value[index - 1];
    const current = sortedEntries.value[index];

    if (!previous || !current) {
      continue;
    }

    const previousTs = new Date(previous.fueledAt).getTime();
    const currentTs = new Date(current.fueledAt).getTime();

    if (timestamp <= currentTs) {
      const duration = currentTs - previousTs;
      if (duration <= 0) {
        return current.odometer;
      }

      const progress = (timestamp - previousTs) / duration;
      return (
        previous.odometer + (current.odometer - previous.odometer) * progress
      );
    }
  }

  return last.odometer;
};

const distanceByDate = computed<ChartPoint[]>(() => {
  if (!sortedEntries.value.length) {
    return [];
  }

  const firstEntry = sortedEntries.value[0];
  const lastEntry = sortedEntries.value[sortedEntries.value.length - 1];
  if (!firstEntry || !lastEntry) {
    return [];
  }

  const startMonth = monthStart(firstEntry.fueledAt);
  const endMonth = monthStart(lastEntry.fueledAt);
  const points: ChartPoint[] = [];

  const cursor = new Date(startMonth);
  while (cursor <= endMonth) {
    const anchor = new Date(cursor);
    points.push({
      label: formatMonth(anchor),
      value: interpolateOdometerAt(anchor.getTime()),
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return points;
});

const unitPriceByDate = computed<ChartPoint[]>(() => {
  return sortedEntries.value.map((entry) => {
    return {
      label: formatDate(entry.fueledAt),
      value: entry.unitPrice,
    };
  });
});

const yearlyDistance = computed<ChartPoint[]>(() => {
  const yearlyMap = new Map<number, number>();

  for (let index = 1; index < sortedEntries.value.length; index++) {
    const current = sortedEntries.value[index];
    const previous = sortedEntries.value[index - 1];

    if (!current || !previous) {
      continue;
    }

    const delta = Math.max(current.odometer - previous.odometer, 0);
    const year = new Date(current.fueledAt).getFullYear();
    yearlyMap.set(year, (yearlyMap.get(year) ?? 0) + Math.max(delta, 0));
  }

  return [...yearlyMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, value]) => ({ label: String(year), value }));
});

const points = computed<ChartPoint[]>(() => {
  if (mode.value === "UNIT_PRICE_CHANGE") {
    return unitPriceByDate.value;
  }

  if (mode.value === "YEARLY_DISTANCE") {
    return yearlyDistance.value;
  }

  return distanceByDate.value;
});

const hideDateModeXAxis = computed(() => {
  const isDateMode =
    mode.value === "ODOMETER_CHANGE" || mode.value === "UNIT_PRICE_CHANGE";

  return $q.value.sm.lte && isDateMode;
});

const priceAxisBounds = computed(() => {
  if (mode.value !== "UNIT_PRICE_CHANGE" || !points.value.length) {
    return {
      min: undefined as number | undefined,
      max: undefined as number | undefined,
    };
  }

  const values = points.value.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  if (minValue === maxValue) {
    const delta = Math.max(minValue * 0.05, 0.5);
    return {
      min: Math.max(minValue - delta, 0),
      max: maxValue + delta,
    };
  }

  const range = maxValue - minValue;
  const padding = Math.max(range * 0.12, 0.15);

  return {
    min: Math.max(minValue - padding, 0),
    max: maxValue + padding,
  };
});

const chartColor = computed(() => props.color ?? "#0f766e");

const chartData = computed(() => {
  return {
    labels: points.value.map((point) => point.label),
    datasets: [
      {
        label: centerLabel.value,
        data: points.value.map((point) => point.value),
        borderColor: chartColor.value,
        backgroundColor: chartColor.value,
        borderWidth: hideDateModeXAxis.value ? 3 : 2,
        pointRadius: hideDateModeXAxis.value ? 0 : 2.5,
        pointHoverRadius: 5,
        tension: 0.35,
        fill: false,
      },
    ],
  };
});

const chartOptions = computed(() => {
  const dark = theme.value === "dark";
  const axisColor = dark ? "#a1a1aa" : "#52525b";
  const gridColor = dark ? "rgba(161,161,170,0.25)" : "rgba(82,82,91,0.12)";

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        ticks: {
          display: !hideDateModeXAxis.value,
          color: axisColor,
          maxRotation: 65,
          minRotation: 40,
          autoSkip: false,
        },
        grid: {
          color: gridColor,
          drawTicks: !hideDateModeXAxis.value,
        },
      },
      y: {
        beginAtZero: mode.value !== "ODOMETER_CHANGE",
        min: priceAxisBounds.value.min,
        max: priceAxisBounds.value.max,
        ticks: {
          color: axisColor,
        },
        grid: {
          color: gridColor,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: false,
      },
    },
  } as any;
});

const totalValue = computed(() => {
  return points.value.reduce((acc, point) => acc + point.value, 0);
});

const odometerGrowth = computed(() => {
  if (sortedEntries.value.length < 2) {
    return 0;
  }

  const first = sortedEntries.value[0]?.odometer ?? 0;
  const last =
    sortedEntries.value[sortedEntries.value.length - 1]?.odometer ?? 0;
  return Math.max(last - first, 0);
});

const averagePrice = computed(() => {
  if (!unitPriceByDate.value.length) {
    return 0;
  }

  const sum = unitPriceByDate.value.reduce(
    (acc, point) => acc + point.value,
    0,
  );
  return sum / unitPriceByDate.value.length;
});

const distanceFormatter = computed(() => {
  return new Intl.NumberFormat(locale.value, {
    maximumFractionDigits: 0,
  });
});

const priceFormatter = computed(() => {
  return new Intl.NumberFormat(locale.value, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});

const centerLabel = computed(() => {
  if (mode.value === "UNIT_PRICE_CHANGE") {
    return "Average unit price (all entries)";
  }

  if (mode.value === "YEARLY_DISTANCE") {
    return "Total yearly distance";
  }

  return "Odometer growth";
});

const currency = computed(() => {
  return sortedEntries.value[0]?.transaction.currency ?? "CZK";
});

const centerValue = computed(() => {
  if (mode.value === "UNIT_PRICE_CHANGE") {
    return `${priceFormatter.value.format(averagePrice.value)} ${currency.value}/L`;
  }

  if (mode.value === "ODOMETER_CHANGE") {
    return `${distanceFormatter.value.format(odometerGrowth.value)} km`;
  }

  return `${distanceFormatter.value.format(totalValue.value)} km`;
});
</script>

<style lang="scss" scoped>
.fuel-chart {
  min-height: 28rem;
}

.mode-switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.mode-btn {
  border: 1px solid var(--border-100);
  border-radius: 9999px;
  background: var(--bg-200);
  color: var(--text-200);
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--primary-100);
    color: var(--primary-100);
  }

  &--active {
    border-color: var(--primary-100);
    color: var(--primary-100);
    background: color-mix(in srgb, var(--primary-100) 10%, var(--bg-100));
  }
}

.chart-shell {
  border: 1px solid var(--border-100);
  border-radius: var(--border-radius);
  padding: 0.75rem;
  background: color-mix(in srgb, var(--bg-200) 70%, transparent);
}

.chart-summary {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.2rem;
  padding-inline: 0.2rem;

  &__label {
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-200);
  }

  &__value {
    font-size: 1rem;
    color: var(--text-100);
  }
}
</style>
