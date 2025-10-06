export const useTimeAndDate = (datetime: Ref<Date>) => {
  const formatDate = (date: Date) => {
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${date.getUTCFullYear()}-${m}-${d}`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return hours + ":" + minutes;
  };

  const time = ref(formatTime(datetime.value));
  const date = ref(formatDate(datetime.value));

  watch(datetime, () => {
    const newTime = formatTime(datetime.value);
    const newDate = formatDate(datetime.value);
    if (newTime !== time.value || newDate !== date.value) {
      time.value = newTime;
      date.value = newDate;
    }
  });

  watch([time, date], () => {
    const newTime = formatTime(datetime.value);
    const newDate = formatDate(datetime.value);
    if (newTime !== time.value || newDate !== date.value) {
      datetime.value = new Date(`${date.value} ${time.value}`);
    }
  });

  return {
    datetime,
    time,
    date,
  };
};
