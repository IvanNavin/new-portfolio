import dayjs from "dayjs";

export const findFirstMonday = (date: Date) => {
  return dayjs(date).startOf("week").add(1, "day").toDate();
};
