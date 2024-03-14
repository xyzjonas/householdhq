
const month = ref<number>(new Date().getMonth() + 1);
const year = ref<number>(new Date().getFullYear());


export const useCurrentMonth = () => {

  const next = () => {
    month.value = month.value === 11 ? 1 : month.value + 2;
    year.value =  month.value === 11 ? year.value + 1 : year.value;
  }

  const previous = () => {
    month.value = month.value === 0 ? 12 : month.value -1;
    year.value =  month.value === 0 ? year.value - 1 : year.value;
  }

  const fromDate = (date: Date) => {
    year.value = date.getFullYear();
    month.value = date.getMonth();
  } 

  const date = computed((): Date => {
    return new Date();
  })

  return {
    month,
    year,
    next,
    previous,
    fromDate,
    date,
  }
}
