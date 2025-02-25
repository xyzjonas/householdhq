export const useCurrentMonth = () => {
  // const route = useRoute()
  const router = useRouter();
  const i18n = useI18n();

  const query = computed(() => {
    return router.currentRoute.value.query;
  });

  const month = computed(() => {
    if (query.value.month) {
      return parseInt(query.value.month as string);
    }
    return new Date().getMonth() + 1;
  });

  const year = computed(() => {
    if (query.value.year) {
      return parseInt(query.value.year as string);
    }
    return new Date().getFullYear();
  });

  const next = computed(() => {
    if (month.value === 11) {
      return new Date(year.value + 1, 0);
    }

    return new Date(year.value, month.value);
  });

  const previous = computed(() => {
    if (month.value === 1) {
      return new Date(year.value - 1, 11);
    }

    return new Date(year.value, month.value - 2);
  });

  const isCurrent = computed(() => {
    return (
      new Date().getMonth() + 1 === month.value &&
      new Date().getFullYear() === year.value
    );
  });

  const date = computed<Date>(() => new Date(year.value, month.value - 1));

  const dateFormatted = computed(() =>
    formatMMYYYY(date.value, i18n.locale.value)
  );

  return {
    month,
    year,
    next,
    previous,
    isCurrent,
    date,
    dateFormatted,
  };
};
