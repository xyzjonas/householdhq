<template>
  <div class="relative flex flex-col h-md">
    <ui-empty
      v-if="!hasData"
      icon="i-ic-baseline-bar-chart"
      :title="emptyTitle"
      :subtitle="emptySubtitle"
      class="my-auto"
    />

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
  </div>
</template>

<script setup lang="ts">
import { Doughnut } from "vue-chartjs";
import { useLocalStorage } from "@vueuse/core";

export interface DonutChartSegment {
  label: string;
  value: number;
  color?: string | null;
}

const props = withDefaults(
  defineProps<{
    segments: DonutChartSegment[];
    expand?: boolean;
    emptyTitle?: string;
    emptySubtitle?: string;
  }>(),
  {
    expand: false,
    emptyTitle: "No data",
    emptySubtitle: "Data will appear here",
  },
);

const theme = useLocalStorage<string>("theme", "light");
const doughnutChart = ref<any>(null);

watch(theme, () => {
  doughnutChart.value?.chart?.update();
});

const segments = computed(() => {
  return props.segments.filter((segment) => segment.value > 0);
});

const hasData = computed(() => segments.value.length > 0);

const sum = computed(() =>
  segments.value.reduce((acc, segment) => acc + segment.value, 0),
);

const percentage = (value: number) => {
  if (sum.value <= 0) {
    return 0;
  }

  return Math.round((value / sum.value) * 100);
};

const data = computed(() => {
  return {
    labels: segments.value.map((segment) => segment.label),
    datasets: [
      {
        data: segments.value.map((segment) => segment.value),
        backgroundColor: segments.value.map(
          (segment) => segment.color ?? "#0f766e",
        ),
        borderColor: segments.value.map(
          (segment) => segment.color ?? "#0f766e",
        ),
      },
    ],
  };
});

const topLabelIndexes = computed(() =>
  segments.value
    .map((segment, index) => ({ index, value: segment.value }))
    .filter((entry) => percentage(entry.value) >= 5)
    .sort((a, b) => b.value - a.value)
    .map((entry) => entry.index),
);

const shortName = (name: string) => {
  if (name.length <= 10) {
    return name;
  }

  return `${name.slice(0, 10)}...`;
};

const calloutLabelsPlugin = {
  id: "donut-callout-labels",
  afterDatasetsDraw(chart: any) {
    const meta = chart.getDatasetMeta(0);
    const arcs = meta?.data ?? [];

    if (!arcs.length || segments.value.length <= 1) {
      return;
    }

    const { ctx, chartArea } = chart;
    const candidates = topLabelIndexes.value
      .map((dataIndex) => {
        const arc = arcs[dataIndex];
        const segment = segments.value[dataIndex];

        if (!arc || !segment) {
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
          text: `${shortName(segment.label)} ${percentage(segment.value)}%`,
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
</style>
