export const fetchApartmentList = async () => {
  const response = await fetch("/api/apartment-list", { method: "GET" });
  return response.json();
};
