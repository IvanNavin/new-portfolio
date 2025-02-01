import { addApartment } from "@app/apis/addApartment";
import { deleteApartment } from "@app/apis/deleteApartment";
import { fetchApartmentList } from "@app/apis/fetchApartmentList";
import { ApartmentListType, ApartmentType } from "@app/types";
import { findFirstMonday } from "@app/utils/findFirstMonday";
import { useSessionStorage } from "@mantine/hooks";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export const useHouse = (apartmentList: ApartmentListType) => {
  const [apartments, setApartments] = useState<ApartmentType[]>(
    apartmentList?.apartments || [],
  );
  const [currentBuilding, setCurrentBuilding] = useState<
    ApartmentListType | undefined
  >(apartmentList);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApartmentName, setNewApartmentName] = useState("");
  const [firstCleaningDate, setFirstCleaningDate] = useState<Date | null>(null);
  const [hasAccess, setHasAccess] = useSessionStorage({
    key: "access",
    defaultValue: "false",
  });
  const dates = apartments?.map((a) => a.startDate);
  const [isApartmentLoading, setIsApartmentLoading] = useState(false);

  const updateApartmentList = async () => {
    setIsApartmentLoading(true);
    await fetchApartmentList().then((data: ApartmentListType[]) => {
      const firstBuilding = data?.[0];

      setCurrentBuilding(firstBuilding);
      setApartments(firstBuilding?.apartments || []);
    });
    setIsApartmentLoading(false);
  };

  // Add new apartment
  const handleAddApartment = async () => {
    if (!currentBuilding?.id) return;
    const firstMonday = findFirstMonday(firstCleaningDate || new Date());
    setIsApartmentLoading(true);

    await addApartment({
      name: newApartmentName,
      startDate: firstMonday,
      apartmentListId: currentBuilding.id,
    });

    await updateApartmentList();

    setFirstCleaningDate(null);
    setNewApartmentName("");
    setIsModalOpen(false);
    setIsApartmentLoading(false);
  };

  const getApartmentForDay = (currentDay: Date) => {
    if (!apartments.length) return null;

    // Sort the apartments by startDate to ensure the correct order
    const sortedApartments = apartments.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

    const firstStartDate = new Date(sortedApartments[0].startDate);

    // Calculation of the difference in weeks
    const weeksDifference = Math.floor(
      dayjs(currentDay).diff(firstStartDate, "week"),
    );

    if (weeksDifference < 0) return null; // Якщо дата до старту графіка

    // Define an apartment by index
    const apartmentIndex = weeksDifference % sortedApartments.length;
    return sortedApartments[apartmentIndex];
  };

  const currentApartment = getApartmentForDay(new Date());

  const handleDeleteApartment = async (id: string) => {
    await deleteApartment(id);
    await updateApartmentList();
  };

  useEffect(() => {
    void updateApartmentList();
  }, []);

  return {
    apartments,
    handleDeleteApartment,
    setIsModalOpen,
    currentApartment,
    selectedDate,
    setSelectedDate,
    isModalOpen,
    handleAddApartment,
    newApartmentName,
    setNewApartmentName,
    firstCleaningDate,
    setFirstCleaningDate,
    dates,
    isApartmentLoading,
    hasAccess: hasAccess === "true",
    setHasAccess,
    updateApartmentList,
  };
};
