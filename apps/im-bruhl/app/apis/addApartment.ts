import { ApartmentType } from "@app/types";

export const addApartment = async (apartment: Partial<ApartmentType>) => {
  await fetch("/api/apartment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(apartment),
  });
};
