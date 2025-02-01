import { HouseContextType } from "@app/types";
import { createContext } from "react";

export const HouseContext = createContext<HouseContextType | undefined>(
  undefined,
);
