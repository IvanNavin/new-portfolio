import { ApartmentType } from "@app/types";

export async function updateApartment(body: Partial<ApartmentType>) {
  const response = await fetch("/api/apartment", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to update apartment");
  }

  return response.json();
}
