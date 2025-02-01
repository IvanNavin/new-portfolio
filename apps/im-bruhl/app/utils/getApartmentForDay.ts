import { ApartmentType } from "@app/types";
import dayjs from "dayjs";

export const getApartmentForDay = (
  apartments: ApartmentType[],
  currentDay: Date,
) => {
  if (!apartments.length) return null;

  const activeApartments = apartments.filter(
    (apartment) =>
      !apartment.endDate ||
      dayjs(currentDay).isBefore(apartment.endDate, "day"),
  );

  if (!activeApartments.length) return null;

  const sortedApartments = activeApartments.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  const firstStartDate = new Date(sortedApartments[0].startDate);

  const weeksDifference = Math.floor(
    dayjs(currentDay).diff(firstStartDate, "week"),
  );

  if (weeksDifference < 0) return null;

  const apartmentIndex = weeksDifference % sortedApartments.length;
  return sortedApartments[apartmentIndex];
};
