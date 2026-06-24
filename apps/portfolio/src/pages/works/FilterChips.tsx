import { useMemo } from "react";
import { clsxm } from "@/lib/utils";
import type { Filters } from "./WorksFilter";

type Props = {
  filters: Filters;
  onRemove: (value: string) => void;
};

/** Active-filter pills with a remove "x". */
export const FilterChips = ({ filters, onRemove }: Props) => {
  const values = useMemo(
    () => [...filters.workType, ...filters.stack],
    [filters],
  );

  return (
    <div className="my-4 flex min-h-6 flex-wrap gap-2">
      {values.map((value) => (
        <span
          key={value}
          className="relative inline-flex gap-1 rounded-full bg-[#ddd] py-0 pr-5 pl-3 text-black"
        >
          <span className="capitalize">{value}</span>
          <span
            onClick={() => onRemove(value)}
            className={clsxm(
              "inline-flex cursor-pointer items-center justify-center text-[12px] select-none",
              "absolute top-1/2 right-2 -translate-y-1/2",
              "transition-all duration-300 ease-linear hover:text-red-600",
            )}
          >
            x
          </span>
        </span>
      ))}
    </div>
  );
};
