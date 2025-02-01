import { HouseContext } from "@app/context";
import { useContext } from "react";

export const useHouseContext = () => {
  const context = useContext(HouseContext);

  if (!context) {
    throw new Error("useHouseContext must be used within a HouseProvider");
  }

  return context;
};
