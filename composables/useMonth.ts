export const useMonth = () => {
  const i18n = useI18n();

  const month = ref(new Date().getMonth() + 1);
  const year = ref(new Date().getFullYear());

  const next = computed(() => {
    if (month.value === 11) {
      return new Date(year.value + 1, 0);
    }

    return new Date(year.value, month.value);
  });

  const goNext = () => {
    const nextDate = new Date(year.value, month.value);
    month.value = nextDate.getMonth() + 1;
    year.value = nextDate.getFullYear();
  };

  const goPrevious = () => {
    const nextDate = new Date(year.value, month.value - 2);
    month.value = nextDate.getMonth() + 1;
    year.value = nextDate.getFullYear();
  };

  const date = computed<Date>(() => new Date(year.value, month.value - 1));

  const dateFormatted = computed(() =>
    formatMMYYYY(date.value, i18n.locale.value)
  );

  return {
    month,
    year,
    next,
    date,
    dateFormatted,
    goNext,
    goPrevious,
  };
};
