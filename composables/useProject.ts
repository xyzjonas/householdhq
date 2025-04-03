import type { Project } from "~/types";

export const useProject = (project: Ref<Project>) => {
  const total = computed(() => {
    if (project.value.isCompleted) {
      if (transactions.value.length === 0) {
        return 0;
      }

      return Math.abs(
        transactionsTotal(transactions.value.filter(isExpense))
      );
    }

    return project.value.estimate;
  });

  const transactions = computed(() => project.value.transactions ?? [])

  const paidSoFar = computed(() => {
    if (project.value.isCompleted) {
        return total.value
    }

    return Math.abs(
        transactionsTotal(transactions.value.filter(isExpense))
      );
  })

  return {
    total,
    paidSoFar,
  };
};
