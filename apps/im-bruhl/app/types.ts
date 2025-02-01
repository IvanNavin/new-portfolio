import { Dispatch, SetStateAction } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyType = any;

export type ApartmentType = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  apartmentListId: string;
  apartmentList: ApartmentListType;
};

export type ApartmentListType = {
  id: string;
  name: string;
  apartments: ApartmentType[];
  createdAt: Date;
  updatedAt: Date;
};

export type HouseContextType = {
  apartments: ApartmentType[];
  handleDeleteApartment: (id: string) => void;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  currentApartment: ApartmentType | null;
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  isModalOpen: boolean;
  handleAddApartment: () => void;
  newApartmentName: string;
  setNewApartmentName: Dispatch<SetStateAction<string>>;
  firstCleaningDate: Date | null;
  setFirstCleaningDate: Dispatch<SetStateAction<Date | null>>;
  dates: Date[];
  isApartmentLoading: boolean;
  hasAccess: boolean;
  setHasAccess: Dispatch<SetStateAction<string>>;
  updateApartmentList: () => Promise<void>;
};
