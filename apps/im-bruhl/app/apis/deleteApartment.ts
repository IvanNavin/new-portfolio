export const deleteApartment = async (apartmentId: string) => {
  await fetch(`/api/apartment?id=${apartmentId}`, { method: "DELETE" });
};
