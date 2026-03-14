<template>
  <div class="relative flex flex-col h-md">
    <ui-empty
      v-if="!areThereTransactions || loading"
      :loading="loading"
      icon="i-ic-baseline-bar-chart"
      :title="$t('no_data')"
      :subtitle="$t('no_data_will_appear')"
      class="my-auto"
    />
    <section v-else-if="selectedCategory">
      <Summary
        :category="selectedCategory"
        @edit="navigateTo(`/tags/${selectedCategory.id}`)"
        @close="selectedCategoryId = -1"
      />
      <div id="actions" class="row center">
        <ui-button
          width="48px"
          height="36px"
          icon="i-ic-baseline-mode-edit"
          @click="navigateTo(`/categories/${selectedCategory.id}`)"
        />
        <ui-button
          width="48px"
          height="36px"
          icon="i-ic-baseline-close"
          @click="selectedCategoryId = -1"
        />
      </div>
    </section>
    <section v-else-if="showLegend" class="h-full flex flex-col justify-start">
      <!-- <div
        v-for="item in items.filter((it) => it.sum > 0)"
        class="legend-content-item relative overflow-hidden"
        @click="selectCategoryByName(item.name)"
      >
        <span
          class="circle-sm mr-1"
          :style="`background-color: ${item.color};`"
        ></span>
        <span
          class="absolute inset-0 opacity-[0.1] left-[2]"
          :style="`background-color: ${item.color}; right: ${
            100 - percentage(item.sum)
          }%`"
        ></span>
        <span class="mr-1">{{ item.name }}</span>
        <ui-price :amount="item.sum" size="small" class="ml-auto mr-2" />
      </div> -->
    </section>
    <div v-else class="graph-wrapper">
      <Doughnut
        ref="doughnutChart"
        :data="data"
        :options="options"
        :plugins="[calloutLabelsPlugin]"
      />
      <div class="graph-wrapper-center">
        <slot></slot>
      </div>
    </div>

    <!-- <client-only v-if="!selectedCategory">
      <div id="show-legend" class="flex gap-1">
        <ui-button
          :icon="
            showLegend
              ? 'i-ic-baseline-pie-chart'
              : 'i-ic-round-format-list-bulleted'
          "
          icon-size="1.3rem"
          @click="showLegend = !showLegend"
        />
      </div>
    </client-only> -->
  </div>
</template>
<script setup lang="ts">
import { Doughnut } from "vue-chartjs";
import { storeToRefs } from "pinia";
import type { CategoryWithSum } from "@/types";

import { useTransactionStore } from "@/stores/transactions";
import { useLocalStorage } from "@vueuse/core";

const showLegend = useLocalStorage<boolean>("display-list-view", false);
const theme = useLocalStorage<string>("theme", "light");
const doughnutChart = ref<any>(null);

watch(theme, () => {
  doughnutChart.value?.chart?.update();
});

const props = defineProps<{
  items: CategoryWithSum[];
  expand?: boolean;
}>();

const selectedCategoryId = defineModel<number>("selectedCategoryId", {
  default: -1,
});

const selectedCategory = computed(() => {
  return props.items.find((it) => it.id && it.id === selectedCategoryId.value);
});

const sum = computed(() => props.items.reduce((a, b) => a + b.sum, 0));
const percentage = (value: number) => round((value / sum.value) * 100, 0);

const { loading } = storeToRefs(useTransactionStore());

const emit = defineEmits(["filter"]);
watch(selectedCategory, (value, _) => {
  emit("filter", value?.id ?? -1);
});

const showedItems = computed(() => {
  if (selectedCategoryId.value >= 0) {
    return props.items.filter((it) => it.id === selectedCategoryId.value);
  }
  return props.items;
});

const areThereTransactions = computed(() => {
  return showedItems.value.map((cat) => cat.transactions).flat().length > 0;
});

const borderColor = (item: CategoryWithSum) => {
  if (item.id === selectedCategoryId.value) {
    return "white";
  }
  return item.color ?? "var(--bg-300)";
};

const data = computed(() => {
  return {
    labels: showedItems.value.map((it) => it.name),
    datasets: [
      {
        data: showedItems.value.map((it) => it.sum),
        backgroundColor: showedItems.value.map((it) => it.color ?? "white"),
        borderColor: showedItems.value.map(borderColor),
      },
    ],
    borderColor: "red",
    defaults: {
      borderColor: "red",
    },
  };
});

const topLabelIndexes = computed(() =>
  showedItems.value
    .map((item, index) => ({ index, sum: item.sum }))
    .filter((entry) => entry.sum > 0)
    .filter((entry) => percentage(entry.sum) >= 5)
    .sort((a, b) => b.sum - a.sum)
    .map((entry) => entry.index),
);

const labelPercent = (dataIndex: number) => {
  const total = showedItems.value.reduce((acc, curr) => acc + curr.sum, 0);
  if (total <= 0) {
    return 0;
  }

  return Math.round(((showedItems.value[dataIndex]?.sum ?? 0) / total) * 100);
};

const shortName = (name?: string | null) => {
  if (!name) {
    return "";
  }

  if (name.length <= 10) {
    return name;
  }

  return `${name.slice(0, 10)}…`;
};

const calloutLabelsPlugin = {
  id: "callout-labels",
  afterDatasetsDraw(chart: any) {
    const meta = chart.getDatasetMeta(0);
    const arcs = meta?.data ?? [];

    if (!arcs.length || showedItems.value.length <= 1) {
      return;
    }

    const { ctx, chartArea } = chart;
    const candidates = topLabelIndexes.value
      .map((dataIndex) => {
        const arc = arcs[dataIndex];
        const item = showedItems.value[dataIndex];

        if (!arc || !item) {
          return null;
        }

        const { x, y, startAngle, endAngle, outerRadius, innerRadius } =
          arc.getProps(
            ["x", "y", "startAngle", "endAngle", "outerRadius", "innerRadius"],
            true,
          );

        const angle = (startAngle + endAngle) / 2;
        const middleRadius = (innerRadius + outerRadius) / 2;
        const anchorX = x + Math.cos(angle) * middleRadius;
        const anchorY = y + Math.sin(angle) * middleRadius;
        const side = Math.cos(angle) >= 0 ? "right" : "left";

        return {
          dataIndex,
          side,
          anchorX,
          anchorY,
          color: item.color ?? "#a1a1aa",
          text: `${shortName(item.name)} ${labelPercent(dataIndex)}%`,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => !!entry);

    const resolveY = (entries: typeof candidates) => {
      const sorted = [...entries].sort((a, b) => a.anchorY - b.anchorY);
      const minY = chartArea.top + 14;
      const maxY = chartArea.bottom - 14;
      const minGap = 12;
      let previousY = minY - minGap;

      const adjusted = sorted.map((entry) => {
        let y = Math.max(entry.anchorY, previousY + minGap);
        y = Math.min(y, maxY);
        previousY = y;

        return { ...entry, y };
      });

      let nextY = maxY + minGap;
      for (let index = adjusted.length - 1; index >= 0; index--) {
        const item = adjusted[index];
        if (!item) {
          continue;
        }
        item.y = Math.min(item.y, nextY - minGap);
        item.y = Math.max(item.y, minY);
        nextY = item.y;
      }

      return adjusted;
    };

    const leftEntries = resolveY(
      candidates.filter((entry) => entry.side === "left"),
    );
    const rightEntries = resolveY(
      candidates.filter((entry) => entry.side === "right"),
    );
    const all = [...leftEntries, ...rightEntries];

    ctx.save();
    ctx.font = "500 10px sans-serif";
    ctx.lineWidth = 1.2;

    all.forEach((entry) => {
      const isDarkTheme = theme.value === "dark";
      const calloutColor = isDarkTheme ? "#f4f4f5" : "#27272a";
      const canvasLeft = 6;
      const canvasRight = chart.width - 6;
      const textWidth = ctx.measureText(entry.text).width;
      const connectorY = entry.y + 5;
      const elbowY = entry.anchorY + (connectorY - entry.anchorY) * 0.97;

      const textX =
        entry.side === "right"
          ? Math.min(chartArea.right + 8, canvasRight - textWidth)
          : Math.max(chartArea.left - 8, canvasLeft + textWidth);

      const lineEndX = entry.side === "right" ? textX - 4 : textX + 4;
      const elbowX =
        entry.side === "right"
          ? entry.anchorX + (lineEndX - entry.anchorX) * 0.9
          : entry.anchorX - (entry.anchorX - lineEndX) * 0.9;

      ctx.strokeStyle = calloutColor;
      ctx.fillStyle = calloutColor;

      ctx.beginPath();
      ctx.moveTo(entry.anchorX, entry.anchorY);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(lineEndX, connectorY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(entry.anchorX, entry.anchorY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = calloutColor;
      ctx.textAlign = entry.side === "right" ? "left" : "right";
      ctx.textBaseline = "middle";
      ctx.fillText(entry.text, textX, entry.y - 1);

      ctx.strokeStyle = calloutColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (entry.side === "right") {
        ctx.moveTo(textX, entry.y + 4);
        ctx.lineTo(Math.min(textX + textWidth + 2, canvasRight), entry.y + 4);
      } else {
        ctx.moveTo(Math.max(textX - textWidth - 2, canvasLeft), entry.y + 4);
        ctx.lineTo(textX, entry.y + 4);
      }
      ctx.stroke();
      ctx.lineWidth = 1.2;
    });

    ctx.restore();
  },
};

const selectCategoryByName = (name: string) => {
  const match = props.items.find((it) => it.name && it.name === name);
  if (match) {
    selectedCategoryId.value = match.id ?? -1;
  } else {
    selectedCategoryId.value = -1;
  }
};

const callback = (e: any) => {
  // OnClick emit filter by category
  const label = e.chart.tooltip.title[0];
  selectCategoryByName(label);
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: (context: any) => {
      const width = context?.chart?.width ?? 0;
      const side = width < 420 ? 22 : 42;

      return {
        top: 14,
        right: side,
        bottom: 14,
        left: side,
      };
    },
  },
  onClick: callback,
  radius: () => (props.expand ? "100%" : "96%"),
  cutout: () => (props.expand ? "60%" : "80%"),
  offset: 0,
  spacing: 7,
  plugins: {
    datalabels: {
      display: () => false,
    },
  },
} as any;
</script>
<style lang="scss" scoped>
section {
  width: 100%;
}

.legend {
  margin-top: 12px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &-content {
    display: flex;
    gap: 1.2rem;
    flex-wrap: wrap;
    justify-content: center;

    &-item {
      display: flex;
      align-items: center;
      gap: 0.2rem;
      font-size: small;
      border: 1px solid var(--border-100);
      background-color: var(--bg-200);
      padding: 2px 5px;
      border-radius: 2rem;
      cursor: pointer;
      transition: filter 0.1s ease-in-out;

      &:hover {
        font-weight: 500;
      }
    }
  }
}

.graph-card {
  position: relative;
  height: 100%;
  height: 320px;
}

@media (min-width: 992px) {
  .graph-card {
    height: 560px;
  }
}

#show-legend {
  position: absolute;
  bottom: 4px;
  right: 4px;
}

#actions {
  position: absolute;
  top: -8px;
  right: -16px;
  display: flex;
  gap: 0.3rem;
}

.graph-wrapper {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-items: center;

  &-center {
    position: absolute;
  }
}

.progress-background {
  inset: 0;
}
</style>
